"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionForm } from "@/components/dashboard/ActionForm";
import type { Investor, WhitelistEntry } from "@/lib/types";

async function postJson(endpoint: string, body: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await response.json()) as {
    ok?: boolean;
    error?: string;
  };
  if (!response.ok || !json.ok) {
    throw new Error(json.error ?? "Request failed");
  }
}

export function AdminClient({
  investors,
  whitelist,
  assets,
}: {
  investors: Investor[];
  whitelist: WhitelistEntry[];
  assets: { id: string; symbol: string }[];
}) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decideKyc(
    investorId: string,
    status: "approved" | "rejected",
  ) {
    setBusyId(`${investorId}:${status}`);
    setError(null);
    try {
      await postJson("/api/kyc", { investorId, status });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error KYC");
    } finally {
      setBusyId(null);
    }
  }

  const pending = investors.filter((i) => i.kycStatus === "pending");
  const defaultAsset = assets[0]?.id ?? "asset_puerto_madero";

  return (
    <div className="space-y-12">
      {error ? (
        <p className="text-sm text-[#f97066]">{error}</p>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Cola KYC
        </h2>
        <p className="text-sm text-[var(--w2)]">
          Approve / reject manual. Whitelist solo después de KYC aprobado.
        </p>
        {pending.length === 0 ? (
          <p className="text-sm text-[var(--g1)]">Sin pendientes.</p>
        ) : (
          <ul className="divide-y divide-[var(--line)] border border-[var(--line)]">
            {pending.map((investor) => (
              <li
                key={investor.id}
                className="flex flex-col gap-3 bg-[var(--s1)]/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-[var(--w)]">{investor.name}</p>
                  <p className="text-sm text-[var(--w2)]">{investor.email}</p>
                  <p className="font-mono text-xs text-[var(--g1)]">
                    {investor.walletAddress}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => void decideKyc(investor.id, "approved")}
                    className="btn-primary text-sm disabled:opacity-60"
                  >
                    {busyId === `${investor.id}:approved`
                      ? "…"
                      : "Aprobar KYC"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => void decideKyc(investor.id, "rejected")}
                    className="btn-ghost text-sm disabled:opacity-60"
                  >
                    {busyId === `${investor.id}:rejected` ? "…" : "Rechazar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Inversores
        </h2>
        <div className="overflow-x-auto border border-[var(--line)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--s3)] text-[var(--w)]">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">KYC</th>
                <th className="px-4 py-3 font-medium">WL</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {investors.map((investor) => (
                <tr
                  key={investor.id}
                  className="border-t border-[var(--line)] bg-[var(--s1)]/70"
                >
                  <td className="px-4 py-3 text-[var(--w2)]">
                    <div>{investor.name}</div>
                    <div className="font-mono text-xs text-[var(--g1)]">
                      {investor.id}
                    </div>
                  </td>
                  <td className="px-4 py-3 uppercase tracking-wide text-[var(--w2)]">
                    {investor.kycStatus}
                  </td>
                  <td className="px-4 py-3 text-[var(--w2)]">
                    {investor.whitelisted ? "Sí" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {investor.kycStatus !== "approved" ? (
                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() =>
                            void decideKyc(investor.id, "approved")
                          }
                          className="border border-[var(--mint-b)] px-2 py-1 text-xs text-[var(--mint)] disabled:opacity-60"
                        >
                          Aprobar
                        </button>
                      ) : null}
                      {investor.kycStatus !== "rejected" ? (
                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() =>
                            void decideKyc(investor.id, "rejected")
                          }
                          className="border border-[var(--line)] px-2 py-1 text-xs text-[var(--w2)] disabled:opacity-60"
                        >
                          Rechazar
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold">
            Whitelist (post-KYC)
          </h2>
          <ActionForm
            actionLabel="Agregar a whitelist"
            endpoint="/api/whitelist"
            onSuccess={refresh}
            fields={[
              {
                name: "investorId",
                label: "Investor ID",
                placeholder: "inv_…",
              },
              {
                name: "assetId",
                label: "Asset ID",
                placeholder: defaultAsset,
              },
              {
                name: "walletAddress",
                label: "Wallet (opcional)",
                placeholder: "0x…",
                required: false,
              },
            ]}
            transform={(values) => ({
              investorId: values.investorId,
              assetId: values.assetId || defaultAsset,
              ...(values.walletAddress
                ? { walletAddress: values.walletAddress }
                : {}),
            })}
          />
        </div>
        <div>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold">
            Whitelist actual
          </h2>
          <div className="overflow-x-auto border border-[var(--line)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--s3)] text-[var(--w)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Asset</th>
                  <th className="px-4 py-3 font-medium">Investor</th>
                  <th className="px-4 py-3 font-medium">Wallet</th>
                </tr>
              </thead>
              <tbody>
                {whitelist.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-[var(--g1)]"
                    >
                      Sin registros.
                    </td>
                  </tr>
                ) : (
                  whitelist.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-t border-[var(--line)] bg-[var(--s1)]/70"
                    >
                      <td className="px-4 py-3 text-[var(--w2)]">
                        {entry.assetId}
                      </td>
                      <td className="px-4 py-3 text-[var(--w2)]">
                        {entry.investorId}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--w2)]">
                        {entry.walletAddress.slice(0, 12)}…
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
