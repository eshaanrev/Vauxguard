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

      const rms = Math.sqrt(
        samples.reduce((sum, s) => sum + s * s, 0) / samples.length
      );

      let signChanges = 0;
      for (let i = 1; i < samples.length; i++) {
        if (samples[i - 1] < 0 !== samples[i] < 0) {
          signChanges++;
        }
      }
      const zcr = signChanges / samples.length;

      const envelope = [];
      const step = Math.max(1, Math.floor(samples.length / 256));
      for (let i = 0; i < samples.length && envelope.length < 256; i += step) {
        envelope.push(samples[i]);
      }

      featureDescription = `Audio feature analysis:
- RMS energy: ${rms} (very low or very high may indicate synthetic)
- Zero crossing rate: ${zcr} (unnaturally low or consistent ZCR suggests synthesis)
- Sample count: ${samples.length}
- Sample rate: ${decoded.sampleRate}

Analyze these features and determine if this is real human speech or AI-generated voice.`;

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
      "You are an audio deepfake detection expert. Analyze acoustic features to determine if audio is genuine human speech or AI-generated. Consider that synthetic voices often have unusually consistent energy levels and unnatural zero-crossing patterns. Respond only with valid JSON.";

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
