export const metadata = {
  title: {
    default: "Vauxguard — Deepfake voice detection",
    template: "%s · Vauxguard",
  },
  description:
    "Upload or record audio and get an instant verdict on whether a voice is real or AI-synthesized, backed by acoustic feature analysis.",
  openGraph: {
    title: "Vauxguard — Deepfake voice detection",
    description:
      "Detect synthetic and deepfake voices from acoustic features, with a calibrated confidence score.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </head>
      <body
        style={{
          margin: 0,
          background: "#0a0a0a",
          color: "#ededed",
          fontFamily:
            "'Courier New', ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        {children}
      </body>
    </html>
  );
}
