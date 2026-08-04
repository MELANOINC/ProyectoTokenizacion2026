import Link from "next/link";
import { PLANS, type ServicePlan } from "@/lib/billing/plans";

function PlanBlock({ plan }: { plan: ServicePlan }) {
  return (
    <article
      className={`flex flex-col border-t pt-6 ${
        plan.highlighted
          ? "border-[var(--gold-lo)]"
          : "border-[var(--line)]"
      }`}
    >
      <p className="font-mono text-xs tracking-[0.18em] text-[var(--g1)] uppercase">
        {plan.product === "alenya" ? "aLENYA" : "NOTORIUS"}
        {plan.highlighted ? " · Recomendado" : ""}
      </p>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--w)]">
        {plan.name}
      </h3>
      <p className="mt-2 text-[var(--w2)]">{plan.tagline}</p>
      <p className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--gold)]">
        {plan.priceLabel}
      </p>
      <ul className="mt-5 flex-1 space-y-2 text-sm text-[var(--w2)]">
        {plan.features.map((f) => (
          <li key={f}>— {f}</li>
        ))}
      </ul>
      <Link
        href={`/comprar?plan=${plan.id}`}
        className={
          plan.highlighted
            ? "btn-primary mt-8 inline-block text-center"
            : "btn-ghost mt-8 inline-block text-center"
        }
      >
        Contratar
      </Link>
    </article>
  );
}

export function PricingGrid({
  product = "all",
}: {
  product?: "alenya" | "notorius" | "all";
}) {
  const plans =
    product === "all" ? PLANS : PLANS.filter((p) => p.product === product);

  return (
    <div className="mt-12 grid gap-10 md:grid-cols-2">
      {plans.map((plan) => (
        <PlanBlock key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
