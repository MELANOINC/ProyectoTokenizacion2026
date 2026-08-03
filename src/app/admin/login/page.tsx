import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Acceso interno",
  description: "Login de administración Melano Inc / NOTORIUS.",
  path: "/admin/login",
  index: false,
});

export default function AdminLoginPage() {
  return (
    <main className="grain flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md border border-[var(--line)] bg-[var(--s1)] p-8">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
          Melano Inc · Interno
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--w)]">
          Panel operativo
        </h1>
        <p className="mt-3 text-sm text-[var(--w2)]">
          Acceso restringido para el equipo Melano. Si sos cliente y querés
          contratar el servicio, andá a precios.
        </p>
        <Suspense fallback={null}>
          <AdminLoginForm />
        </Suspense>
        <p className="mt-6 text-sm text-[var(--g1)]">
          <Link href="/precios" className="text-[var(--gold)] hover:underline">
            Ver planes y comprar
          </Link>
          {" · "}
          <Link href="/" className="hover:text-[var(--w)]">
            Volver al sitio
          </Link>
        </p>
      </div>
    </main>
  );
}
