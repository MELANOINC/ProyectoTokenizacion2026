# NOTORIUS™ Documentation

Product documentation for the Smart Contract Engine + Tokenization Platform.

## Contents

- [Whitepaper (draft)](./WHITEPAPER.md)
- [Manual legal (borrador AR)](./MANUAL-LEGAL.md)
- [Contracts](../contracts/README.md)
- [SQL migrations](../supabase/migrations/)

## API surface (v1)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/investor/register` | Public | Register investor (KYC pending) |
| `POST` | `/api/kyc/review` | Operator | Approve / reject KYC |
| `POST` | `/api/whitelist` | Operator | Whitelist wallet (KYC must be approved) |
| `POST` | `/api/mint` | Operator | Record mint with real `txHash` |
| `POST` | `/api/transfer` | Operator | Record transfer with real `txHash` |
| `POST` | `/api/ledger/confirm` | Public* | Confirm on-chain mint/transfer/whitelist into ledger |
| `GET/POST` | `/api/assets` | GET public / POST operator | List / create tokenized assets |
| `POST` | `/api/ecosystem/handoff` | Handoff secret | Ingest lead from aLENYA/LUXIA |
| `GET` | `/api/health` | Public | Health check |
| `GET` | `/api/health/integrations` | Public | Integration probes |

\* Ledger confirm validates `txHash` format; prefer operator-authenticated mint/transfer in production tooling.

## Architecture

```text
/contracts              → Role-hardened ERC-3643-style scaffolds (not audited)
/supabase/migrations    → Versioned notorius_* schema + RLS
/src/app                → Landing + dashboards + API
/docs                   → Product, legal draft, whitepaper
```

## Persistence

Production uses Supabase (`notorius_*` tables). Migrations live in-repo and must be applied before enabling persistence. Demo/memory mode (`NOTORIUS_FORCE_MEMORY=1` or missing Supabase env) is for local PoCs only.

## Capital-real status

Foundation: SQL migrations, on-chain txHash ledger, operator auth, manual KYC. **Not CNV-ready** until external contract audit, regulated KYC provider, and legal counsel sign-off.
