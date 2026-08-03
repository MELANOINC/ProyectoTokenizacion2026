"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("returnTo") || "/dashboard";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await fetch("/api/admin/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });
          if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as {
              error?: string;
            };
            setError(data.error || "No se pudo iniciar sesión");
            return;
          }
          const dest = returnTo.startsWith("/") ? returnTo : "/dashboard";
          router.push(dest);
          router.refresh();
        });
      }}
    >
      <label className="block">
        <span className="font-mono text-xs tracking-[0.18em] text-[var(--g1)] uppercase">
          Clave de administración
        </span>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border border-[var(--line)] bg-[var(--s2)] px-4 py-3 text-[var(--w)] outline-none focus:border-[var(--gold-lo)]"
          placeholder="••••••••"
        />
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full border border-[var(--gold-lo)] bg-[var(--gold)] px-4 py-3 font-semibold text-[#14110a] transition hover:bg-[var(--gold-hi)] disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar al panel"}
      </button>
    </form>
  );
}
