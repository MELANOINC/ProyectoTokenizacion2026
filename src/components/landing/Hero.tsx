import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden text-white">
      <div
        className="hero-pan absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=80')",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(16,24,22,0.88) 8%, rgba(16,24,22,0.55) 48%, rgba(16,24,22,0.28) 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-6 pb-16 pt-28 md:px-10 md:pb-24">
        <p className="animate-rise font-[family-name:var(--font-display)] text-[clamp(3.4rem,12vw,8.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">
          NOTORIUS
        </p>
        <h1 className="animate-rise-delay mt-5 max-w-xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight md:text-3xl">
          El motor de contratos y tokenización para activos reales.
        </h1>
        <p className="animate-rise-late mt-4 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
          Emisión, whitelist, transferencias controladas e historial on-chain —
          del deed al token, en un solo ciclo.
        </p>
        <div className="animate-rise-late mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard/contratos"
            className="bg-[var(--brass)] px-6 py-3 font-semibold text-[var(--ink)] transition hover:bg-[var(--brass-deep)] hover:text-white"
          >
            Firmar y desplegar
          </Link>
          <Link
            href="/dashboard"
            className="relative px-2 py-3 text-white/90 transition hover:text-white"
          >
            Ver dashboard
            <span className="cta-line absolute bottom-2 left-2 right-2 h-px bg-white/80" />
          </Link>
        </div>
      </div>
    </section>
  );
}
