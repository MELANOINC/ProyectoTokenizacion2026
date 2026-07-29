import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatRow } from "@/components/dashboard/StatRow";
import { getSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const state = getSnapshot();
  const approved = state.investors.filter((i) => i.kycStatus === "approved").length;

  return (
    <DashboardShell
      title="Admin"
      subtitle="Gobierno de plataforma: KYC, whitelist e historial on-chain consolidado."
    >
      <StatRow
        items={[
          { label: "KYC aprobados", value: approved },
          {
            label: "KYC pendientes",
            value: state.investors.length - approved,
          },
          { label: "Mints", value: state.mints.length },
          { label: "Transfers", value: state.transfers.length },
        ]}
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
          columns={["Asset", "Investor", "Wallet", "Alta"]}
          rows={state.whitelist.map((entry) => [
            entry.assetId,
            entry.investorId,
            `${entry.walletAddress.slice(0, 12)}…`,
            new Date(entry.createdAt).toLocaleString("es-AR"),
          ])}
        />
      </section>
    </DashboardShell>
  );
}
