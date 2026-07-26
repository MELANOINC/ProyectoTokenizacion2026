import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatRow } from "@/components/dashboard/StatRow";
import { getSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const state = getSnapshot();

  return (
    <DashboardShell
      title="Resumen"
      subtitle="Estado actual del motor de tokenización: activos, inversores, mint y transferencias."
    >
      <StatRow
        items={[
          { label: "Activos", value: state.assets.length },
          { label: "Inversores", value: state.investors.length },
          { label: "Whitelist", value: state.whitelist.length },
          {
            label: "Ops on-chain",
            value: state.mints.length + state.transfers.length,
          },
        ]}
      />

      <section className="mt-12 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Activos tokenizados
        </h2>
        <DataTable
          columns={["Nombre", "Símbolo", "Chain", "Minted", "Supply", "Contrato"]}
          rows={state.assets.map((asset) => [
            asset.name,
            asset.symbol,
            asset.chain,
            asset.mintedSupply.toLocaleString("es-AR"),
            asset.totalSupply.toLocaleString("es-AR"),
            asset.contractAddress
              ? `${asset.contractAddress.slice(0, 10)}…`
              : "Pendiente",
          ])}
        />
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Historial reciente
        </h2>
        <DataTable
          columns={["Tipo", "Activo", "Detalle", "Tx"]}
          rows={[
            ...state.mints.slice(0, 5).map((mint) => [
              "Mint",
              mint.assetId,
              `${mint.amount.toLocaleString("es-AR")} → ${mint.toWallet.slice(0, 10)}…`,
              `${mint.txHash.slice(0, 12)}…`,
            ]),
            ...state.transfers.slice(0, 5).map((transfer) => [
              "Transfer",
              transfer.assetId,
              `${transfer.amount.toLocaleString("es-AR")} ${transfer.fromWallet.slice(0, 8)}…→${transfer.toWallet.slice(0, 8)}…`,
              `${transfer.txHash.slice(0, 12)}…`,
            ]),
          ]}
        />
      </section>
    </DashboardShell>
  );
}
