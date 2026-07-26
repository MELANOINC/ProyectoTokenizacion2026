# NOTORIUS™

**Smart Contract Engine + Tokenization Platform** — MELANO INC

Plataforma para administrar el ciclo de vida de activos tokenizados: propiedades, desarrollos inmobiliarios, participaciones, fondos y activos de alto valor.

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
- `GET /api/health`

Demo data is seeded in-memory (wallet `0x1111…1111` ya whitelistada sobre `asset_puerto_madero`).

## Ecosystem position

`MELANIA → LUXIA → NOTORIUS → NEXIO → TITAN`

## Notes

- El store actual es efímero (adecuado a demo). En Render el filesystem no persiste: producción requiere DB.
- Los contratos no están auditados.
- Encuadre legal CNV: ver `docs/MANUAL-LEGAL.md`.
