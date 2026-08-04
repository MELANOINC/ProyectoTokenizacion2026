"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { PLANS, type PlanId } from "@/lib/billing/plans";

export function CheckoutForm({ defaultPlanId }: { defaultPlanId?: PlanId }) {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get("status");
  const fromQuery = params.get("plan");

  const initial =
    (PLANS.find((p) => p.id === (fromQuery || defaultPlanId))?.id as
      | PlanId
      | undefined) ?? "alenya-pro";

  const [planId, setPlanId] = useState<PlanId>(initial);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const plan = useMemo(
    () => PLANS.find((p) => p.id === planId) ?? PLANS[1],
    [planId],
  );

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await fetch("/api/billing/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId, email, name }),
          });
          const data = (await res.json().catch(() => ({}))) as {
            ok?: boolean;
            checkoutUrl?: string;
            error?: string;
          };
          if (!res.ok || !data.checkoutUrl) {
            setError(data.error || "No se pudo iniciar el pago");
            return;
          }
          window.location.href = data.checkoutUrl;
        });
      }}
    >
      {status === "failure" ? (
        <p className="border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          El pago no se completó. Podés reintentar con el mismo plan.
        </p>
      ) : null}

      <label className="block">
        <span className="font-mono text-xs tracking-[0.18em] text-[var(--g1)] uppercase">
          Plan
        </span>
        <select
          value={planId}
          onChange={(e) => setPlanId(e.target.value as PlanId)}
          className="mt-2 w-full border border-[var(--line)] bg-[var(--s2)] px-4 py-3 text-[var(--w)] outline-none focus:border-[var(--gold-lo)]"
        >
          {PLANS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.priceLabel}
            </option>
          ))}
        </select>
      </label>

      <p className="text-sm text-[var(--w2)]">{plan.tagline}</p>

      <label className="block">
        <span className="font-mono text-xs tracking-[0.18em] text-[var(--g1)] uppercase">
          Nombre / empresa
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full border border-[var(--line)] bg-[var(--s2)] px-4 py-3 text-[var(--w)] outline-none focus:border-[var(--gold-lo)]"
          placeholder="Inmobiliaria Ejemplo"
        />
      </label>

      <label className="block">
        <span className="font-mono text-xs tracking-[0.18em] text-[var(--g1)] uppercase">
          Email de facturación
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full border border-[var(--line)] bg-[var(--s2)] px-4 py-3 text-[var(--w)] outline-none focus:border-[var(--gold-lo)]"
          placeholder="vos@empresa.com"
        />
      </label>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full border border-[var(--gold-lo)] bg-[var(--gold)] px-4 py-3 font-semibold text-[#14110a] transition hover:bg-[var(--gold-hi)] disabled:opacity-60"
      >
        {pending ? "Redirigiendo a Mercado Pago…" : `Pagar ${plan.priceLabel}`}
      </button>

      <button
        type="button"
        className="w-full text-sm text-[var(--g1)] hover:text-[var(--w)]"
        onClick={() => router.push("/precios")}
      >
        Volver a ver todos los planes
      </button>
    </form>
  );
}
