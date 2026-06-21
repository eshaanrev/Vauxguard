import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "'Courier New', monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          letterSpacing: "16px",
          margin: 0,
          fontWeight: "bold",
        }}
      >
        VAUXGUARD
      </h1>
      <p style={{ color: "#666", letterSpacing: "4px", marginTop: "16px" }}>
        REAL VOICES ONLY.
      </p>
      <div style={{ display: "flex", gap: "16px", marginTop: "48px" }}>
        <Link
          href="/login"
          style={{
            background: "#fff",
            color: "#0a0a0a",
            padding: "14px 28px",
            textDecoration: "none",
            fontFamily: "'Courier New', monospace",
            fontWeight: "bold",
            letterSpacing: "2px",
          }}
        >
          GET STARTED
        </Link>
        <Link
          href="/pricing"
          style={{
            background: "transparent",
            color: "#fff",
            padding: "14px 28px",
            textDecoration: "none",
            fontFamily: "'Courier New', monospace",
            fontWeight: "bold",
            letterSpacing: "2px",
            border: "1px solid #222",
          }}
        >
          PRICING
        </Link>
      </div>
    </div>
  );
}
