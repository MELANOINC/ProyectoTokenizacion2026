"use client";

import { useState } from "react";

type Source = "alenya" | "luxia" | "brunomelano" | "manual";

export function HandoffDemoClient() {
  const [source, setSource] = useState<Source>("luxia");
  const [name, setName] = useState("Lead Demo Melano");
  const [email, setEmail] = useState(
    `lead-${Date.now().toString().slice(-6)}@melano.demo`,
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/ecosystem/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          name,
          email,
          autoWhitelist: true,
          assetId: "asset_puerto_madero",
          payload: { demo: true, via: "dashboard/ecosistema" },
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: {
          investor: { id: string; email: string };
          whitelisted: boolean;
          handoff: { status: string };
        };
      };
      if (!json.ok || !json.data) {
        setResult(json.error ?? "Error en handoff");
      } else {
        setResult(
          `OK · ${json.data.handoff.status} · inversor ${json.data.investor.id}${
            json.data.whitelisted ? " · whitelist" : ""
          }`,
        );
        setEmail(`lead-${Date.now().toString().slice(-6)}@melano.demo`);
      }
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-3 md:grid-cols-4">
      <label className="block text-sm text-[var(--w2)]">
        Fuente
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as Source)}
          className="mt-1 w-full border border-[var(--line)] bg-[var(--s1)] px-3 py-2 text-[var(--w)]"
        >
          <option value="alenya">aLENYA</option>
          <option value="luxia">LUXIA</option>
          <option value="brunomelano">Bruno Melano</option>
          <option value="manual">Manual</option>
        </select>
      </label>
      <label className="block text-sm text-[var(--w2)] md:col-span-1">
        Nombre
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border border-[var(--line)] bg-[var(--s1)] px-3 py-2 text-[var(--w)]"
          required
        />
      </label>
      <label className="block text-sm text-[var(--w2)] md:col-span-1">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border border-[var(--line)] bg-[var(--s1)] px-3 py-2 text-[var(--w)]"
          required
        />
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full disabled:opacity-60"
        >
          {busy ? "Enviando…" : "Handoff → NOTORIUS"}
        </button>
      </div>
      {result ? (
        <p className="md:col-span-4 font-mono text-sm text-[var(--gold)]">
          {result}
        </p>
      ) : null}
    </form>
  );
}
