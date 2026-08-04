"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/admin/auth/logout", { method: "POST" });
          router.push("/admin/login");
          router.refresh();
        });
      }}
      className="border border-[var(--line)] px-3 py-2 text-sm text-[var(--w2)] transition hover:border-[var(--gold-lo)] hover:text-[var(--w)] disabled:opacity-60"
    >
      {pending ? "Saliendo…" : "Salir"}
    </button>
  );
}
