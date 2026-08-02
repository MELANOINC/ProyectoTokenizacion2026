export type LeadTemperature = "hot" | "warm" | "new";

export type AlenyaLead = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  score: number;
  status: string | null;
  interest: string | null;
  budget_min: number | string | null;
  budget_max: number | string | null;
  notes: string | null;
  last_contact_at: string | null;
  created_at: string | null;
  tenant_id: string | null;
  temperature: LeadTemperature;
  needs_human: boolean;
};

export type AlenyaStats = {
  total: number;
  hot: number;
  warm: number;
  new: number;
  handoffs_open: number;
  sessions_active: number;
  updated_at: string;
};

export type AlenyaKnowledge = {
  id: string;
  empresa: string | null;
  contenido: string;
  fuente: string | null;
  estado: string | null;
  creado_en: string | null;
};

export function waDeepLink(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  const text = encodeURIComponent(
    "Hola, te escribo desde aLENYA — retomo tu consulta.",
  );
  return `https://wa.me/${digits}?text=${text}`;
}

export function formatBudget(
  min: number | string | null | undefined,
  max: number | string | null | undefined,
): string {
  const a = min != null && min !== "" ? Number(min) : null;
  const b = max != null && max !== "" ? Number(max) : null;
  if (a == null && b == null) return "—";
  const fmt = (n: number) =>
    n >= 1000
      ? `USD ${Math.round(n).toLocaleString("es-AR")}`
      : `USD ${n}`;
  if (a != null && b != null) return `${fmt(a)} – ${fmt(b)}`;
  if (b != null) return `hasta ${fmt(b)}`;
  return `desde ${fmt(a!)}`;
}
