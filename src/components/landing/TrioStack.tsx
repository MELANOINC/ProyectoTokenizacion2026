import { ECOSYSTEM } from "@/lib/ecosystem";

const products = [
  {
    ...ECOSYSTEM.alenya,
    step: "01",
    verb: "Capta",
    body: "WhatsApp + IA: responde, scorea y agenda leads inmobiliarios en tiempo real.",
    image:
      "https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Conversación comercial en dispositivo móvil",
    cta: "Abrir aLENYA",
  },
  {
    ...ECOSYSTEM.luxia,
    step: "02",
    verb: "Convierte",
    body: "CRM con pipeline, WhatsApp y automatizaciones para cerrar la operación.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Panel operativo de conversión comercial",
    cta: "Abrir LUXIA",
  },
  {
    ...ECOSYSTEM.notorius,
    step: "03",
    verb: "Tokeniza",
    body: "Smart contracts, KYC, whitelist y emisión controlada en Polygon.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Fachada de activo inmobiliario tokenizable",
    cta: "Abrir NOTORIUS",
    localHref: "/dashboard/contratos",
  },
] as const;

export function TrioStack() {
  return (
    <section id="stack" className="relative">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
          Hub Melano · End-to-end
        </p>
        <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--w)] md:text-5xl">
          Tres agentes. Un pipeline.
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--w2)]">
          Del primer mensaje en WhatsApp a la emisión on-chain, sin romper el
          hilo comercial.
        </p>
      </div>

      {products.map((product, index) => {
        const reverse = index % 2 === 1;
        const href =
          "localHref" in product && product.localHref
            ? product.localHref
            : product.url;

        return (
          <article
            key={product.name}
            id={
              product.name === "aLENYA"
                ? "alenya"
                : product.name === "LUXIA"
                  ? "luxia"
                  : "notorius"
            }
            className="border-t border-[var(--line)]"
          >
            <div
              className={`mx-auto grid max-w-6xl items-stretch md:grid-cols-2 ${
                reverse ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div
                className="relative min-h-[42vh] bg-cover bg-center md:min-h-[560px]"
                style={{ backgroundImage: `url('${product.image}')` }}
                role="img"
                aria-label={product.imageAlt}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(4,4,6,0.15), rgba(4,4,6,0.55))",
                  }}
                  aria-hidden
                />
              </div>

              <div className="flex flex-col justify-center px-6 py-14 md:px-12 md:py-20">
                <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
                  {product.step} · {product.role}
                </p>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.4rem,6vw,4rem)] font-extrabold leading-none tracking-[-0.03em] text-[var(--w)]">
                  {product.name}
                </h3>
                <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--gold-hi)]">
                  {product.verb}
                </p>
                <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--w2)] md:text-lg">
                  {product.body}
                </p>
                <div className="mt-8">
                  <a
                    href={href}
                    className="btn-primary inline-block"
                    {...(href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {product.cta}
                  </a>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
