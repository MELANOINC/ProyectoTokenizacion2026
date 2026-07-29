const steps = [
  "Conectar MetaMask en Polygon",
  "Firmar acuerdo EIP-712",
  "Deploy IdentityRegistry",
  "Deploy SecurityToken",
  "KYC + whitelist on-chain",
  "Mint y transferencias controladas",
];

export function LifecycleSection() {
  return (
    <section id="ciclo" className="py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
          Flujo operativo
        </p>
        <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--w)] md:text-5xl">
          Del deed al token, sin fricción.
        </h2>
        <ol className="mt-12 grid gap-0 border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step}
              className="border-b border-[var(--line)] py-8 sm:px-6 sm:odd:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n+1)]:pl-0"
            >
              <span className="font-mono text-sm tracking-[0.2em] text-[var(--gold)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 text-xl font-medium text-[var(--w)]">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
