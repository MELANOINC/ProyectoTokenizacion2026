const agents = [
  {
    name: "aLENYA",
    role: "Capta y califica",
    href: "/alenya",
    body: "WhatsApp + IA: responde, scorea y agenda leads inmobiliarios.",
  },
  {
    name: "LUXIA",
    role: "Convierte y opera",
    href: "https://luxia.melanoinc.com",
    body: "CRM con pipeline, WhatsApp y automatizaciones comerciales.",
  },
  {
    name: "NOTORIUS",
    role: "Tokeniza y emite",
    href: "/precios",
    body: "Smart contracts, KYC on-chain, mint y transferencias controladas.",
    current: true,
  },
];

export function EcosystemSection() {
  return (
    <section id="ecosistema" className="relative py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
          Hub Melano Inc
        </p>
        <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--w)] md:text-5xl">
          Alenya capta. Luxia convierte. NOTORIUS tokeniza.
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--w2)]">
          Tres agentes, un estándar: captación, operación comercial y
          tokenización de activos reales.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {agents.map((agent) => (
            <a
              key={agent.name}
              href={agent.href}
              className={`panel block p-6 transition hover:border-[var(--gold-lo)] ${
                agent.current ? "border-[var(--gold-lo)]" : ""
              }`}
              {...(agent.href.startsWith("http")
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
            >
              <p className="font-mono text-xs tracking-[0.18em] text-[var(--g1)] uppercase">
                {agent.role}
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--w)]">
                {agent.name}
              </h3>
              <p className="mt-3 text-[var(--w2)]">{agent.body}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
