import Link from "next/link";

export default function Home() {
  const stats = [
    { value: "< 2s", label: "Analysis time" },
    { value: "100%", label: "Offline safe (Pi)" },
    { value: "Free", label: "To get started" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#ededed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div
          style={{
            fontSize: "0.7rem",
            color: "#444",
            letterSpacing: "0.15em",
            marginBottom: "16px",
          }}
        >
          VAUXGUARD
        </div>
        <h1
          style={{
            fontSize: "2.2rem",
            color: "#ededed",
            fontWeight: 600,
            lineHeight: 1.3,
            margin: "0 0 12px",
          }}
        >
          Detect deepfake voices.
        </h1>
        <p
          style={{
            fontSize: "0.95rem",
            color: "#888",
            lineHeight: 1.6,
            margin: "0 0 40px",
          }}
        >
          Upload or record audio and get an instant AI verdict on whether the
          voice is real or synthetic.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <Link
            href="/login"
            style={{
              background: "#ededed",
              color: "#0a0a0a",
              borderRadius: "6px",
              padding: "10px 24px",
              fontWeight: 500,
              fontSize: "0.9rem",
              border: "none",
              textDecoration: "none",
            }}
          >
            GET STARTED
          </Link>
          <Link
            href="/pricing"
            style={{
              background: "transparent",
              border: "1px solid #2a2a2a",
              color: "#888",
              borderRadius: "6px",
              padding: "10px 24px",
              fontWeight: 500,
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            PRICING
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            marginTop: "48px",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              {i > 0 && (
                <div
                  style={{
                    width: "1px",
                    height: "32px",
                    background: "#1c1c1c",
                  }}
                />
              )}
              <div>
                <div
                  style={{
                    color: "#ededed",
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ color: "#444", fontSize: "0.72rem", marginTop: "4px" }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
