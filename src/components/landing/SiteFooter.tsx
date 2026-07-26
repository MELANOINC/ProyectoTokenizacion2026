import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--paper)] py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--ink)]">
            NOTORIUS™
          </p>
          <p className="mt-2 max-w-md text-[var(--ink-soft)]">
            MELANO INC · Smart Contract Engine + Tokenization Platform
          </p>
        </div>
        <div className="flex gap-5 text-sm text-[var(--slate)]">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/docs">Docs</Link>
          <a href="https://github.com/melanoinc/proyectotokenizacion2026">Repo</a>
        </div>
      </div>
    </footer>
  );
}
