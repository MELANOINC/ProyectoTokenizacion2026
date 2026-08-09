"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GUIDE_LESSONS, GUIDE_STORAGE_KEY, type GuideLesson } from "@/lib/guide";

function readCompleted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUIDE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeCompleted(ids: string[]) {
  window.localStorage.setItem(GUIDE_STORAGE_KEY, JSON.stringify(ids));
}

export function GuideSection() {
  const [activeId, setActiveId] = useState(GUIDE_LESSONS[0].id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    setCompleted(readCompleted());
  }, []);

  const active: GuideLesson = useMemo(
    () => GUIDE_LESSONS.find((l) => l.id === activeId) ?? GUIDE_LESSONS[0],
    [activeId],
  );

  const activeIndex = GUIDE_LESSONS.findIndex((l) => l.id === active.id);
  const isDone = completed.includes(active.id);
  const allDone = GUIDE_LESSONS.every((l) => completed.includes(l.id));

  const markInDemo = useCallback(() => {
    const next = completed.includes(active.id)
      ? completed
      : [...completed, active.id];
    setCompleted(next);
    writeCompleted(next);
    setFlash("Marcado en demo");
    window.setTimeout(() => setFlash(null), 1600);

    const following = GUIDE_LESSONS[activeIndex + 1];
    if (following) {
      setActiveId(following.id);
    }
  }, [active.id, activeIndex, completed]);

  return (
    <section id="guia" className="border-y border-[var(--line)] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--gold)] uppercase">
          Guía operativa
        </p>
        <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--w)] md:text-4xl">
          Qué es un token y cómo NOTORIUS estructura una emisión.
        </h2>

        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(240px,0.9fr)_1.4fr]">
          {/* Sidebar */}
          <aside className="panel overflow-hidden rounded-2xl p-2">
            <ul className="space-y-2">
              {GUIDE_LESSONS.map((lesson, index) => {
                const selected = lesson.id === active.id;
                const done = completed.includes(lesson.id);
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(lesson.id)}
                      className={[
                        "w-full rounded-xl border px-4 py-4 text-left transition",
                        selected
                          ? "border-[var(--gold-lo)] bg-[var(--s3)]"
                          : "border-transparent bg-transparent hover:border-[var(--line)] hover:bg-[var(--s2)]",
                      ].join(" ")}
                      aria-current={selected ? "true" : undefined}
                    >
                      <span className="block text-sm font-medium text-[var(--w)] md:text-base">
                        {index + 1}. {lesson.title}
                        {done ? (
                          <span className="ml-2 font-mono text-[10px] tracking-wider text-[var(--mint)]">
                            ✓ DEMO
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-2 block font-mono text-xs tracking-[0.14em] text-[var(--g1)]">
                        {lesson.durationMin} min
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Content */}
          <article className="panel relative flex min-h-[320px] flex-col rounded-2xl p-6 md:p-8">
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--w)] md:text-3xl">
              {active.title}
            </h3>
            <p className="mt-4 font-mono text-xs tracking-[0.2em] text-[var(--gold)] uppercase">
              {active.kicker}
            </p>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[var(--w2)] md:text-base">
              {active.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-3 pt-10">
              <button
                type="button"
                onClick={markInDemo}
                className="rounded-full bg-[var(--neon)] px-5 py-2.5 text-sm font-semibold text-[#041018] transition hover:brightness-110"
              >
                {isDone ? "Ya marcado · siguiente" : "Marcar en demo"}
              </button>
              <a
                href="https://wa.me/5492235506585"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-medium text-[var(--w2)] transition hover:border-[var(--neon)] hover:text-[var(--w)]"
              >
                Consultar implementación
              </a>
              {flash ? (
                <span className="font-mono text-xs tracking-wider text-[var(--mint)]">
                  {flash}
                </span>
              ) : null}
            </div>

            {allDone ? (
              <p className="mt-4 text-sm text-[var(--mint)]">
                Guía completa.{" "}
                <a
                  href="https://wa.me/5492235506585"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  Solicitar diagnóstico NOTORIUS
                </a>
              </p>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  );
}
