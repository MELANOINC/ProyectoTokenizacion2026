import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { CTA } from "@/lib/cta";
import { getPlan } from "@/lib/billing/plans";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Gracias",
  description: "Confirmación de compra Melano Inc.",
  path: "/gracias",
  index: false,
});

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const plan = getPlan(sp.plan);
  const status = sp.status || "approved";
  const pending = status === "pending";

  return (
    <>
      <SiteHeader />
      <main className="pt-24">
        <section className="mx-auto max-w-3xl px-6 py-20 md:px-10">
          <p className="font-mono text-xs tracking-[0.22em] text-[var(--mint)] uppercase">
            {pending ? "Pago pendiente" : "Pago recibido"}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--w)] md:text-5xl">
            {pending
              ? "Estamos esperando la confirmación de Mercado Pago."
              : "Gracias. Ya tenés el primer paso hecho."}
          </h1>
          <p className="mt-5 text-lg text-[var(--w2)]">
            {plan
              ? `Plan: ${plan.name} (${plan.priceLabel}). `
              : ""}
            El equipo Melano te escribe a tu email de facturación para onboarding
            y activación. El panel operativo no se abre solo: lo habilitamos
            cuando tu servicio está listo.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={CTA.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Escribinos por WhatsApp
            </a>
            <Link href="/" className="btn-ghost">
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
