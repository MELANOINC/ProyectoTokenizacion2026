import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "NOTORIUS — Agente tokenizador de propiedades y activos | Melano Inc",
  description:
    "Tokenizá propiedades y activos reales con smart contracts, KYC, whitelist y emisión controlada. Hub Melano: Alenya capta, Luxia convierte, NOTORIUS tokeniza.",
  openGraph: {
    title: "NOTORIUS — Agente tokenizador | Melano Inc",
    description:
      "Smart Contract Engine + Tokenization Platform para inmobiliarias y emisores.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
