import type { Metadata } from "next";
import Link from "next/link";
import { PricingGrid } from "@/components/billing/PricingGrid";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { CTA } from "@/lib/cta";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Precios",
  description:
    "Planes aLENYA y NOTORIUS. Pagá online con Mercado Pago y activá el servicio Melano Inc.",
  path: "/precios",
});

export default function PreciosPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-24">
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
          <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
            Contratar
          </p>
          <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--w)] md:text-5xl">
            Elegí el servicio. Pagá. Arrancamos.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[var(--w2)]">
            Checkout con Mercado Pago. Sin acceso al panel operativo hasta que
            el equipo Melano active tu cuenta.
          </p>

          <PricingGrid />

          <p className="mt-16 text-sm text-[var(--g1)]">
            ¿Preferís hablar antes?{" "}
            <a
              href={CTA.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gold)] hover:underline"
            >
              Agendá un diagnóstico
            </a>
            {" · "}
            <Link href="/admin/login" className="hover:text-[var(--w)]">
              Ya soy cliente / acceso interno
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
