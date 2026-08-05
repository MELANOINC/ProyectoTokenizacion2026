"use client";

import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/dashboard/ActionForm";

export function EmisorClient() {
  const router = useRouter();
  const refresh = () => router.refresh();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold">
          Crear activo
        </h2>
        <ActionForm
          actionLabel="Registrar activo"
          endpoint="/api/assets"
          onSuccess={refresh}
          fields={[
            { name: "name", label: "Nombre", placeholder: "Torre Núñez" },
            {
              name: "symbol",
              label: "Símbolo",
              placeholder: "TNPM",
            },
            {
              name: "class",
              label: "Clase",
              placeholder: "property | development | equity | fund | high_value",
            },
            {
              name: "totalSupply",
              label: "Supply total",
              type: "number",
              placeholder: "1000000",
            },
            {
              name: "issuerId",
              label: "Issuer ID",
              placeholder: "issuer_demo",
            },
            {
              name: "chain",
              label: "Chain",
              placeholder: "polygon | base",
            },
          ]}
          transform={(values) => ({
            ...values,
            symbol: values.symbol.toUpperCase(),
            totalSupply: Number(values.totalSupply),
          })}
        />
      </div>

      <div>
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold">
          Mint
        </h2>
        <ActionForm
          actionLabel="Mint tokens"
          endpoint="/api/mint"
          onSuccess={refresh}
          fields={[
            {
              name: "assetId",
              label: "Asset ID",
              placeholder: "asset_puerto_madero",
            },
            {
              name: "toWallet",
              label: "Wallet destino",
              placeholder: "0x…",
            },
            {
              name: "amount",
              label: "Cantidad",
              type: "number",
              placeholder: "1000",
            },
            {
              name: "txHash",
              label: "Tx hash on-chain (opcional)",
              placeholder: "0x…64 hex — vacío = mint DEMO etiquetado",
              required: false,
            },
          ]}
          transform={(values) => ({
            assetId: values.assetId,
            toWallet: values.toWallet,
            amount: Number(values.amount),
            ...(values.txHash?.trim() ? { txHash: values.txHash.trim() } : {}),
          })}
        />
      </div>

      <div className="lg:col-span-2">
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold">
          Transferencia controlada
        </h2>
        <ActionForm
          actionLabel="Transferir"
          endpoint="/api/transfer"
          onSuccess={refresh}
          fields={[
            {
              name: "assetId",
              label: "Asset ID",
              placeholder: "asset_puerto_madero",
            },
            { name: "fromWallet", label: "Desde", placeholder: "0x…" },
            { name: "toWallet", label: "Hacia", placeholder: "0x…" },
            {
              name: "amount",
              label: "Cantidad",
              type: "number",
              placeholder: "100",
            },
            {
              name: "txHash",
              label: "Tx hash on-chain (opcional)",
              placeholder: "0x…64 hex — vacío = transfer DEMO etiquetado",
              required: false,
            },
          ]}
          transform={(values) => ({
            assetId: values.assetId,
            fromWallet: values.fromWallet,
            toWallet: values.toWallet,
            amount: Number(values.amount),
            ...(values.txHash?.trim() ? { txHash: values.txHash.trim() } : {}),
          })}
        />
      </div>
    </div>
  );
}
