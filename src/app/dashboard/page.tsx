import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatRow } from "@/components/dashboard/StatRow";
import { getSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const state = await getSnapshot();

  return (
    <DashboardShell
      title="Resumen"
      subtitle="Estado operativo del motor de tokenización y acceso rápido al estudio de contratos on-chain."
    >
      <section className="panel mb-10 p-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--slate)] uppercase">
          On-chain
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--ink)]">
          Estudio de contratos Polygon
        </h2>
        <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
          Conectá MetaMask, firmá el acuerdo EIP-712 y desplegá IdentityRegistry +
          SecurityToken para KYC, whitelist, mint y transferencias controladas.
        </p>
        <Link
          href="/dashboard/contratos"
          className="btn-primary mt-5 inline-block"
        >
          Abrir contratos tokenizados
        </Link>
      </section>

      <StatRow
        items={[
          { label: "Activos", value: state.assets.length },
          { label: "Inversores", value: state.investors.length },
          { label: "Whitelist", value: state.whitelist.length },
          {
            label: "Ops demo API",
            value: state.mints.length + state.transfers.length,
          },
        ]}
      />

      <section className="mt-12 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Activos tokenizados (demo API)
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
    </DashboardShell>
  );
}
