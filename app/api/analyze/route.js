import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import wav from "node-wav";

ffmpeg.setFfmpegPath(ffmpegPath);

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const isPremium = profile.tier === "premium";

    if (!isPremium && profile.analyses_used >= 5) {
      return NextResponse.json(
        { error: "Free analysis limit reached. Upgrade to Premium." },
        { status: 403 }
      );
    }

    const { audio, mediaType } = await request.json();

    if (!audio || !mediaType) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    const audioBuffer = Buffer.from(audio, "base64");

    let featureDescription;
    let decodable = false;

    const inputTempFile = path.join(os.tmpdir(), `${crypto.randomUUID()}.input`);
    const outputTempFile = path.join(os.tmpdir(), `${crypto.randomUUID()}.wav`);

    try {
      await fs.writeFile(inputTempFile, audioBuffer);

      await new Promise((resolve, reject) => {
        ffmpeg(inputTempFile)
          .audioFrequency(16000)
          .audioChannels(1)
          .format("wav")
          .on("end", resolve)
          .on("error", reject)
          .save(outputTempFile);
      });

      const wavBuffer = await fs.readFile(outputTempFile);
      const decoded = wav.decode(wavBuffer);
      const samples = decoded.channelData[0];

      // 1. RMS energy: sqrt(mean of squared samples)
      const rms = Math.sqrt(
        samples.reduce((sum, s) => sum + s * s, 0) / samples.length
      );

      // 2. Zero crossing rate: count sign changes / total samples
      let signChanges = 0;
      for (let i = 1; i < samples.length; i++) {
        if (samples[i - 1] < 0 !== samples[i] < 0) {
          signChanges++;
        }
      }
      const zcr = signChanges / samples.length;

      // 3. Energy variance: variance of per-window RMS over 800-sample
      // (50ms at 16khz) windows.
      const WINDOW = 800;
      const windowRms = [];
      for (let start = 0; start + WINDOW <= samples.length; start += WINDOW) {
        let sq = 0;
        for (let n = 0; n < WINDOW; n++) {
          const s = samples[start + n];
          sq += s * s;
        }
        windowRms.push(Math.sqrt(sq / WINDOW));
      }
      let energyVariance = 0;
      if (windowRms.length > 0) {
        const meanRms =
          windowRms.reduce((a, b) => a + b, 0) / windowRms.length;
        energyVariance =
          windowRms.reduce((a, b) => a + (b - meanRms) ** 2, 0) /
          windowRms.length;
      }

      // 4. Silence ratio: fraction of samples with abs(sample) < 0.01
      let silentSamples = 0;
      for (let i = 0; i < samples.length; i++) {
        if (Math.abs(samples[i]) < 0.01) silentSamples++;
      }
      const silenceRatio = silentSamples / samples.length;

      // 5 & 6. Spectral centroid + flatness.
      // Overlapping 2048-sample frames (1024 hop), DFT approximation over the
      // first 256 bins, then average the magnitude spectrum across frames.
      const FRAME = 2048;
      const HOP = 1024;
      const BINS = 256;
      const avgMag = new Float64Array(BINS);
      let frameCount = 0;
      for (let start = 0; start + FRAME <= samples.length; start += HOP) {
        for (let k = 0; k < BINS; k++) {
          let real = 0;
          let imag = 0;
          for (let n = 0; n < FRAME; n++) {
            const angle = (2 * Math.PI * k * n) / FRAME;
            const s = samples[start + n];
            real += s * Math.cos(angle);
            imag += s * Math.sin(angle);
          }
          avgMag[k] += Math.sqrt(real * real + imag * imag);
        }
        frameCount++;
      }
      let centroid = 0;
      let flatness = 0;
      if (frameCount > 0) {
        for (let k = 0; k < BINS; k++) {
          avgMag[k] /= frameCount;
        }
        let logSum = 0;
        let arithSum = 0;
        let weightedSum = 0;
        for (let k = 0; k < BINS; k++) {
          logSum += Math.log(avgMag[k] + 1e-10);
          arithSum += avgMag[k];
          weightedSum += k * avgMag[k];
        }
        // centroid normalized by bin count (256)
        centroid = weightedSum / (arithSum + 1e-10) / BINS;
        const geometricMean = Math.exp(logSum / BINS);
        const arithmeticMean = arithSum / BINS;
        flatness = geometricMean / (arithmeticMean + 1e-10);
      }

      // 7. Pitch regularity: variance of autocorrelation peak lag (lags 50-300,
      // ~53-320hz) across 10 evenly spaced frames.
      const MIN_LAG = 50;
      const MAX_LAG = 300;
      const PITCH_FRAME = 2048;
      const pitchFrames = 10;
      const peakLags = [];
      const available = samples.length - PITCH_FRAME;
      if (available > 0) {
        for (let f = 0; f < pitchFrames; f++) {
          const start =
            pitchFrames > 1
              ? Math.floor((available * f) / (pitchFrames - 1))
              : 0;
          let bestLag = MIN_LAG;
          let bestCorr = -Infinity;
          for (let lag = MIN_LAG; lag <= MAX_LAG; lag++) {
            let corr = 0;
            for (let n = 0; n + lag < PITCH_FRAME; n++) {
              corr += samples[start + n] * samples[start + n + lag];
            }
            if (corr > bestCorr) {
              bestCorr = corr;
              bestLag = lag;
            }
          }
          peakLags.push(bestLag);
        }
      }
      let pitchVariance = 0;
      if (peakLags.length > 0) {
        const meanLag =
          peakLags.reduce((a, b) => a + b, 0) / peakLags.length;
        pitchVariance =
          peakLags.reduce((a, b) => a + (b - meanLag) ** 2, 0) /
          peakLags.length;
      }

      featureDescription = `Acoustic feature analysis for deepfake voice detection:

ENERGY FEATURES:
- RMS energy: ${rms} (typical real speech: 0.02-0.15)
- Energy variance across 50ms frames: ${energyVariance} (real speech >0.002, synthetic often <0.001 due to unnatural consistency)
- Silence ratio: ${silenceRatio} (real speech: 0.1-0.3, TTS often <0.05 continuous or >0.5 over-padded)

SPECTRAL FEATURES:
- Spectral centroid (normalized): ${centroid} (real speech: 0.1-0.35, outside this range suggests synthesis)
- Spectral flatness: ${flatness} (near 0.0 = natural speech, near 1.0 = synthetic/tonal — strongest single indicator)

TEMPORAL FEATURES:
- Zero crossing rate: ${zcr} (real speech: 0.02-0.08)
- Pitch regularity variance: ${pitchVariance} (real speech >5, synthetic often <5 due to unnatural pitch consistency)

DETECTION GUIDANCE:
- Spectral flatness and energy variance are the strongest indicators — weight them most heavily
- A single feature in synthetic range is weak signal. Multiple features aligned is strong signal.
- Be calibrated: only return confidence >85% when 3+ features point the same direction
- Return confidence 50-65% when features are mixed or ambiguous`;

      decodable = true;
    } catch {
      decodable = false;
    } finally {
      await fs.rm(inputTempFile, { force: true });
      await fs.rm(outputTempFile, { force: true });
    }

    if (!decodable) {
      featureDescription = `The audio could not be decoded (unsupported format: ${mediaType}). No acoustic features are available.

Since no features could be extracted, return {"verdict":"REAL","confidence":50} as a fallback.`;
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt =
      "You are an expert audio forensics analyst specializing in synthetic speech detection. You receive structured acoustic feature vectors extracted from 16khz mono audio. Each feature has known typical ranges for real vs synthetic speech provided in the input. Analyze all 7 features together — do not over-index on any single one. Consider that modern TTS systems (ElevenLabs, OpenAI TTS, Google TTS) are sophisticated and may fool individual features while failing on others. Be appropriately uncertain when features are mixed. Respond only with valid JSON, no markdown.";

    const userPrompt = isPremium
      ? `${featureDescription}\n\nRespond ONLY with valid JSON: {"verdict":"REAL" or "FAKE","confidence":0-100,"reasoning":"2-3 sentences"}`
      : `${featureDescription}\n\nRespond ONLY with valid JSON: {"verdict":"REAL" or "FAKE","confidence":0-100}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = message.content.find((b) => b.type === "text")?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse analysis result");
    }
    const parsed = JSON.parse(jsonMatch[0]);

    await supabase
      .from("profiles")
      .update({ analyses_used: profile.analyses_used + 1 })
      .eq("id", user.id);

    const result = {
      verdict: parsed.verdict,
      confidence: parsed.confidence,
    };
    if (isPremium && parsed.reasoning) {
      result.reasoning = parsed.reasoning;
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Analysis failed" },
      { status: 500 }
    );
  }
}
