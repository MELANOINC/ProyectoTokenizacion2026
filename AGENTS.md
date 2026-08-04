# NOTORIUS™

See `README.md` for the product overview, surfaces, and API list.

## Cursor Cloud specific instructions

Single service: a Next.js 16 (App Router, Turbopack) app that serves the landing page, dashboard, and demo JSON API. Node 22 is required (`render.yaml` sets `NODE_VERSION=22`). Canonical production host: **Vercel** `https://notorius.melanoinc.com`.

- Run dev server: `npm run dev` (serves on `http://localhost:3000`). See `.env.example` for Melano ecosystem hooks. No required env for the demo path.
- Lint: `npm run lint`. Typecheck: `npm run typecheck`. Tests: `npm test`. Build: `npm run build` (`next build`; use `npm run build:full` to also compile contracts). Env presence audit: `npm run check:env`. Optional live probes: `npm run probe:integrations` (exits non-zero only if Supabase/Mercado Pago are RED).
- Known UI bug fixed: `ActionForm` now resets via a captured form element reference after `await` (no null `currentTarget`).
- Contract artifacts in `src/lib/web3/artifacts/` are committed. Regenerate after editing `contracts/*.sol` via `npm run compile:contracts`.
- Persistence: Supabase tables `notorius_*` via versioned SQL in `supabase/migrations/`. Without Supabase env (or with `NOTORIUS_FORCE_MEMORY=1` / `NOTORIUS_STORE=memory`) the API uses an in-memory seeded store. Main also ships an alternate dual-write repository (`src/lib/supabase/repository.ts`) against Melano CRM tables — see merge notes if both paths are present.
- Production ledger: mint/transfer require real `txHash`. KYC is manual approve/reject (no auto-approve on whitelist). Mutable APIs require operator auth (`NOTORIUS_OPERATOR_KEY` or Supabase operator JWT). Ledger GETs and `/dashboard` are gated by Melano admin session (`NOTORIUS_ADMIN_PASSWORD` / `/admin/login`). `ECOSYSTEM_HANDOFF_SECRET` is required in production.
- Core API flow (dev/demo): `POST /api/investor/register` → `POST /api/kyc/review` → `POST /api/whitelist` → `POST /api/mint` (with txHash in prod) → `POST /api/transfer`; health at `GET /api/health`; integration probes at `GET /api/health/integrations`.
- Customer surfaces: `/precios`, `/comprar`, `/gracias`. Internal: `/admin/login`, `/alenya`, `/dashboard`.
- `/dashboard/contratos` needs MetaMask + Polygon (Amoy) for on-chain deploy/mint; confirms into `/api/ledger/confirm`.
- Contracts are role-hardened scaffolds — **not audited**. Do not put real capital on mainnet without an external audit.
