import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentación",
  description:
    "Whitepaper, manual legal y documentación técnica de NOTORIUS — plataforma de tokenización Melano Inc.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Documentación NOTORIUS",
    description:
      "Arquitectura, whitepaper y notas legales del agente tokenizador NOTORIUS.",
    url: "/docs",
  },
};

const docs = [
  {
    title: "README técnico",
    href: "https://github.com/melanoinc/proyectotokenizacion2026/blob/main/docs/README.md",
    body: "Arquitectura, API y notas de persistencia.",
  },
  {
    title: "Whitepaper (draft)",
    href: "https://github.com/melanoinc/proyectotokenizacion2026/blob/main/docs/WHITEPAPER.md",
    body: "Problema, solución, asset classes y modelo de negocio.",
  },
  {
    title: "Manual legal (borrador)",
    href: "https://github.com/melanoinc/proyectotokenizacion2026/blob/main/docs/MANUAL-LEGAL.md",
    body: "Notas preliminares CNV / security tokens Argentina.",
  },
  {
    title: "Contracts",
    href: "https://github.com/melanoinc/proyectotokenizacion2026/blob/main/contracts/README.md",
    body: "IdentityRegistry + SecurityToken (ERC-3643 style).",
  },
];

export default function DocsPage() {
  return (
    <main className="grain min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-sm font-bold tracking-[0.24em] text-[var(--w)]"
        >
          NOTORIUS
        </Link>
        <h1 className="mt-8 font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-[var(--w)]">
          Documentación
        </h1>
        <p className="mt-4 text-lg text-[var(--w2)]">
          Material de producto y legal draft del motor de tokenización.
        </p>
        <div className="mt-12 space-y-8">
          {docs.map((doc) => (
            <a
              key={doc.title}
              href={doc.href}
              className="block border-t border-[var(--line)] pt-6 transition hover:text-[var(--gold-hi)]"
              target="_blank"
              rel="noreferrer"
            >
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
                {doc.title}
              </h2>
              <p className="mt-2 text-[var(--w2)]">{doc.body}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
