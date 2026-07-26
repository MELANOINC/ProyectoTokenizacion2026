import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-sm font-bold tracking-[0.28em] text-white"
        >
          NOTORIUS
        </Link>
        <nav className="flex items-center gap-5 text-sm text-white/85">
          <Link href="#plataforma" className="hidden sm:inline hover:text-white">
            Plataforma
          </Link>
          <Link href="#ciclo" className="hidden sm:inline hover:text-white">
            Ciclo de vida
          </Link>
          <Link
            href="/dashboard/contratos"
            className="border border-white/35 px-4 py-2 text-white transition hover:border-white hover:bg-white/10"
          >
            Conectar MetaMask
          </Link>
        </nav>
      </div>
    </header>
  );
}
