"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GUIDE_LESSONS, GUIDE_STORAGE_KEY } from "@/lib/guide";

export function GuideDemoBanner() {
  const params = useSearchParams();
  const [completed, setCompleted] = useState<string[]>([]);
  const fromGuide = params.get("from") === "guide";
  const lessonId = params.get("lesson");
  const complete = params.get("complete") === "1";

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(GUIDE_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      setCompleted(
        Array.isArray(parsed)
          ? parsed.filter((id): id is string => typeof id === "string")
          : [],
      );
    } catch {
      setCompleted([]);
    }
  }, []);

  if (!fromGuide && completed.length === 0) return null;

  const lesson = GUIDE_LESSONS.find((l) => l.id === lessonId);
  const doneCount = completed.length;
  const total = GUIDE_LESSONS.length;

  return (
    <section className="panel mb-8 border-[var(--neon)]/30 p-5">
      <p className="font-mono text-xs tracking-[0.18em] text-[var(--neon)] uppercase">
        Demo desde guía
      </p>
      <p className="mt-2 text-[var(--ink)]">
        {complete
          ? "Guía completa. Explorá el panel operativo."
          : lesson
            ? `Lección activa: ${lesson.title}`
            : "Progreso de la guía operativa."}{" "}
        <span className="text-[var(--ink-soft)]">
          ({doneCount}/{total} marcadas)
        </span>
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link href="/#guia" className="btn-ghost">
          Volver a la guía
        </Link>
        <Link href="/dashboard/contratos" className="btn-primary">
          Estudio on-chain
        </Link>
        <Link href="/dashboard/emisor" className="btn-ghost">
          Emisor
        </Link>
        <Link href="/dashboard/inversores" className="btn-ghost">
          Inversores
        </Link>
      </div>
    </section>
  );
}
