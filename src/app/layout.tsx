import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Manrope } from "next/font/google";
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
  title: "Melano Inc — aLENYA · LUXIA · NOTORIUS",
  description:
    "Stack inmobiliario end-to-end: aLENYA capta, LUXIA convierte y NOTORIUS tokeniza propiedades y activos reales.",
  openGraph: {
    title: "Melano Inc — Capta. Convierte. Tokeniza.",
    description:
      "aLENYA, LUXIA y NOTORIUS: del lead en WhatsApp al security token en Polygon.",
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
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
