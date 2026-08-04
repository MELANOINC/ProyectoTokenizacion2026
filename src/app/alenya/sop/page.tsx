import type { Metadata } from "next";
import Link from "next/link";
import { AlenyaShell } from "@/components/alenya/AlenyaShell";

export const metadata: Metadata = {
  title: "SOP cliente · aLENYA",
  description: "Guía de uso diario del Command Center aLENYA.",
};

export default function AlenyaSopPage() {
  return (
    <AlenyaShell nav="marketing">
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
          SOP
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--w)]">
          Guía de uso diario
        </h1>
        <div className="prose-alenya mt-8 space-y-6 text-[var(--w2)]">
          <section>
            <h2 className="text-xl font-semibold text-[var(--w)]">
              1. Qué hace aLENYA sola
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Responde cada WhatsApp en segundos, 24/7.</li>
              <li>Califica: operación, zona, presupuesto, urgencia.</li>
              <li>Pasa tu Calendly en el momento justo.</li>
              <li>Guarda conversación + ficha con score.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-[var(--w)]">
              2. Tu rutina (5 minutos)
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>
                Abrí el{" "}
                <Link href="/alenya/dashboard" className="text-[var(--gold)]">
                  Command Center
                </Link>
                .
              </li>
              <li>Priorizá 🔥 CALIENTES (score ≥ 70).</li>
              <li>Tocá WhatsApp y retomá en caliente.</li>
              <li>Tibios (40–69) a seguimiento; nuevos los trabaja aLENYA.</li>
            </ol>
            <p className="mt-4 text-[var(--w)]">
              Regla de oro: caliente que no se llama en el día, es venta de la
              competencia.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-[var(--w)]">
              3. Handoff humano
            </h2>
            <p className="mt-3">
              Si el prospecto pide hablar con alguien, marcá{" "}
              <strong className="text-[var(--w)]">handoff</strong> en el panel y
              contestá vos desde WhatsApp.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-[var(--w)]">4. Datos</h2>
            <p className="mt-3">
              Actualizá inventario / FAQs en{" "}
              <Link href="/alenya/datos" className="text-[var(--gold)]">
                Datos
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </AlenyaShell>
  );
}
