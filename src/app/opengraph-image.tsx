import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NOTORIUS — Agente tokenizador | Melano Inc";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px",
          background:
            "linear-gradient(135deg, #0E0E14 0%, #14141C 55%, #1A1A12 100%)",
          color: "#F0EADC",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
            color: "#C2993F",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 6,
          }}
        >
          MELANO INC
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          NOTORIUS
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 34,
            fontWeight: 600,
            color: "#E8E4D8",
            maxWidth: 900,
          }}
        >
          Agente tokenizador de propiedades y activos
        </div>
        <div style={{ marginTop: 18, fontSize: 24, color: "#A8A49A" }}>
          Alenya capta → Luxia convierte → NOTORIUS tokeniza
        </div>
        <div style={{ marginTop: 48, fontSize: 22, color: "#C2993F" }}>
          notorius.melanoinc.com
        </div>
      </div>
    ),
    { ...size },
  );
}
