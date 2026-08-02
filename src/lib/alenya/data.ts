import { getAlenyaSupabase } from "@/lib/alenya/supabase";
import type {
  AlenyaKnowledge,
  AlenyaLead,
  AlenyaStats,
} from "@/lib/alenya/types";

const FALLBACK_STATS: AlenyaStats = {
  total: 0,
  hot: 0,
  warm: 0,
  new: 0,
  handoffs_open: 0,
  sessions_active: 0,
  updated_at: new Date().toISOString(),
};

export async function fetchPanelLeads(): Promise<AlenyaLead[]> {
  const sb = getAlenyaSupabase();
  const { data, error } = await sb.rpc("alenya_panel_leads");
  if (error) throw new Error(error.message);
  return (data ?? []) as AlenyaLead[];
}

export async function fetchPanelStats(): Promise<AlenyaStats> {
  const sb = getAlenyaSupabase();
  const { data, error } = await sb.rpc("alenya_panel_stats");
  if (error) throw new Error(error.message);
  return (data as AlenyaStats) ?? FALLBACK_STATS;
}

export async function fetchPanelKnowledge(): Promise<AlenyaKnowledge[]> {
  const sb = getAlenyaSupabase();
  const { data, error } = await sb.rpc("alenya_panel_knowledge");
  if (error) throw new Error(error.message);
  return (data ?? []) as AlenyaKnowledge[];
}

export async function requestHandoff(
  contactId: string,
  reason?: string,
): Promise<{ ok: boolean; id?: string }> {
  const sb = getAlenyaSupabase();
  const { data, error } = await sb.rpc("alenya_request_handoff", {
    p_contact_id: contactId,
    p_reason: reason ?? "Solicitud desde Command Center",
    p_priority: "high",
  });
  if (error) throw new Error(error.message);
  return data as { ok: boolean; id?: string };
}

export async function upsertKnowledge(
  contenido: string,
  empresa = "Melano Inc",
): Promise<{ ok: boolean; id?: string }> {
  const sb = getAlenyaSupabase();
  const { data, error } = await sb.rpc("alenya_upsert_knowledge", {
    p_contenido: contenido,
    p_empresa: empresa,
    p_fuente: "command-center",
  });
  if (error) throw new Error(error.message);
  return data as { ok: boolean; id?: string };
}
