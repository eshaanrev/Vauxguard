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

  const labelStyle = {
    display: "block",
    fontSize: "0.8rem",
    color: "#888",
    marginBottom: "6px",
  };

  const inputStyle = {
    width: "100%",
    background: "#0a0a0a",
    border: "1px solid #222",
    borderRadius: "6px",
    color: "#ededed",
    fontSize: "0.9rem",
    padding: "10px 14px",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#ededed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#111",
          border: "1px solid #1c1c1c",
          borderRadius: "12px",
          padding: "32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#444",
            letterSpacing: "0.15em",
            marginBottom: "24px",
          }}
        >
          VAUXGUARD
        </div>

        <h1
          style={{
            fontSize: "1.3rem",
            color: "#ededed",
            fontWeight: 600,
            margin: "0 0 8px",
          }}
        >
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#666",
            margin: "0 0 28px",
          }}
        >
          Enter your credentials to continue
        </p>

        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={onKeyDown}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#333")}
          onBlur={(e) => (e.target.style.borderColor = "#222")}
        />

        <div style={{ height: "16px" }} />

        <label style={labelStyle}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onKeyDown}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#333")}
          onBlur={(e) => (e.target.style.borderColor = "#222")}
        />

        {error && (
          <p
            style={{
              color: "#f44336",
              fontSize: "0.8rem",
              marginTop: "8px",
              marginBottom: 0,
            }}
          >
            ⚠ {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "24px",
            background: "#ededed",
            color: "#0a0a0a",
            border: "none",
            borderRadius: "6px",
            padding: "11px",
            fontWeight: 500,
            fontSize: "0.9rem",
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading
            ? mode === "signin"
              ? "Signing in..."
              : "Creating account..."
            : mode === "signin"
            ? "Sign in"
            : "Create account"}
        </button>

        <div
          style={{
            borderTop: "1px solid #1c1c1c",
            margin: "24px 0",
          }}
        />

        <p
          style={{
            fontSize: "0.83rem",
            color: "#666",
            textAlign: "center",
            margin: 0,
          }}
        >
          {mode === "signin" ? "No account?" : "Have an account?"}{" "}
          <span
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
            }}
            style={{
              color: "#ededed",
              cursor: "pointer",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}
