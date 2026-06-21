"use client";

import Link from "next/link";

export default function Pricing() {
  const freeFeatures = [
    "5 analyses per month",
    "File upload",
    "Mic recording",
    "Verdict + confidence score",
  ];

  const premiumFeatures = [
    "Unlimited analyses",
    "File upload",
    "Mic recording",
    "Verdict + confidence score",
    "Detailed acoustic reasoning",
  ];

  const enterpriseFeatures = [
    "Unlimited analyses",
    "File upload + mic recording",
    "Dedicated wav2vec2 ML model (not LLM reasoning)",
    "92-95% detection accuracy",
    "Detailed acoustic forensics report",
    "Priority API access",
    "SLA guarantee",
    "Custom integration support",
  ];

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
          maxWidth: "520px",
          margin: "0 auto",
          padding: "60px 24px",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            color: "#444",
            fontSize: "0.82rem",
            cursor: "pointer",
            marginBottom: "40px",
            display: "inline-block",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
        >
          ← Dashboard
        </Link>

        <h1
          style={{
            fontSize: "1.8rem",
            color: "#ededed",
            fontWeight: 600,
            margin: "0 0 8px",
          }}
        >
          Simple pricing
        </h1>
        <p
          style={{
            color: "#666",
            fontSize: "0.95rem",
            margin: "0 0 40px",
          }}
        >
          Start free, upgrade when you need more.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Free card */}
          <div
            style={{
              background: "#111",
              border: "1px solid #1c1c1c",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#ededed",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                Free
              </span>
              <span style={{ color: "#888", fontSize: "0.9rem" }}>
                $0 / month
              </span>
            </div>
            <div
              style={{ borderTop: "1px solid #1c1c1c", margin: "16px 0" }}
            />
            {freeFeatures.map((feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "#444" }}>✓</span>
                <span style={{ color: "#888", fontSize: "0.85rem" }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Premium card */}
          <div
            style={{
              background: "#0d1a10",
              border: "1px solid #1a3d24",
              borderRadius: "12px",
              padding: "24px",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                color: "#3ecf8e",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                background: "#0a2a14",
                border: "1px solid #1a4d2e",
                borderRadius: "4px",
                padding: "2px 8px",
              }}
            >
              RECOMMENDED
            </span>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#ededed",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                Premium
              </span>
              <span style={{ color: "#888", fontSize: "0.9rem" }}>
                $9.99 / month
              </span>
            </div>
            <div
              style={{ borderTop: "1px solid #1a3d24", margin: "16px 0" }}
            />
            {premiumFeatures.map((feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "#3ecf8e" }}>✓</span>
                <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
                  {feature}
                </span>
              </div>
            ))}
            <button
              disabled
              style={{
                width: "100%",
                marginTop: "20px",
                background: "#3ecf8e",
                color: "#0a0a0a",
                border: "none",
                borderRadius: "6px",
                padding: "11px",
                fontWeight: 500,
                fontSize: "0.9rem",
                cursor: "default",
                opacity: 0.6,
              }}
            >
              Coming soon
            </button>
          </div>

          {/* Enterprise card */}
          <div
            style={{
              background: "#0a0f1a",
              border: "1px solid #1a2a4d",
              borderTop: "2px solid #3b82f6",
              borderRadius: "12px",
              padding: "24px",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                color: "#3b82f6",
                fontSize: "0.65rem",
                background: "#0a1628",
                border: "1px solid #1a2a4d",
                borderRadius: "4px",
                padding: "2px 8px",
              }}
            >
              MOST ACCURATE
            </span>
            <div
              style={{
                color: "#3b82f6",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
              }}
            >
              ENTERPRISE
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <span
                style={{
                  color: "#ededed",
                  fontSize: "1.6rem",
                  fontWeight: 600,
                }}
              >
                Custom
              </span>
              <a
                href="mailto:enterprise@vauxguard.com"
                style={{
                  color: "#3b82f6",
                  fontSize: "0.7rem",
                  textDecoration: "none",
                }}
              >
                contact us
              </a>
            </div>
            <div
              style={{ borderTop: "1px solid #1a2a4d", margin: "16px 0" }}
            />
            {enterpriseFeatures.map((feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "#3b82f6" }}>✓</span>
                <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
                  {feature}
                </span>
              </div>
            ))}
            <button
              disabled
              style={{
                width: "100%",
                marginTop: "20px",
                background: "#0a1628",
                color: "#3b82f6",
                border: "1px solid #1a2a4d",
                borderRadius: "6px",
                padding: "12px",
                fontWeight: 500,
                fontSize: "0.9rem",
                cursor: "default",
                opacity: 0.6,
              }}
            >
              CONTACT SALES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
