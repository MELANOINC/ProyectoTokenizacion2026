import Link from "next/link";
import { CTA } from "@/lib/cta";

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
            "linear-gradient(105deg, rgba(4,4,6,0.95) 6%, rgba(4,4,6,0.82) 40%, rgba(4,4,6,0.42) 100%)",
        }}
        aria-hidden
      />
      <div className="melano-orb absolute inset-0 opacity-80" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-6 pb-16 pt-28 md:px-10 md:pb-24">
        <p className="animate-rise max-w-2xl font-[family-name:var(--font-display)] text-[clamp(1.35rem,3.6vw,2.15rem)] font-semibold leading-snug tracking-[-0.02em] text-[var(--gold-hi)]">
          Del primer WhatsApp al security token.
          <span className="block text-[var(--w)]">Sin perder el lead en el camino.</span>
        </p>

        <p className="animate-rise-delay mt-6 font-[family-name:var(--font-display)] text-[clamp(3rem,10vw,6.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-[var(--w)]">
          MELANO INC
        </p>

        <h1 className="animate-rise-delay mt-5 max-w-2xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-[var(--w)] md:text-4xl">
          Capta. Convierte. Tokeniza.
        </h1>

        <p className="animate-rise-late mt-4 max-w-xl text-base leading-relaxed text-[var(--w2)] md:text-lg">
          aLENYA abre la conversación. LUXIA cierra la operación. NOTORIUS
          tokeniza el activo — un solo stack para inmobiliarias que quieren
          escalar.
        </p>

        <div className="animate-rise-late mt-8 flex flex-wrap items-center gap-3">
          <Link href="/precios" className="btn-primary">
            Ver planes y comprar
          </Link>
          <a
            href={CTA.calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost relative"
          >
            Agendar diagnóstico
            <span className="cta-line absolute bottom-2 left-4 right-4 h-px bg-[var(--gold)]/70" />
          </a>
          <Link href="#stack" className="btn-ghost">
            Ver el stack
          </Link>
        </div>
      </div>
    </section>
  );
}
