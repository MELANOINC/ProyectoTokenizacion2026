import type { Metadata } from "next";
import { Suspense } from "react";
import { AlenyaShell } from "@/components/alenya/AlenyaShell";
import { LoginForm } from "@/components/alenya/LoginForm";

export const metadata: Metadata = {
  title: "Login · aLENYA Command Center",
  robots: { index: false, follow: false },
};

export default function AlenyaLoginPage() {
  return (
    <AlenyaShell nav="marketing">
      <main className="mx-auto flex min-h-[70svh] w-full max-w-md flex-col justify-center px-6 py-16">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
          Acceso
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--w)]">
          Command Center
        </h1>
        <p className="mt-3 text-[var(--w2)]">
          Panel operativo de aLENYA. Usá la clave que te entregó Melano Inc.
        </p>
        <Suspense fallback={<p className="mt-8 text-[var(--g1)]">Cargando…</p>}>
          <LoginForm />
        </Suspense>
      </main>
    </AlenyaShell>
  );
}
