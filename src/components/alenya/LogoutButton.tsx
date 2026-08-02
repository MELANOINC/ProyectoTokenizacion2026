"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-[var(--g1)] hover:text-[var(--gold)]"
      onClick={async () => {
        await fetch("/api/alenya/auth/logout", { method: "POST" });
        router.push("/alenya/login");
        router.refresh();
      }}
    >
      Salir
    </button>
  );
}
