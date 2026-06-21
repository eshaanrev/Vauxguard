"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
          },
        });
        if (error) throw error;
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "12px",
    background: "#0a0a0a",
    border: "1px solid #222",
    color: "#fff",
    fontFamily: "'Courier New', monospace",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "'Courier New', monospace",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "#111",
          border: "1px solid #222",
          padding: "32px",
        }}
      >
        <h1
          style={{
            letterSpacing: "10px",
            fontSize: "24px",
            margin: 0,
            textAlign: "center",
          }}
        >
          VAUXGUARD
        </h1>
        <p
          style={{
            color: "#666",
            letterSpacing: "3px",
            textAlign: "center",
            marginTop: "8px",
            fontSize: "12px",
          }}
        >
          REAL VOICES ONLY.
        </p>

        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={onKeyDown}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onKeyDown}
          style={inputStyle}
        />

        {error && (
          <p style={{ color: "#f44336", fontSize: "13px", marginTop: "12px" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            background: loading ? "#222" : "#fff",
            color: loading ? "#666" : "#0a0a0a",
            border: "none",
            fontFamily: "'Courier New', monospace",
            fontWeight: "bold",
            letterSpacing: "2px",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading
            ? "..."
            : mode === "signin"
            ? "SIGN IN"
            : "SIGN UP"}
        </button>

        <p
          style={{
            color: "#666",
            fontSize: "13px",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          {mode === "signin" ? "No account?" : "Have an account?"}{" "}
          <span
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
            }}
            style={{ color: "#4caf50", cursor: "pointer" }}
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
}
