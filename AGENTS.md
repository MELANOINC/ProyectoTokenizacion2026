# NOTORIUS™

See `README.md` for the product overview, surfaces, and API list.

## Cursor Cloud specific instructions

Single service: a Next.js 16 (App Router, Turbopack) app that serves the landing page, dashboard, and demo JSON API. Node 22 is required (`render.yaml` sets `NODE_VERSION=22`).

- Run dev server: `npm run dev` (serves on `http://localhost:3000`). Locally no `.env` is required. In **production**, set `ECOSYSTEM_HANDOFF_SECRET` if `/api/ecosystem/handoff` is exposed. See `.env.example`.
- Lint: `npm run lint`. Typecheck: `npm run typecheck`. Tests: `npm test`. Build: `npm run build` (runs `compile:contracts` then `next build`). Env presence audit (no secrets): `npm run check:env`. Optional live probes: `npm run probe:integrations` (reads `.env.local` overrides; exits non-zero only if Supabase/Mercado Pago are RED).
- Known UI bug fixed: `ActionForm` now resets via a captured form element reference after `await` (no null `currentTarget`).
- Contract artifacts in `src/lib/web3/artifacts/` are committed, so the app runs without recompiling. Regenerate them only after editing `contracts/*.sol` via `npm run compile:contracts`. Deployer of `IdentityRegistry` / `SecurityToken` receives `ADMIN` + `COMPLIANCE` (+ `ISSUER` on the token); KYC/whitelist need COMPLIANCE, mint needs ISSUER.
- SQL schema lives in `supabase/migrations/` (`notorius_*` tables, RLS, operators). Applied to melano-crm (`orehvausvxxtvjomxchr`). Contracts are not audited — no mainnet capital without an external audit.
- The API store (`src/lib/store.ts`) is in-memory by default (demo seed + wallet `0x1111…1111`). When `NOTORIUS_SUPABASE_*` (or service-role Supabase) is set, it dual-writes assets/investors/tokenizations/investments and hydrates on boot. Whitelist/transfers remain in-memory. Force memory with `NOTORIUS_STORE=memory`. Operator RBAC helper stub: `src/lib/auth/operators.ts` (`requireOperator` — not wired to all POST routes yet).
- Core flow can be exercised via API without a wallet: `POST /api/investor/register` → admin KYC approve → `POST /api/whitelist` → `POST /api/mint` → `POST /api/transfer`; health at `GET /api/health`; integration probes at `GET /api/health/integrations`.
- `/dashboard/contratos` needs MetaMask + a Polygon (Amoy) wallet for the on-chain flow; it cannot be fully exercised headlessly.
