import { CTA } from "@/lib/cta";

const capabilities = [
  {
    title: "Firma EIP-712",
    body: "Acuerdo de tokenización firmado con MetaMask antes del deploy.",
  },
  {
    title: "Security tokens",
    body: "IdentityRegistry + SecurityToken (estilo ERC-3643) en Polygon.",
  },
  {
    title: "KYC + whitelist",
    body: "Solo wallets verificadas reciben y transfieren tokens.",
  },
  {
    title: "Emisión controlada",
    body: "Mint, supply total e historial on-chain para emisores e inversores.",
  },
];

export function PlatformSection() {
  return (
    <section id="plataforma" className="border-y border-[var(--line)] bg-[var(--s1)] py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
          Plataforma
        </p>
        <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--w)] md:text-5xl">
          Motor completo de tokenización.
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--w2)]">
          No es solo un generador de contratos: es el panel operativo para emitir
          y administrar activos tokenizados.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {capabilities.map((item) => (
            <article key={item.title} className="border-t border-[var(--line)] pt-6">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--w)]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-md text-[var(--w2)]">{item.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <a
            href={CTA.calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            Agendar diagnóstico
          </a>
        </div>
      </div>
    </section>
  );
}
