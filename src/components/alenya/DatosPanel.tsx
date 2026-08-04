"use client";

import { useState, useTransition } from "react";
import type { AlenyaKnowledge } from "@/lib/alenya/types";

export function DatosPanel({ initialItems }: { initialItems: AlenyaKnowledge[] }) {
  const [items, setItems] = useState(initialItems);
  const [contenido, setContenido] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10">
      <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
        Datos
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--w)]">
        Inventario & FAQs
      </h1>
      <p className="mt-3 text-[var(--w2)]">
        Notas que aLENYA usa para responder con el tono e inventario de tu
        negocio.
      </p>

      <form
        className="mt-8 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setOk(null);
          startTransition(async () => {
            const res = await fetch("/api/alenya/knowledge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contenido }),
            });
            if (!res.ok) {
              const data = (await res.json().catch(() => ({}))) as {
                error?: string;
              };
              setError(data.error || "No se pudo guardar");
              return;
            }
            const data = (await res.json()) as { id?: string };
            setItems((prev) => [
              {
                id: data.id || crypto.randomUUID(),
                empresa: "Melano Inc",
                contenido,
                fuente: "command-center",
                estado: "activo",
                creado_en: new Date().toISOString(),
              },
              ...prev,
            ]);
            setContenido("");
            setOk("Guardado");
          });
        }}
      >
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={5}
          placeholder="Ej: 3 amb a estrenar en Playa Grande, USD 245k, entrega inmediata…"
          className="w-full border border-[var(--line)] bg-[var(--s2)] px-4 py-3 text-[var(--w)] outline-none focus:border-[var(--gold-lo)]"
        />
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {ok ? <p className="text-sm text-[var(--mint)]">{ok}</p> : null}
        <button
          type="submit"
          disabled={pending || contenido.trim().length < 4}
          className="border border-[var(--gold-lo)] bg-[var(--gold)] px-4 py-2 font-semibold text-[#14110a] disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Agregar a knowledge"}
        </button>
      </form>

      <div className="mt-10 space-y-6 border-t border-[var(--line)] pt-8">
        {items.length === 0 ? (
          <p className="text-[var(--g1)]">Todavía no hay entradas.</p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="border-t border-[var(--line)] pt-4">
              <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--g1)] uppercase">
                {item.fuente || "manual"} · {item.estado || "activo"}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-[var(--w2)]">
                {item.contenido}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
