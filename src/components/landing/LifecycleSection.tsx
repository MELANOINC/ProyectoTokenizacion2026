const steps = [
  "Registrar emisor y activo",
  "Desplegar contrato security token",
  "Onboarding + KYC de inversores",
  "Whitelist de wallets",
  "Mint y distribución",
  "Transferencias controladas",
];

export function LifecycleSection() {
  return (
    <section id="ciclo" className="bg-[var(--ink)] py-24 text-[var(--limestone)] md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="text-sm font-semibold tracking-[0.22em] text-[var(--brass)] uppercase">
          Flujo operativo
        </p>
        <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight md:text-5xl">
          Del deed al token, sin fricción operativa.
        </h2>
        <ol className="mt-12 grid gap-0 border-t border-white/15 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step}
              className="border-b border-white/15 px-0 py-8 sm:px-6 sm:odd:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n+1)]:pl-0"
            >
              <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-[var(--brass)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 text-xl font-medium text-white">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
