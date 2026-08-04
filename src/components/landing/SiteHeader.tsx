import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/melano-mark.svg"
            alt="Melano Inc"
            width={36}
            height={36}
            className="rounded-full"
            priority
          />
          <span className="leading-tight">
            <strong className="block font-[family-name:var(--font-display)] text-sm tracking-[0.18em] text-[var(--w)]">
              NOTORIUS
            </strong>
            <small className="block text-[11px] text-[var(--g1)]">
              Melano Inc · Tokenización
            </small>
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-sm text-[var(--w2)] md:gap-4">
          <Link href="#guia" className="hidden hover:text-[var(--w)] sm:inline">
            Guía
          </Link>
          <Link href="#plataforma" className="hidden hover:text-[var(--w)] sm:inline">
            Plataforma
          </Link>
          <Link href="#ecosistema" className="hidden hover:text-[var(--w)] md:inline">
            Ecosistema
          </Link>
          <Link href="/precios" className="hidden hover:text-[var(--w)] md:inline">
            Precios
          </Link>
          <Link
            href="/precios"
            className="border border-[var(--gold-lo)] bg-[var(--gold)] px-4 py-2 font-semibold text-[#14110a] transition hover:bg-[var(--gold-hi)]"
          >
            Contratar
          </Link>
        </nav>
      </div>
    </header>
  );
}
