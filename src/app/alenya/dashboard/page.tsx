import type { Metadata } from "next";
import { AlenyaShell } from "@/components/alenya/AlenyaShell";
import { CommandCenter } from "@/components/alenya/CommandCenter";
import { fetchPanelLeads, fetchPanelStats } from "@/lib/alenya/data";
import type { AlenyaLead, AlenyaStats } from "@/lib/alenya/types";

export const metadata: Metadata = {
  title: "Leads · aLENYA Command Center",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const emptyStats: AlenyaStats = {
  total: 0,
  hot: 0,
  warm: 0,
  new: 0,
  handoffs_open: 0,
  sessions_active: 0,
  updated_at: new Date().toISOString(),
};

export default async function AlenyaDashboardPage() {
  let leads: AlenyaLead[] = [];
  let stats: AlenyaStats = emptyStats;
  let bootError: string | null = null;
  try {
    [leads, stats] = await Promise.all([fetchPanelLeads(), fetchPanelStats()]);
  } catch (err) {
    bootError = err instanceof Error ? err.message : "Error de datos";
  }

  return (
    <AlenyaShell nav="panel">
      <main>
        {bootError ? (
          <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
            <p className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              No se pudo leer CRM: {bootError}. Revisá{" "}
              <code>ALENYA_SUPABASE_ANON_KEY</code>.
            </p>
          </div>
        ) : null}
        <CommandCenter initialLeads={leads} initialStats={stats} />
      </main>
    </AlenyaShell>
  );
}
