export type PlanId =
  | "alenya-starter"
  | "alenya-pro"
  | "notorius-piloto"
  | "notorius-ops";

export type ServicePlan = {
  id: PlanId;
  product: "alenya" | "notorius";
  name: string;
  tagline: string;
  priceLabel: string;
  /** Unit price for Mercado Pago (ARS). */
  unitPrice: number;
  currency: "ARS";
  cadence: "monthly" | "one_time";
  features: string[];
  highlighted?: boolean;
};

export const PLANS: ServicePlan[] = [
  {
    id: "alenya-starter",
    product: "alenya",
    name: "aLENYA Starter",
    tagline: "WhatsApp 24/7 para inmobiliarias que empiezan a automatizar.",
    priceLabel: "USD 149 / mes",
    unitPrice: 149_000,
    currency: "ARS",
    cadence: "monthly",
    features: [
      "Respuestas automáticas 24/7",
      "Score de intención 0–100",
      "Hasta 1 número WhatsApp",
      "Command Center de leads",
      "Soporte por WhatsApp",
    ],
  },
  {
    id: "alenya-pro",
    product: "alenya",
    name: "aLENYA Pro",
    tagline: "Captación + calificación + agenda, listo para cerrar.",
    priceLabel: "USD 349 / mes",
    unitPrice: 349_000,
    currency: "ARS",
    cadence: "monthly",
    highlighted: true,
    features: [
      "Todo Starter",
      "Calendly en el momento justo",
      "Handoff a humano",
      "Knowledge / inventario editable",
      "Onboarding en 48 hs",
    ],
  },
  {
    id: "notorius-piloto",
    product: "notorius",
    name: "NOTORIUS Piloto",
    tagline: "Primer activo tokenizado end-to-end con acompañamiento Melano.",
    priceLabel: "USD 2.500 setup",
    unitPrice: 2_500_000,
    currency: "ARS",
    cadence: "one_time",
    features: [
      "Diseño del security token",
      "Deploy IdentityRegistry + Token",
      "KYC / whitelist inicial",
      "Capacitación al equipo emisor",
      "Soporte de go-live",
    ],
  },
  {
    id: "notorius-ops",
    product: "notorius",
    name: "NOTORIUS Ops",
    tagline: "Operación mensual de emisión y transferencias controladas.",
    priceLabel: "USD 890 / mes",
    unitPrice: 890_000,
    currency: "ARS",
    cadence: "monthly",
    features: [
      "Panel operativo",
      "Mint y transferencias",
      "Monitoreo on-chain",
      "Reportes a emisores",
      "Prioridad de soporte",
    ],
  },
];

export function getPlan(id: string | null | undefined): ServicePlan | undefined {
  if (!id) return undefined;
  return PLANS.find((p) => p.id === id);
}

export function plansByProduct(product: "alenya" | "notorius" | "all" = "all") {
  if (product === "all") return PLANS;
  return PLANS.filter((p) => p.product === product);
}
