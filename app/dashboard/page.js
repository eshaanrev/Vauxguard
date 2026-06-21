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
          color: "#444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.9rem",
        }}
      >
        Loading…
      </div>
    );
  }

  const isPremium = profile.tier === "premium";
  const atLimit = !isPremium && profile.analyses_used >= 5;
  const used = profile.analyses_used;
  const pct = Math.min((used / 5) * 100, 100);
  const warnLevel = used >= 4;
  const analyzeDisabled = !audio || loading || atLimit;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#ededed",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        {/* Top nav bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
            paddingBottom: "20px",
            borderBottom: "1px solid #1c1c1c",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{ fontSize: "0.9rem", color: "#ededed", fontWeight: 600 }}
            >
              Vauxguard
            </span>
            <span style={{ color: "#333" }}>·</span>
            <span style={{ fontSize: "0.85rem", color: "#555" }}>
              {user.email}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                background: isPremium ? "#0d2a1a" : "#1a1a1a",
                border: `1px solid ${isPremium ? "#1a4d2e" : "#2a2a2a"}`,
                color: isPremium ? "#3ecf8e" : "#666",
                borderRadius: "20px",
                padding: "3px 12px",
                fontSize: "0.75rem",
              }}
            >
              {isPremium ? "Premium" : "Free plan"}
            </span>
            {!isPremium && (
              <Link
                href="/pricing"
                style={{
                  background: "#3ecf8e",
                  color: "#0a0a0a",
                  borderRadius: "6px",
                  padding: "5px 14px",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  marginLeft: "8px",
                  textDecoration: "none",
                }}
              >
                Upgrade
              </Link>
            )}
            <button
              onClick={signOut}
              style={{
                background: "none",
                border: "none",
                color: "#444",
                fontSize: "0.8rem",
                cursor: "pointer",
                marginLeft: "12px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Usage card (free tier only) */}
        {!isPremium && (
          <div
            style={{
              background: "#111",
              border: "1px solid #1c1c1c",
              borderRadius: "8px",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.82rem", color: "#888" }}>
                Analyses this month
              </div>
              <div
                style={{
                  fontSize: "1.4rem",
                  color: "#ededed",
                  fontWeight: 600,
                  marginTop: "2px",
                }}
              >
                {used}
                <span style={{ color: "#444" }}>/5</span>
              </div>
            </div>
            <div>
              <div
                style={{
                  background: "#1c1c1c",
                  borderRadius: "4px",
                  height: "6px",
                  width: "120px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: warnLevel ? "#f59e0b" : "#3ecf8e",
                    width: `${pct}%`,
                    height: "100%",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#444",
                  marginTop: "4px",
                  textAlign: "right",
                }}
              >
                Resets monthly
              </div>
            </div>
          </div>
        )}

        {/* Main analysis card */}
        <div
          style={{
            background: "#111",
            border: "1px solid #1c1c1c",
            borderRadius: "12px",
            padding: "28px",
          }}
        >
          <div
            style={{
              fontSize: "0.68rem",
              color: "#444",
              letterSpacing: "0.12em",
              marginBottom: "16px",
            }}
          >
            AUDIO INPUT
          </div>

          {/* Upload zone */}
          <label
            style={{
              display: "block",
              border: `2px dashed ${fileName ? "#1a4d2e" : "#1c1c1c"}`,
              borderRadius: "8px",
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color 0.15s",
              background: fileName ? "#0a1a10" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!fileName) {
                e.currentTarget.style.borderColor = "#2a2a2a";
                e.currentTarget.style.background = "#0f0f0f";
              }
            }}
            onMouseLeave={(e) => {
              if (!fileName) {
                e.currentTarget.style.borderColor = "#1c1c1c";
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <input
              type="file"
              accept="audio/*"
              onChange={handleFile}
              style={{ display: "none" }}
            />
            <span
              style={{
                fontSize: "1.4rem",
                color: "#333",
                display: "block",
                marginBottom: "8px",
              }}
            >
              ↑
            </span>
            <div style={{ fontSize: "0.88rem", color: "#555" }}>
              Drop audio file here
            </div>
            <div
              style={{ fontSize: "0.75rem", color: "#333", marginTop: "4px" }}
            >
              MP3, WAV, M4A, OGG supported
            </div>
            {fileName && (
              <div
                style={{
                  color: "#3ecf8e",
                  fontSize: "0.82rem",
                  marginTop: "8px",
                }}
              >
                ✓ {fileName}
              </div>
            )}
          </label>

          {/* Divider row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "20px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#1c1c1c" }} />
            <span style={{ color: "#333", fontSize: "0.78rem" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#1c1c1c" }} />
          </div>

          {/* Record button */}
          <button
            onClick={toggleRecord}
            style={{
              width: "100%",
              background: "#161616",
              border: `1px solid ${recording ? "#f44336" : "#222"}`,
              borderRadius: "6px",
              color: recording ? "#f44336" : "#666",
              padding: "11px 16px",
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            {recording
              ? "⏹  Stop recording  ·  recording in progress"
              : "⏺  Record from microphone"}
          </button>

          {/* Analyze button */}
          <button
            onClick={analyze}
            disabled={analyzeDisabled}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "13px",
              borderRadius: "6px",
              fontSize: "0.92rem",
              fontWeight: 500,
              background: loading
                ? "#1a1a1a"
                : analyzeDisabled
                ? "#161616"
                : "#ededed",
              color: loading
                ? "#555"
                : analyzeDisabled
                ? "#333"
                : "#0a0a0a",
              border:
                !loading && analyzeDisabled ? "1px solid #1c1c1c" : "none",
              cursor: analyzeDisabled ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Analyzing…" : "Analyze voice"}
          </button>

          {/* Limit reached state */}
          {atLimit && (
            <div
              style={{
                background: "#1a0f00",
                border: "1px solid #3d2200",
                borderRadius: "8px",
                padding: "14px 18px",
                marginTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#f59e0b", fontSize: "0.85rem" }}>
                ⚠ Monthly limit reached
              </span>
              <Link
                href="/pricing"
                style={{
                  color: "#ededed",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                Upgrade to Premium →
              </Link>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div
              style={{
                background: "#1a0a0a",
                border: "1px solid #3d1a1a",
                borderRadius: "8px",
                padding: "14px 18px",
                marginTop: "16px",
                color: "#f44336",
                fontSize: "0.82rem",
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Result section */}
          {result && (
            <div
              style={{
                marginTop: "20px",
                borderRadius: "12px",
                padding: "24px",
                animation: "fadeIn 0.3s ease",
                background:
                  result.verdict === "REAL" ? "#0a1a10" : "#1a0a0a",
                border: `1px solid ${
                  result.verdict === "REAL" ? "#1a3d24" : "#3d1a1a"
                }`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    color: result.verdict === "REAL" ? "#3ecf8e" : "#f44336",
                  }}
                >
                  <span>●</span>
                  {result.verdict === "REAL"
                    ? "REAL VOICE"
                    : "SYNTHETIC VOICE DETECTED"}
                </div>
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: result.verdict === "REAL" ? "#3ecf8e" : "#f44336",
                    background:
                      result.verdict === "REAL" ? "#0d2a1a" : "#2a0d0d",
                    border: `1px solid ${
                      result.verdict === "REAL" ? "#1a4d2e" : "#4d1a1a"
                    }`,
                    borderRadius: "20px",
                    padding: "3px 12px",
                  }}
                >
                  {result.confidence}% confidence
                </div>
              </div>

              {result.reasoning ? (
                <>
                  <div
                    style={{
                      borderTop: `1px solid ${
                        result.verdict === "REAL" ? "#1a3d24" : "#3d1a1a"
                      }`,
                      margin: "16px 0",
                    }}
                  />
                  <p
                    style={{
                      color: "#888",
                      fontSize: "0.85rem",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {result.reasoning}
                  </p>
                </>
              ) : (
                <div
                  style={{
                    background: "#161616",
                    border: "1px solid #1c1c1c",
                    borderRadius: "6px",
                    padding: "12px 16px",
                    marginTop: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#555", fontSize: "0.8rem" }}>
                    Detailed analysis available on Premium
                  </span>
                  <Link
                    href="/pricing"
                    style={{
                      color: "#3ecf8e",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    Upgrade →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
