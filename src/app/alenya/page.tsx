import type { Metadata } from "next";
import Link from "next/link";
import { AlenyaShell } from "@/components/alenya/AlenyaShell";

export const metadata: Metadata = {
  title: "aLENYA · Command Center | Melano Inc",
  description:
    "Agente WhatsApp que responde, califica y agenda. Command Center con leads calientes en tiempo real.",
  robots: { index: true, follow: true },
};

export default function AlenyaLandingPage() {
  return (
    <AlenyaShell nav="marketing">
      <main>
        <section className="relative mx-auto flex min-h-[85svh] w-full max-w-6xl flex-col justify-end px-6 pb-16 pt-24 md:px-10 md:pb-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            aria-hidden
            style={{
              background:
                "radial-gradient(circle at 70% 30%, rgba(194,153,63,0.12), transparent 45%), radial-gradient(circle at 20% 80%, rgba(45,212,168,0.08), transparent 40%)",
            }}
          />
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--mint-b)] bg-[var(--mint-bg)] px-3 py-1 text-xs font-medium tracking-[0.14em] text-[var(--mint)] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--mint)] [animation:pulse-dot_1.6s_ease_infinite]" />
              Respondiendo leads ahora
            </div>
            <p className="font-[family-name:var(--font-display)] text-[clamp(3rem,10vw,6.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-[var(--w)]">
              aLENYA
            </p>
            <h1 className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-[var(--w)] md:text-3xl">
              Tu agente WhatsApp que nunca duerme.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--w2)] md:text-lg">
              Responde en segundos, califica con score 0–100 y te deja los
              calientes listos para llamar en el Command Center — mismo
              estándar visual que Luxia y NOTORIUS.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/precios" className="btn-primary">
                Ver planes y contratar
              </Link>
              <Link href="#flujo" className="btn-ghost">
                Ver flujo
              </Link>
              <Link
                href="/alenya/login?returnTo=/alenya/dashboard"
                className="btn-ghost"
              >
                Ya soy cliente
              </Link>
            </div>
          </div>
        </section>

        <section id="flujo" className="border-t border-[var(--line)] bg-[var(--s1)] py-24">
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
              Flujo
            </p>
            <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--w)]">
              Tres pasos. Cero fricción.
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  n: "01",
                  t: "WhatsApp llega",
                  d: "Meta Cloud API entrega el mensaje. Idempotencia activa: sin respuestas duplicadas.",
                },
                {
                  n: "02",
                  t: "IA califica",
                  d: "Extrae zona, presupuesto, operación y score de intención con el tono de tu negocio.",
                },
                {
                  n: "03",
                  t: "Agenda + panel",
                  d: "Pasa Calendly a tiempo. El lead caliente aparece en el Command Center para llamar hoy.",
                },
              ].map((s) => (
                <article key={s.n} className="border-t border-[var(--line)] pt-6">
                  <span className="font-mono text-sm tracking-[0.2em] text-[var(--gold)]">
                    {s.n}
                  </span>
                  <h3 className="mt-3 text-2xl font-semibold text-[var(--w)]">
                    {s.t}
                  </h3>
                  <p className="mt-3 text-[var(--w2)]">{s.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-[var(--line)] py-10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-[var(--g1)] md:px-10">
            <p>© Melano Inc · aLENYA · AI. Automation. Impact.</p>
            <div className="flex gap-5">
              <Link href="/precios" className="hover:text-[var(--gold)]">
                Precios
              </Link>
              <Link
                href="/alenya/login?returnTo=/alenya/dashboard"
                className="hover:text-[var(--gold)]"
              >
                Acceso cliente
              </Link>
              <Link href="/alenya/sop" className="hover:text-[var(--gold)]">
                SOP
              </Link>
              <a href="https://luxia.melanoinc.com" className="hover:text-[var(--gold)]">
                Luxia
              </a>
              <Link href="/" className="hover:text-[var(--gold)]">
                NOTORIUS
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </AlenyaShell>
  );
}
