# NOTORIUS™

**Agente tokenizador de propiedades y activos** — MELANO INC

Landing + plataforma on-chain alineadas al estándar visual del hub Melano (`luxia.melanoinc.com` · `alenya.melanoinc.com`).

Hub: **aLENYA** capta → **LUXIA** convierte → **NOTORIUS** tokeniza.

## Stack

- **App / API / Dashboard:** Next.js (App Router) + TypeScript + Tailwind
- **Contracts:** Solidity scaffolds (ERC-3643 style) en `/contracts`
- **Docs:** Whitepaper + manual legal draft en `/docs`
- **Deploy:** Render Blueprint (`render.yaml`) — bind `0.0.0.0:$PORT`

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Surfaces

| Path | Role |
|---|---|
| `/` | Landing comercial |
| `/dashboard/contratos` | MetaMask + Polygon: firmar EIP-712, deploy Solidity, KYC, whitelist, mint, transfer |
| `/dashboard` | Resumen operativo |
| `/dashboard/ecosistema` | Hub Melano E2E + handoff demo |
| `/#guia` | Guía interactiva de tokenización |
| `/dashboard/admin` | KYC + whitelist + historial (demo API) |
| `/dashboard/emisor` | Alta de activos, mint, transfers (demo API) |
| `/dashboard/inversores` | Registro y whitelist (demo API) |
| `/docs` | Índice de documentación |

### On-chain (MetaMask / Polygon)

1. Abrí `/dashboard/contratos`
2. Conectá MetaMask (Amoy recomendado)
3. Firmá el acuerdo EIP-712
4. Deploy `IdentityRegistry` → Deploy `SecurityToken`
5. Registrar KYC → Whitelist → Mint → Transfer

```bash
npm run compile:contracts   # regenera ABI + bytecode en src/lib/web3/artifacts
```

## API

- `POST /api/investor/register`
- `POST /api/whitelist`
- `POST /api/mint`
- `POST /api/transfer`
- `GET|POST /api/assets`
- `POST /api/ecosystem/handoff` — Alenya / Luxia / Bruno Melano → inversor NOTORIUS (+ whitelist)
- `GET /api/ecosystem/status` — pipeline counts + últimos handoffs
- `GET /api/health`
- `GET /api/health/integrations` — safe probes for optional Supabase / Mercado Pago / Hostinger (no writes)
- `npm run probe:integrations` — same probes from CLI (loads `.env.local` overrides)

### Ecosystem handoff

```bash
curl -X POST https://proyectomelanoinc.vercel.app/api/ecosystem/handoff \
  -H "Content-Type: application/json" \
  -H "x-melano-handoff-secret: $ECOSYSTEM_HANDOFF_SECRET" \
  -d '{"source":"luxia","name":"Ana","email":"ana@cliente.com","autoWhitelist":true}'
```

With `NEXT_PUBLIC_SUPABASE_URL` + anon/service key, state persists in `notorius_*` tables (melano-crm). Without env, demo data stays in-memory (wallet `0x1111…1111` whitelistada sobre `asset_puerto_madero`).

## Ecosystem position

`aLENYA → LUXIA → NOTORIUS` (hub) · `Bruno Melano CRM` · corporate `melanoinc.com`

Surfaces: `/#ecosistema` · `/#guia` · `/dashboard/ecosistema`

## Notes

- En producción configurá Supabase (tablas `notorius_*`) y `ECOSYSTEM_HANDOFF_SECRET`.
- Los contratos no están auditados.
- Encuadre legal CNV: ver `docs/MANUAL-LEGAL.md`.
