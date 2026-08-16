export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
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
            "linear-gradient(105deg, rgba(4,4,6,0.94) 8%, rgba(4,4,6,0.78) 42%, rgba(4,4,6,0.45) 100%)",
        }}
        aria-hidden
      />
      <div className="melano-orb absolute inset-0 opacity-80" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-6 pb-16 pt-28 md:px-10 md:pb-24">
        <div className="animate-rise mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--gold-lo)] bg-[var(--gold-bg)] px-3 py-1 text-xs font-medium tracking-[0.14em] text-[var(--gold)] uppercase">
          Próximamente
        </div>

        <p className="animate-rise font-[family-name:var(--font-display)] text-[clamp(3.2rem,11vw,7.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-[var(--w)]">
          NOTORIUS
        </p>

        <h1 className="animate-rise-delay mt-5 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-[var(--w)] md:text-5xl">
          Se viene NOTORIUS.
        </h1>

        <p className="animate-rise-late mt-4 max-w-2xl text-lg leading-relaxed text-[var(--w2)] md:text-2xl">
          La nueva era de la tokenización de activos reales está por comenzar.
        </p>
      </div>
    </section>
  );
}
