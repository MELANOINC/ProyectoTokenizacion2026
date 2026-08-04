import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/billing/CheckoutForm";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { getPlan, type PlanId } from "@/lib/billing/plans";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Comprar",
  description:
    "Checkout seguro con Mercado Pago para aLENYA y NOTORIUS — Melano Inc.",
  path: "/comprar",
});

export default async function ComprarPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const sp = await searchParams;
  const plan = getPlan(sp.plan);
  const defaultPlanId = (plan?.id ?? "alenya-pro") as PlanId;

  return (
    <>
      <SiteHeader />
      <main className="pt-24">
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-10 md:py-24">
          <div>
            <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
              Checkout
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--w)]">
              Pagar el servicio
            </h1>
            <p className="mt-4 max-w-lg text-[var(--w2)]">
              Te redirigimos a Mercado Pago. Al aprobar el pago, el equipo Melano
              te contacta para el onboarding y la activación.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-[var(--w2)]">
              <li>— Facturación a tu email</li>
              <li>— Activación manual por Melano (no es self-serve del panel)</li>
              <li>— Soporte por WhatsApp post-pago</li>
            </ul>
            <p className="mt-8 text-sm text-[var(--g1)]">
              <Link href="/precios" className="text-[var(--gold)] hover:underline">
                Ver todos los planes
              </Link>
            </p>
          </div>
          <div className="border border-[var(--line)] bg-[var(--s1)] p-6 md:p-8">
            <Suspense fallback={<p className="text-[var(--g1)]">Cargando…</p>}>
              <CheckoutForm defaultPlanId={defaultPlanId} />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
