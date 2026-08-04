import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { GuideDemoBanner } from "@/components/dashboard/GuideDemoBanner";

const links = [
  { href: "/dashboard/contratos", label: "Contratos" },
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/admin", label: "Admin" },
  { href: "/dashboard/emisor", label: "Emisor" },
  { href: "/dashboard/inversores", label: "Inversores" },
];

export function DashboardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grain min-h-screen">
      <header className="border-b border-[var(--line)] bg-[var(--s1)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image
                src="/melano-mark.svg"
                alt="Melano Inc"
                width={32}
                height={32}
                className="rounded-full"
              />
            </Link>
            <div>
              <Link
                href="/"
                className="font-[family-name:var(--font-display)] text-sm font-bold tracking-[0.24em] text-[var(--w)]"
              >
                NOTORIUS
              </Link>
              <p className="mt-0.5 text-sm text-[var(--g1)]">
                Plataforma tokenizadora · Melano Inc
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border border-[var(--line)] px-3 py-2 text-sm text-[var(--w2)] transition hover:border-[var(--gold-lo)] hover:text-[var(--w)]"
              >
                {link.label}
              </Link>
            ))}
            <AdminLogoutButton />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--w)]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--w2)]">{subtitle}</p>
        <div className="mt-10">
          <Suspense fallback={null}>
            <GuideDemoBanner />
          </Suspense>
          {children}
        </div>
      </main>
    </div>
  );
}
