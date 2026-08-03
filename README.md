# NOTORIUS™

**Agente tokenizador de propiedades y activos** — MELANO INC

Landing + plataforma on-chain alineadas al estándar visual del hub Melano (`luxia.melanoinc.com` · `alenya.melanoinc.com`).

Hub: **aLENYA** capta → **LUXIA** convierte → **NOTORIUS** tokeniza.

## Stack

- **App / API / Dashboard:** Next.js (App Router) + TypeScript + Tailwind
- **Contracts:** Solidity scaffolds (ERC-3643 style) en `/contracts`
- **Docs:** Whitepaper + manual legal draft en `/docs`
- **DB:** Supabase `notorius_*` via `supabase/migrations/`
- **Deploy:** Vercel (`notorius.melanoinc.com`) · Render Blueprint optional (`render.yaml`)

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
| `/dashboard/admin` | KYC approve/reject + whitelist + ledger txHash |
| `/dashboard/emisor` | Alta de activos, mint/transfer (requiere txHash en prod) |
| `/dashboard/inversores` | Registro + whitelist (KYC approved) |
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

- `POST /api/investor/register` — KYC pending
- `POST /api/kyc/review` — operator: approve/reject
- `POST /api/whitelist` — operator; KYC must be approved
- `POST /api/mint` · `POST /api/transfer` — operator; **real `txHash` required in production**
- `POST /api/ledger/confirm` — confirm on-chain action into ledger
- `GET|POST /api/assets`
- `POST /api/ecosystem/handoff` — requires `ECOSYSTEM_HANDOFF_SECRET` in production
- `GET /api/ecosystem/status`
- `GET /api/health` · `GET /api/health/integrations`

### Ecosystem handoff

```bash
curl -X POST https://notorius.melanoinc.com/api/ecosystem/handoff \
  -H "Content-Type: application/json" \
  -H "x-melano-handoff-secret: $ECOSYSTEM_HANDOFF_SECRET" \
  -d '{"source":"luxia","name":"Ana","email":"ana@cliente.com","autoWhitelist":false}'
```

SQL migrations: `supabase/migrations/`. Apply before enabling Supabase persistence. Without env (or with `NOTORIUS_FORCE_MEMORY=1`), demo data stays in-memory.

**Capital-real note:** contracts are role-hardened but **not audited**. Manual KYC + on-chain txHash ledger are foundation steps — not a CNV green light.

## Ecosystem position

`aLENYA → LUXIA → NOTORIUS` (hub) · `Bruno Melano CRM` · corporate `melanoinc.com`

Surfaces: `/#ecosistema` · `/#guia` · `/dashboard/ecosistema`

## Notes

- En producción configurá Supabase (tablas `notorius_*`) y `ECOSYSTEM_HANDOFF_SECRET`.
- Los contratos no están auditados.
- Encuadre legal CNV: ver `docs/MANUAL-LEGAL.md`.
