"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [audio, setAudio] = useState(null);
  const [fileName, setFileName] = useState("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
    }
    load();
  }, []);

  function blobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAudio({ blob: file, mediaType: file.type || "audio/mpeg" });
    setFileName(file.name);
    setResult(null);
    setError("");
  }

  async function toggleRecord() {
    if (recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/wav")
        ? "audio/wav"
        : MediaRecorder.isTypeSupported("audio/ogg")
        ? "audio/ogg"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudio({ blob, mediaType: mimeType });
        const ext = mimeType.split("/")[1].split(";")[0];
        setFileName(`recording.${ext}`);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setResult(null);
      setError("");
    } catch (err) {
      setError("Microphone access denied");
    }
  }

  async function analyze() {
    if (!audio) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const base64 = await blobToBase64(audio.blob);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64, mediaType: audio.blob.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      const { data: updated } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(updated);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!user || !profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "#666",
          fontFamily: "'Courier New', monospace",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  const isPremium = profile.tier === "premium";
  const atLimit = !isPremium && profile.analyses_used >= 5;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "'Courier New', monospace",
        padding: "32px 24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1 style={{ letterSpacing: "8px", fontSize: "22px", margin: 0 }}>
              VAUXGUARD
            </h1>
            <p style={{ color: "#666", fontSize: "13px", margin: "6px 0 0" }}>
              {user.email}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                color: isPremium ? "#4caf50" : "#aaa",
                fontSize: "13px",
                border: "1px solid #222",
                padding: "6px 10px",
              }}
            >
              {isPremium
                ? "PREMIUM"
                : `FREE · ${profile.analyses_used}/5`}
            </span>
            {!isPremium && (
              <Link
                href="/pricing"
                style={{
                  color: "#4caf50",
                  fontSize: "13px",
                  textDecoration: "none",
                  border: "1px solid #4caf50",
                  padding: "6px 10px",
                }}
              >
                UPGRADE
              </Link>
            )}
            <button
              onClick={signOut}
              style={{
                background: "transparent",
                color: "#666",
                border: "1px solid #222",
                padding: "6px 10px",
                fontFamily: "'Courier New', monospace",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              OUT
            </button>
          </div>
        </div>

        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            padding: "28px",
            marginTop: "32px",
          }}
        >
          <label
            style={{
              display: "block",
              border: "1px dashed #333",
              padding: "32px",
              textAlign: "center",
              cursor: "pointer",
              color: fileName ? "#fff" : "#666",
            }}
          >
            <input
              type="file"
              accept="audio/*"
              onChange={handleFile}
              style={{ display: "none" }}
            />
            {fileName || "Drop audio file or click to upload"}
          </label>

          <div
            style={{
              textAlign: "center",
              color: "#444",
              margin: "16px 0",
              letterSpacing: "2px",
            }}
          >
            or
          </div>

          <button
            onClick={toggleRecord}
            style={{
              width: "100%",
              padding: "14px",
              background: recording ? "#f44336" : "transparent",
              color: "#fff",
              border: `1px solid ${recording ? "#f44336" : "#222"}`,
              fontFamily: "'Courier New', monospace",
              letterSpacing: "2px",
              cursor: "pointer",
            }}
          >
            {recording ? "■ STOP RECORDING" : "● RECORD FROM MIC"}
          </button>

          <button
            onClick={analyze}
            disabled={!audio || loading || atLimit}
            style={{
              width: "100%",
              padding: "16px",
              marginTop: "20px",
              background: !audio || loading || atLimit ? "#1a1a1a" : "#fff",
              color: !audio || loading || atLimit ? "#555" : "#0a0a0a",
              border: "none",
              fontFamily: "'Courier New', monospace",
              fontWeight: "bold",
              letterSpacing: "2px",
              cursor: !audio || loading || atLimit ? "default" : "pointer",
            }}
          >
            {loading ? "ANALYZING..." : "ANALYZE VOICE"}
          </button>

          {loading && (
            <p style={{ color: "#666", textAlign: "center", marginTop: "16px" }}>
              Analyzing audio...
            </p>
          )}

          {atLimit && (
            <p style={{ color: "#f44336", textAlign: "center", marginTop: "16px" }}>
              Free limit reached.{" "}
              <Link href="/pricing" style={{ color: "#f44336" }}>
                Upgrade →
              </Link>
            </p>
          )}

          {error && (
            <p style={{ color: "#f44336", textAlign: "center", marginTop: "16px" }}>
              {error}
            </p>
          )}

          {result && (
            <div
              style={{
                marginTop: "28px",
                padding: "24px",
                background: "#0a0a0a",
                border: "1px solid #222",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "44px",
                  fontWeight: "bold",
                  letterSpacing: "6px",
                  color: result.verdict === "REAL" ? "#4caf50" : "#f44336",
                }}
              >
                {result.verdict}
              </div>
              <div style={{ color: "#aaa", marginTop: "8px" }}>
                {result.confidence}% confidence
              </div>
              {result.reasoning ? (
                <p
                  style={{
                    color: "#ccc",
                    fontSize: "14px",
                    marginTop: "20px",
                    lineHeight: "1.6",
                    textAlign: "left",
                  }}
                >
                  {result.reasoning}
                </p>
              ) : (
                <p style={{ color: "#666", fontSize: "13px", marginTop: "20px" }}>
                  <Link href="/pricing" style={{ color: "#4caf50" }}>
                    Upgrade to Premium for detailed reasoning
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
