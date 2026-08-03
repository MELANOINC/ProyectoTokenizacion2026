"use client";

import { useId, useState } from "react";

type Source = "alenya" | "luxia" | "brunomelano" | "manual";

export function HandoffDemoClient() {
  const reactId = useId().replace(/:/g, "");
  const [source, setSource] = useState<Source>("luxia");
  const [name, setName] = useState("Lead Demo Melano");
  const [email, setEmail] = useState(`lead-${reactId}@melano.demo`);
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
      if (!res.ok || !json.ok || !json.data) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      setResult(
        `OK · ${json.data.investor.email} · status=${json.data.handoff.status} · whitelist=${json.data.whitelisted}`,
      );
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel space-y-4 p-6">
      <p className="font-mono text-xs tracking-[0.18em] text-[var(--gold)] uppercase">
        Handoff demo
      </p>
      <label className="block text-sm text-[var(--w2)]">
        Source
        <select
          className="field mt-1"
          value={source}
          onChange={(e) => setSource(e.target.value as Source)}
        >
          <option value="luxia">luxia</option>
          <option value="alenya">alenya</option>
          <option value="brunomelano">brunomelano</option>
          <option value="manual">manual</option>
        </select>
      </label>
      <label className="block text-sm text-[var(--w2)]">
        Nombre
        <input
          className="field mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm text-[var(--w2)]">
        Email
        <input
          className="field mt-1"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? "Enviando…" : "POST /api/ecosystem/handoff"}
      </button>
      {result ? <p className="text-sm text-[var(--w2)]">{result}</p> : null}
    </form>
  );
}
