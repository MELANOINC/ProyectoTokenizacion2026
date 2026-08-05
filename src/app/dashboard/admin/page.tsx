import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatRow } from "@/components/dashboard/StatRow";
import { getSnapshot } from "@/lib/store";
import { AdminClient } from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const state = await getSnapshot();
  const approved = state.investors.filter((i) => i.kycStatus === "approved").length;
  const pending = state.investors.filter((i) => i.kycStatus === "pending").length;
  const onchainMints = state.mints.filter((m) => m.ledgerSource === "onchain").length;
  const demoMints = state.mints.filter((m) => m.ledgerSource === "demo").length;

  return (
    <DashboardShell
      title="Admin"
      subtitle="Gobierno: KYC approve/reject, whitelist post-KYC. Ledger etiquetado DEMO vs ON-CHAIN."
    >
      <StatRow
        items={[
          { label: "KYC aprobados", value: approved },
          { label: "KYC pendientes", value: pending },
          { label: "Mints on-chain", value: onchainMints },
          { label: "Mints demo", value: demoMints },
        ]}
      />

      <div className="mt-12">
        <AdminClient
          investors={state.investors}
          whitelist={state.whitelist}
          assets={state.assets.map((a) => ({ id: a.id, symbol: a.symbol }))}
        />
      </div>
    </DashboardShell>
  );
}
