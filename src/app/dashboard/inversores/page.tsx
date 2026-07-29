import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { InversoresClient } from "./InversoresClient";
import { getSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function InversoresPage() {
  const { investors, whitelist } = getSnapshot();

  return (
    <DashboardShell
      title="Inversores"
      subtitle="Onboarding, KYC simulado y whitelist por activo para transferencias controladas."
    >
      <InversoresClient />

      <section className="mt-12 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Registro
        </h2>
        <DataTable
          columns={["ID", "Nombre", "Email", "KYC", "Wallet"]}
          rows={investors.map((investor) => [
            investor.id,
            investor.name,
            investor.email,
            investor.kycStatus,
            `${investor.walletAddress.slice(0, 12)}…`,
          ])}
        />
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Accesos whitelist
        </h2>
        <DataTable
          columns={["Investor", "Asset", "Wallet"]}
          rows={whitelist.map((entry) => [
            entry.investorId,
            entry.assetId,
            `${entry.walletAddress.slice(0, 14)}…`,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
