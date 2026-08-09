import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { CTA } from "@/lib/cta";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Diagnóstico",
  description:
    "Evaluá la tokenización de tu propiedad o activo con el equipo de NOTORIUS y Melano Inc.",
  path: "/precios",
});

export default function DiagnosticoPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-24">
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
          <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
            Diagnóstico estratégico
          </p>
          <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--w)] md:text-5xl">
            Evaluemos el activo antes de implementar.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[var(--w2)]">
            Cada proyecto requiere revisar el activo, la estructura jurídica,
            la jurisdicción, el modelo económico y el circuito de inversores.
          </p>

          <div className="panel mt-10 max-w-2xl rounded-2xl p-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--w)]">
              Implementación a medida
            </h2>
            <p className="mt-4 text-[var(--w2)]">
              Contanos qué propiedad o activo querés tokenizar. Te devolvemos
              una ruta concreta de validación, arquitectura y despliegue.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={CTA.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Consultar por WhatsApp
              </a>
              <a
                href={CTA.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                Agendar diagnóstico
              </a>
            </div>
          </div>

          <p className="mt-16 text-sm text-[var(--g1)]">
            ¿Ya trabajás con nosotros?{" "}
            <Link href="/admin/login" className="hover:text-[var(--w)]">
              Acceso interno
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
