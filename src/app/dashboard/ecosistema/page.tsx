import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatRow } from "@/components/dashboard/StatRow";
import { ECOSYSTEM } from "@/lib/ecosystem";
import { getEcosystemStatus } from "@/lib/handoff";
import { HandoffDemoClient } from "./HandoffDemoClient";

export const dynamic = "force-dynamic";

export default async function EcosistemaPage() {
  const status = await getEcosystemStatus();

  return (
    <DashboardShell
      title="Ecosistema Melano"
      subtitle="Flujo end-to-end: aLENYA capta → LUXIA convierte → NOTORIUS tokeniza. Handoffs y persistencia unificados."
    >
      <StatRow
        items={[
          { label: "Leads aLENYA", value: status.pipeline.alenyaLeads },
          { label: "Leads LUXIA", value: status.pipeline.luxiaLeads },
          {
            label: "Inversores NOTORIUS",
            value: status.pipeline.notoriusInvestors,
          },
          { label: "Handoffs", value: status.pipeline.handoffs },
        ]}
      />

      <p className="mt-4 text-sm text-[var(--g1)]">
        Persistencia:{" "}
        <span className="text-[var(--gold)]">{status.persistence}</span>
      </p>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {(
          [
            ["alenya", ECOSYSTEM.alenya],
            ["luxia", ECOSYSTEM.luxia],
            ["notorius", ECOSYSTEM.notorius],
          ] as const
        ).map(([key, agent], index) => (
          <a
            key={key}
            href={agent.url}
            target={key === "notorius" ? undefined : "_blank"}
            rel={key === "notorius" ? undefined : "noreferrer"}
            className="panel block p-5 transition hover:border-[var(--gold-lo)]"
          >
            <p className="font-mono text-xs tracking-[0.18em] text-[var(--g1)] uppercase">
              {index + 1}. {agent.role}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--w)]">
              {agent.name}
            </h2>
            <p className="mt-2 break-all text-sm text-[var(--w2)]">{agent.url}</p>
          </a>
        ))}
      </section>

      <section className="panel mt-10 p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Probar handoff
        </h2>
        <p className="mt-2 text-[var(--w2)]">
          Simula un lead convertido en Luxia / Alenya / Bruno Melano CRM entrando a
          NOTORIUS (alta de inversor + whitelist opcional).
        </p>
        <HandoffDemoClient />
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard/inversores" className="btn-primary">
            Ver inversores
          </Link>
          <Link
            href="/dashboard/contratos"
            className="border border-[var(--line)] px-4 py-2 text-sm text-[var(--w2)] transition hover:border-[var(--gold-lo)] hover:text-[var(--w)]"
          >
            Ir a contratos on-chain
          </Link>
          <a
            href={ECOSYSTEM.brunomelano.url}
            target="_blank"
            rel="noreferrer"
            className="border border-[var(--line)] px-4 py-2 text-sm text-[var(--w2)] transition hover:border-[var(--gold-lo)] hover:text-[var(--w)]"
          >
            Abrir Bruno Melano CRM
          </a>
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Últimos handoffs
        </h2>
        <DataTable
          columns={["Fuente", "Lead", "Email", "Status", "Cuándo"]}
          rows={status.handoffs.map((h) => [
            h.source,
            h.leadName ?? "—",
            h.leadEmail ?? "—",
            h.status,
            new Date(h.createdAt).toLocaleString("es-AR"),
          ])}
        />
      </section>
    </DashboardShell>
  );
}
