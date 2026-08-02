import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/alenya/LogoutButton";

export function AlenyaShell({
  children,
  nav = "marketing",
}: {
  children: ReactNode;
  nav?: "marketing" | "panel";
}) {
  return (
    <div className="alenya-root min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(4,4,6,0.92)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <Link href="/alenya" className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-[var(--gold)] to-[var(--gold-hi)] font-[family-name:var(--font-display)] text-sm italic text-[var(--bg)]">
              a
            </span>
            <span>
              <strong className="block text-sm tracking-[0.18em] text-[var(--w)]">
                aLENYA
              </strong>
              <small className="block text-[11px] text-[var(--g1)]">
                Melano Inc · Command Center
              </small>
            </span>
          </Link>
          {nav === "marketing" ? (
            <nav className="flex items-center gap-3 text-sm">
              <Link
                href="/alenya#flujo"
                className="hidden text-[var(--w2)] hover:text-[var(--w)] sm:inline"
              >
                Flujo
              </Link>
              <Link
                href="/alenya/login?returnTo=/alenya/dashboard"
                className="border border-[var(--gold-lo)] bg-[var(--gold)] px-4 py-2 font-semibold text-[#14110a] transition hover:bg-[var(--gold-hi)]"
              >
                Abrir Command Center
              </Link>
            </nav>
          ) : (
            <nav className="flex items-center gap-3 text-sm text-[var(--w2)]">
              <Link href="/alenya/dashboard" className="hover:text-[var(--w)]">
                Leads
              </Link>
              <Link href="/alenya/datos" className="hover:text-[var(--w)]">
                Datos
              </Link>
              <LogoutButton />
            </nav>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
