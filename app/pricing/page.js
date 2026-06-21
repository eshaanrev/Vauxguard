"use client";

import Link from "next/link";

const tiers = [
  {
    id: "free",
    label: "FREE",
    price: "$0",
    sub: "/ month",
    subColor: "#666",
    accent: "#888",
    checkColor: "#444",
    featureColor: "#888",
    background:
      "linear-gradient(160deg, #131313 0%, #0e0e0e 100%)",
    border: "1px solid #1c1c1c",
    borderTop: "2px solid #2a2a2a",
    glow: "rgba(255,255,255,0.04)",
    badge: null,
    button: null,
    features: [
      "5 analyses per month",
      "File upload",
      "Mic recording",
      "Verdict + confidence score",
    ],
  },
  {
    id: "premium",
    label: "PREMIUM",
    price: "$9.99",
    sub: "/ month",
    subColor: "#666",
    accent: "#3ecf8e",
    checkColor: "#3ecf8e",
    featureColor: "#aaa",
    background:
      "linear-gradient(160deg, #0f2014 0%, #0b160e 100%)",
    border: "1px solid #1a3d24",
    borderTop: "2px solid #3ecf8e",
    glow: "rgba(62,207,142,0.18)",
    badge: {
      text: "RECOMMENDED",
      color: "#3ecf8e",
      background: "#0a2a14",
      border: "1px solid #1a4d2e",
    },
    button: {
      text: "Coming soon",
      background: "#3ecf8e",
      color: "#0a0a0a",
      border: "none",
    },
    features: [
      "Unlimited analyses",
      "File upload",
      "Mic recording",
      "Verdict + confidence score",
      "Detailed acoustic reasoning",
    ],
  },
  {
    id: "enterprise",
    label: "ENTERPRISE",
    price: "Custom",
    sub: "contact us",
    subHref: "mailto:enterprise@vauxguard.com",
    accent: "#3b82f6",
    checkColor: "#3b82f6",
    featureColor: "#aaa",
    background:
      "linear-gradient(160deg, #0c1322 0%, #080d18 100%)",
    border: "1px solid #1a2a4d",
    borderTop: "2px solid #3b82f6",
    glow: "rgba(59,130,246,0.20)",
    badge: {
      text: "MOST ACCURATE",
      color: "#3b82f6",
      background: "#0a1628",
      border: "1px solid #1a2a4d",
    },
    button: {
      text: "CONTACT SALES",
      background: "#0a1628",
      color: "#3b82f6",
      border: "1px solid #1a2a4d",
    },
    features: [
      "Unlimited analyses",
      "File upload + mic recording",
      "Dedicated wav2vec2 ML model (not LLM reasoning)",
      "92-95% detection accuracy",
      "Detailed acoustic forensics report",
      "Priority API access",
      "SLA guarantee",
      "Custom integration support",
    ],
  },
];

function TierCard({ tier, index }) {
  return (
    <div
      style={{
        flex: "1 1 300px",
        minWidth: "280px",
        maxWidth: "360px",
        display: "flex",
        flexDirection: "column",
        background: tier.background,
        border: tier.border,
        borderTop: tier.borderTop,
        borderRadius: "14px",
        padding: "28px 24px",
        position: "relative",
        boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset",
        transition:
          "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease",
        animation: "fadeIn 0.5s ease both",
        animationDelay: `${index * 0.08}s`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = `0 18px 40px -12px ${tier.glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 1px 0 rgba(255,255,255,0.03) inset";
      }}
    >
      {tier.badge && (
        <span
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            color: tier.badge.color,
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            background: tier.badge.background,
            border: tier.badge.border,
            borderRadius: "4px",
            padding: "2px 8px",
          }}
        >
          {tier.badge.text}
        </span>
      )}

      <div
        style={{
          color: tier.accent,
          fontSize: "0.65rem",
          letterSpacing: "0.12em",
          fontWeight: 600,
        }}
      >
        {tier.label}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "8px",
          marginTop: "10px",
        }}
      >
        <span
          style={{
            color: "#ededed",
            fontSize: "1.6rem",
            fontWeight: 600,
          }}
        >
          {tier.price}
        </span>
        {tier.subHref ? (
          <a
            href={tier.subHref}
            style={{
              color: tier.accent,
              fontSize: "0.7rem",
              textDecoration: "none",
            }}
          >
            {tier.sub}
          </a>
        ) : (
          <span style={{ color: tier.subColor, fontSize: "0.8rem" }}>
            {tier.sub}
          </span>
        )}
      </div>

      <div
        style={{
          borderTop: tier.border,
          margin: "20px 0",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {tier.features.map((feature) => (
          <div
            key={feature}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <span style={{ color: tier.checkColor, lineHeight: 1.4 }}>✓</span>
            <span
              style={{
                color: tier.featureColor,
                fontSize: "0.85rem",
                lineHeight: 1.4,
              }}
            >
              {feature}
            </span>
          </div>
        ))}
      </div>

      {tier.button && (
        <button
          disabled
          style={{
            width: "100%",
            marginTop: "auto",
            paddingTop: "12px",
            paddingBottom: "12px",
            background: tier.button.background,
            color: tier.button.color,
            border: tier.button.border,
            borderRadius: "6px",
            fontWeight: 500,
            fontSize: "0.9rem",
            cursor: "default",
            opacity: 0.6,
          }}
        >
          {tier.button.text}
        </button>
      )}
    </div>
  );
}

export default function Pricing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 50% -10%, #11131a 0%, #0a0a0a 60%)",
        color: "#ededed",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1080px",
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
            margin: "0 0 44px",
          }}
        >
          Start free, upgrade when you need more.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "stretch",
            gap: "20px",
          }}
        >
          {tiers.map((tier, index) => (
            <TierCard key={tier.id} tier={tier} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
