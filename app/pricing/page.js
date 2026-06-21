"use client";

import Link from "next/link";

export default function Pricing() {
  const cardStyle = {
    flex: 1,
    minWidth: "260px",
    background: "#111",
    border: "1px solid #222",
    padding: "32px",
  };

  const featureStyle = {
    color: "#aaa",
    fontSize: "14px",
    padding: "6px 0",
    borderBottom: "1px solid #1a1a1a",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "'Courier New', monospace",
        padding: "48px 24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <h1
          style={{
            letterSpacing: "12px",
            fontSize: "28px",
            textAlign: "center",
            margin: 0,
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
          }}
        >
          REAL VOICES ONLY.
        </p>

        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "48px",
            flexWrap: "wrap",
          }}
        >
          <div style={cardStyle}>
            <h2 style={{ margin: 0, letterSpacing: "4px" }}>FREE</h2>
            <p style={{ fontSize: "28px", margin: "12px 0" }}>
              $0
              <span style={{ fontSize: "14px", color: "#666" }}> /forever</span>
            </p>
            <div style={{ marginTop: "20px" }}>
              <div style={featureStyle}>5 analyses / month</div>
              <div style={featureStyle}>File upload</div>
              <div style={featureStyle}>Mic recording</div>
              <div style={featureStyle}>Verdict + confidence</div>
            </div>
            <Link
              href="/login"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: "28px",
                padding: "12px",
                background: "#fff",
                color: "#0a0a0a",
                textDecoration: "none",
                fontWeight: "bold",
                letterSpacing: "2px",
              }}
            >
              GET STARTED
            </Link>
          </div>

          <div style={{ ...cardStyle, border: "1px solid #4caf50" }}>
            <h2 style={{ margin: 0, letterSpacing: "4px", color: "#4caf50" }}>
              PREMIUM
            </h2>
            <p style={{ fontSize: "28px", margin: "12px 0" }}>
              $9.99
              <span style={{ fontSize: "14px", color: "#666" }}> /month</span>
            </p>
            <div style={{ marginTop: "20px" }}>
              <div style={featureStyle}>Unlimited analyses</div>
              <div style={featureStyle}>File upload</div>
              <div style={featureStyle}>Mic recording</div>
              <div style={featureStyle}>Detailed reasoning</div>
            </div>
            <div
              style={{
                marginTop: "28px",
                padding: "12px",
                background: "#1a1a1a",
                color: "#666",
                textAlign: "center",
                fontWeight: "bold",
                letterSpacing: "2px",
              }}
            >
              COMING SOON
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "40px" }}>
          <Link href="/dashboard" style={{ color: "#666" }}>
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
