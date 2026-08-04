import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { KycReviewPanel } from "@/components/dashboard/KycReviewPanel";
import { StatRow } from "@/components/dashboard/StatRow";
import { getSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const state = await getSnapshot();
  const approved = state.investors.filter((i) => i.kycStatus === "approved").length;
  const pending = state.investors.filter((i) => i.kycStatus === "pending").length;

  return (
    <DashboardShell
      title="Admin"
      subtitle="Gobierno de plataforma: KYC manual, whitelist e historial consolidado. El ledger de mint/transfer requiere txHash on-chain."
    >
      <StatRow
        items={[
          { label: "KYC aprobados", value: approved },
          { label: "KYC pendientes", value: pending },
          { label: "Mints", value: state.mints.length },
          { label: "Transfers", value: state.transfers.length },
        ]}
      />

      <KycReviewPanel
        investors={state.investors.map((investor) => ({
          id: investor.id,
          name: investor.name,
          email: investor.email,
          walletAddress: investor.walletAddress,
          kycStatus: investor.kycStatus,
        }))}
      />

      <section className="mt-12 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Inversores
        </h2>
        <DataTable
          columns={["Nombre", "Email", "Wallet", "KYC", "Whitelist"]}
          rows={state.investors.map((investor) => [
            investor.name,
            investor.email,
            `${investor.walletAddress.slice(0, 12)}…`,
            investor.kycStatus,
            investor.whitelisted ? "Sí" : "No",
          ])}
        />
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Whitelist
        </h2>
        <DataTable
          columns={["Asset", "Investor", "Wallet", "Status", "Alta"]}
          rows={state.whitelist.map((entry) => [
            entry.assetId,
            entry.investorId,
            `${entry.walletAddress.slice(0, 12)}…`,
            entry.status ?? "—",
            new Date(entry.createdAt).toLocaleString("es-AR"),
          ])}
        />
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Ledger (txHash)
        </h2>
        <DataTable
          columns={["Tipo", "Asset", "Amount", "Tx", "Status"]}
          rows={[
            ...state.mints.map((m) => [
              "mint",
              m.assetId,
              String(m.amount),
              `${m.txHash.slice(0, 12)}…`,
              m.status ?? "—",
            ]),
            ...state.transfers.map((t) => [
              "transfer",
              t.assetId,
              String(t.amount),
              `${t.txHash.slice(0, 12)}…`,
              t.status ?? "—",
            ]),
          ]}
        />
      </section>
    </DashboardShell>
  );
}
