const capabilities = [
  {
    title: "Smart contracts auditables",
    body: "Plantillas ERC-3643 para security tokens sobre Polygon y Base.",
  },
  {
    title: "Emisión y mint controlado",
    body: "Solo wallets whitelistadas reciben tokens. Supply total siempre visible.",
  },
  {
    title: "KYC + inversores",
    body: "Registro, aprobación y trazabilidad listas para integrar un proveedor regulado.",
  },
  {
    title: "Operación para emisores",
    body: "Dashboard de emisión, transferencias controladas e historial on-chain.",
  },
];

export function PlatformSection() {
  return (
    <section id="plataforma" className="grain relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="text-sm font-semibold tracking-[0.22em] text-[var(--slate)] uppercase">
          Plataforma
        </p>
        <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--ink)] md:text-5xl">
          Ciclo completo de activos tokenizados.
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--ink-soft)]">
          No es solo un generador de contratos: administra emisión, inversores y
          compliance en una sola superficie.
        </p>

        <div className="mt-14 grid gap-10 md:grid-cols-2">
          {capabilities.map((item) => (
            <article key={item.title} className="border-t border-[var(--line)] pt-6">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-md text-[var(--ink-soft)]">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
