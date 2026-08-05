"use client";

import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/dashboard/ActionForm";

export function InversoresClient() {
  const router = useRouter();
  const refresh = () => router.refresh();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold">
          Registrar inversor
        </h2>
        <ActionForm
          actionLabel="Registrar"
          endpoint="/api/investor/register"
          onSuccess={refresh}
          fields={[
            { name: "name", label: "Nombre", placeholder: "María López" },
            {
              name: "email",
              label: "Email",
              type: "email",
              placeholder: "maria@example.com",
            },
            {
              name: "walletAddress",
              label: "Wallet",
              placeholder: "0x…",
            },
          ]}
        />
      </div>

      <div>
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold">
          Whitelist (requiere KYC aprobado en Admin)
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
              placeholder: "asset_puerto_madero",
            },
            {
              name: "walletAddress",
              label: "Wallet (opcional)",
              placeholder: "0x…",
              required: false,
            },
          ]}
          transform={(values) => {
            const payload: Record<string, string> = {
              investorId: values.investorId,
              assetId: values.assetId,
            };
            if (values.walletAddress.trim()) {
              payload.walletAddress = values.walletAddress.trim();
            }
            return payload;
          }}
        />
      </div>
    </div>
  );
}
