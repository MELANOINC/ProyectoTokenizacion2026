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
            "linear-gradient(105deg, rgba(4,4,6,0.94) 8%, rgba(4,4,6,0.78) 42%, rgba(4,4,6,0.45) 100%)",
        }}
        aria-hidden
      />
      <div className="melano-orb absolute inset-0 opacity-80" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-6 pb-16 pt-28 md:px-10 md:pb-24">
        <div className="animate-rise mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--mint-b)] bg-[var(--mint-bg)] px-3 py-1 text-xs font-medium tracking-[0.14em] text-[var(--mint)] uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--mint)] [animation:pulse-dot_1.6s_ease_infinite]" />
          Agente tokenizador activo
        </div>

        <p className="animate-rise font-[family-name:var(--font-display)] text-[clamp(3.2rem,11vw,7.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-[var(--w)]">
          NOTORIUS
        </p>

        <h1 className="animate-rise-delay mt-5 max-w-2xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-[var(--w)] md:text-3xl">
          El agente que tokeniza propiedades y activos reales.
        </h1>

        <p className="animate-rise-late mt-4 max-w-xl text-base leading-relaxed text-[var(--w2)] md:text-lg">
          Del deed al security token: firmá acuerdos, desplegá contratos en
          Polygon, gestioná KYC/whitelist y emití con control — en el mismo
          estándar operativo que Luxia y Alenya.
        </p>

        <div className="animate-rise-late mt-8 flex flex-wrap items-center gap-3">
          <Link href="/dashboard/contratos" className="btn-primary">
            Firmar y desplegar
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
          <Link href="/dashboard" className="btn-ghost">
            Abrir plataforma
          </Link>
        </div>
      </div>
    </section>
  );
}
