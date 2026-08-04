"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { AlenyaLead, AlenyaStats } from "@/lib/alenya/types";
import { formatBudget, waDeepLink } from "@/lib/alenya/types";

type Filter = "all" | "hot" | "warm" | "new" | "human";

const emptyStats: AlenyaStats = {
  total: 0,
  hot: 0,
  warm: 0,
  new: 0,
  handoffs_open: 0,
  sessions_active: 0,
  updated_at: new Date().toISOString(),
};

export function CommandCenter({
  initialLeads,
  initialStats,
}: {
  initialLeads: AlenyaLead[];
  initialStats: AlenyaStats;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [stats, setStats] = useState(initialStats);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      startTransition(async () => {
        try {
          const [lRes, sRes] = await Promise.all([
            fetch("/api/alenya/leads", { cache: "no-store" }),
            fetch("/api/alenya/stats", { cache: "no-store" }),
          ]);
          if (lRes.ok) {
            const data = (await lRes.json()) as { leads: AlenyaLead[] };
            setLeads(data.leads);
          }
          if (sRes.ok) {
            const data = (await sRes.json()) as { stats: AlenyaStats };
            setStats(data.stats ?? emptyStats);
          }
        } catch {
          /* keep last good state */
        }
      });
    }, 20_000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return leads.filter((lead) => {
      if (filter === "human" && !lead.needs_human) return false;
      if (filter !== "all" && filter !== "human" && lead.temperature !== filter)
        return false;
      if (!query) return true;
      const hay = [lead.name, lead.phone, lead.email, lead.interest, lead.notes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [leads, filter, q]);

  async function handoff(contactId: string) {
    setBusyId(contactId);
    setError(null);
    try {
      const res = await fetch("/api/alenya/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          reason: "Marcado para llamado humano desde Command Center",
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "No se pudo marcar handoff");
      }
      setLeads((prev) =>
        prev.map((l) =>
          l.id === contactId
            ? { ...l, needs_human: true, status: "handoff" }
            : l,
        ),
      );
      setStats((s) => ({ ...s, handoffs_open: s.handoffs_open + 1 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
            Command Center
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--w)] md:text-5xl">
            Leads en vivo
          </h1>
          <p className="mt-3 max-w-xl text-[var(--w2)]">
            Calientes hoy. Tibios a seguimiento. WhatsApp en un toque.
            {pending ? " · sync…" : ""}
          </p>
        </div>
        <p className="font-mono text-xs text-[var(--g1)]">
          actualizado{" "}
          {new Date(stats.updated_at).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { k: "hot" as const, label: "🔥 Calientes", n: stats.hot },
          { k: "warm" as const, label: "Tibios", n: stats.warm },
          { k: "new" as const, label: "Nuevos", n: stats.new },
          { k: "all" as const, label: "Total", n: stats.total },
          { k: "human" as const, label: "Handoff", n: stats.handoffs_open },
        ].map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => setFilter(card.k)}
            className={`border px-4 py-4 text-left transition ${
              filter === card.k
                ? "border-[var(--gold-lo)] bg-[var(--s2)]"
                : "border-[var(--line)] bg-[var(--s1)] hover:border-[var(--gold-lo)]"
            }`}
          >
            <p className="font-mono text-[10px] tracking-[0.16em] text-[var(--g1)] uppercase">
              {card.label}
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--w)]">
              {card.n}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar nombre, teléfono, zona…"
          className="min-w-[240px] flex-1 border border-[var(--line)] bg-[var(--s2)] px-4 py-3 text-sm text-[var(--w)] outline-none focus:border-[var(--gold-lo)]"
        />
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </div>

      <div className="mt-6 divide-y divide-[var(--line)] border-t border-[var(--line)]">
        {filtered.length === 0 ? (
          <p className="py-12 text-[var(--g1)]">No hay leads en este filtro.</p>
        ) : (
          filtered.map((lead) => {
            const wa = waDeepLink(lead.phone);
            return (
              <article
                key={lead.id}
                className="grid gap-4 py-6 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--w)]">
                      {lead.name || "Sin nombre"}
                    </h2>
                    <TempBadge temp={lead.temperature} score={lead.score} />
                    {lead.needs_human ? (
                      <span className="border border-[var(--mint-b)] bg-[var(--mint-bg)] px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] text-[var(--mint)] uppercase">
                        Humano
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[var(--w2)]">
                    {lead.interest || "Sin interés declarado"}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--g1)]">
                    {lead.phone || "sin teléfono"} · {formatBudget(lead.budget_min, lead.budget_max)} ·{" "}
                    {lead.status || "—"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-[var(--mint-b)] bg-[var(--mint-bg)] px-4 py-2 text-sm font-semibold text-[var(--mint)] transition hover:border-[var(--mint)]"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                  <button
                    type="button"
                    disabled={busyId === lead.id || lead.needs_human}
                    onClick={() => void handoff(lead.id)}
                    className="border border-[var(--line)] px-4 py-2 text-sm text-[var(--w2)] transition hover:border-[var(--gold-lo)] hover:text-[var(--w)] disabled:opacity-40"
                  >
                    {lead.needs_human
                      ? "Ya derivado"
                      : busyId === lead.id
                        ? "…"
                        : "Marcar handoff"}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function TempBadge({
  temp,
  score,
}: {
  temp: AlenyaLead["temperature"];
  score: number;
}) {
  const map = {
    hot: {
      label: "🔥 CALIENTE",
      className: "border-[var(--gold-lo)] text-[var(--gold-hi)]",
    },
    warm: {
      label: "TIBIO",
      className: "border-[var(--line)] text-[var(--w2)]",
    },
    new: {
      label: "NUEVO",
      className: "border-[var(--line)] text-[var(--g1)]",
    },
  } as const;
  const m = map[temp];
  return (
    <span
      className={`border px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase ${m.className}`}
    >
      {m.label} · {score}
    </span>
  );
}
