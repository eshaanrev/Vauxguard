import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath);

export const runtime = "nodejs";

const HF_MODEL_URL =
  "https://router.huggingface.co/models/Gustking/wav2vec2-large-xlsr-deepfake-audio-classification";

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

    const inputTempFile = path.join(os.tmpdir(), `${crypto.randomUUID()}.input`);
    const outputTempFile = path.join(os.tmpdir(), `${crypto.randomUUID()}.wav`);

    let wavBuffer;
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

      wavBuffer = await fs.readFile(outputTempFile);
    } finally {
      await fs.rm(inputTempFile, { force: true });
      await fs.rm(outputTempFile, { force: true });
    }

    const callHuggingFace = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        return await fetch(HF_MODEL_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/octet-stream",
          },
          body: wavBuffer,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
    };

    let hfResponse = await callHuggingFace();

    // If the model is still loading (503), wait 10s and retry once.
    if (hfResponse.status === 503) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      hfResponse = await callHuggingFace();
      if (hfResponse.status === 503) {
        return NextResponse.json(
          { error: "Model is warming up, please try again in 30 seconds" },
          { status: 503 }
        );
      }
    }

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      throw new Error(
        `Hugging Face API error (${hfResponse.status}): ${errText}`
      );
    }

    const predictions = await hfResponse.json();

    // Hugging Face returns [{"label":"fake","score":0.97},{"label":"real","score":0.03}]
    // (sometimes wrapped in an extra array). Normalize to a flat list.
    const scores = Array.isArray(predictions[0]) ? predictions[0] : predictions;

    if (!Array.isArray(scores) || scores.length === 0) {
      throw new Error("Could not parse analysis result");
    }

    const top = scores.reduce((a, b) => (b.score > a.score ? b : a));
    const verdict = top.label.toUpperCase();
    const confidence = Math.round(top.score * 100);

    await supabase
      .from("profiles")
      .update({ analyses_used: profile.analyses_used + 1 })
      .eq("id", user.id);

    const result = {
      verdict,
      confidence,
    };

    if (isPremium) {
      const realEntry = scores.find((s) => s.label.toLowerCase() === "real");
      const fakeEntry = scores.find((s) => s.label.toLowerCase() === "fake");
      const realScore = Math.round((realEntry?.score || 0) * 100);
      const fakeScore = Math.round((fakeEntry?.score || 0) * 100);
      result.reasoning = `Model confidence ${confidence}% ${verdict}. Real probability: ${realScore}%. Fake probability: ${fakeScore}%.`;
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Analysis failed" },
      { status: 500 }
    );
  }
}
