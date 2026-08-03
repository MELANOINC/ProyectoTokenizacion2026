import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { EmisorClient } from "./EmisorClient";
import { getSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function EmisorPage() {
  const { assets, mints } = await getSnapshot();

  return (
    <DashboardShell
      title="Emisor"
      subtitle="Alta de activos, mint hacia wallets whitelistadas y transferencias controladas."
    >
      <EmisorClient />

      <section className="mt-12 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Mis activos
        </h2>
        <DataTable
          columns={["ID", "Nombre", "Símbolo", "Minted / Supply", "Chain"]}
          rows={assets.map((asset) => [
            asset.id,
            asset.name,
            asset.symbol,
            `${asset.mintedSupply.toLocaleString("es-AR")} / ${asset.totalSupply.toLocaleString("es-AR")}`,
            asset.chain,
          ])}
        />
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Mints
        </h2>
        <DataTable
          columns={["Asset", "Wallet", "Amount", "Tx"]}
          rows={mints.map((mint) => [
            mint.assetId,
            `${mint.toWallet.slice(0, 12)}…`,
            mint.amount.toLocaleString("es-AR"),
            `${mint.txHash.slice(0, 14)}…`,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
