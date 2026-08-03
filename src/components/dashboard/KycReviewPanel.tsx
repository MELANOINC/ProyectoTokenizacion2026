"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  kycStatus: string;
};

export function KycReviewPanel({ investors }: { investors: Row[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function review(investorId: string, decision: "approved" | "rejected") {
    setPendingId(investorId);
    setMessage(null);
    try {
      const res = await fetch("/api/kyc/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investorId, decision }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      setMessage(`KYC ${decision} · ${investorId}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error KYC");
    } finally {
      setPendingId(null);
    }
  }

  const pending = investors.filter((i) => i.kycStatus === "pending");

  return (
    <section className="mt-12 space-y-4">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Revisar KYC
      </h2>
      <p className="text-sm text-[var(--w2)]">
        Aprobá o rechazá inversores. La whitelist on-chain solo aplica con KYC
        approved.
      </p>
      {message ? (
        <p className="text-sm text-[var(--gold)]">{message}</p>
      ) : null}
      {pending.length === 0 ? (
        <p className="text-sm text-[var(--g1)]">No hay KYC pendientes.</p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border border-[var(--line)]">
          {pending.map((investor) => (
            <li
              key={investor.id}
              className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between"
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
                  className="btn-primary"
                  disabled={pendingId === investor.id}
                  onClick={() => review(investor.id, "approved")}
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={pendingId === investor.id}
                  onClick={() => review(investor.id, "rejected")}
                >
                  Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
