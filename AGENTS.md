# NOTORIUS™

See `README.md` for the product overview, surfaces, and API list.

## Cursor Cloud specific instructions

Single service: a Next.js 16 (App Router, Turbopack) app that serves the landing page, dashboard, and demo JSON API. Node 22 is required (`render.yaml` sets `NODE_VERSION=22`).

- Run dev server: `npm run dev` (serves on `http://localhost:3000`). No `.env` is needed — there are no required environment variables. See `.env.example` for optional Melano ecosystem hooks.
- Lint: `npm run lint`. Typecheck: `npm run typecheck`. Tests: `npm test`. Build: `npm run build` (runs `compile:contracts` then `next build`). Env presence audit (no secrets): `npm run check:env`. Optional live probes: `npm run probe:integrations` (reads `.env.local` overrides; exits non-zero only if Supabase/Mercado Pago are RED).
- Known UI bug fixed: `ActionForm` now resets via a captured form element reference after `await` (no null `currentTarget`).
- Contract artifacts in `src/lib/web3/artifacts/` are committed, so the app runs without recompiling. Regenerate them only after editing `contracts/*.sol` via `npm run compile:contracts`.
- The API store (`src/lib/store.ts`) is in-memory and ephemeral: data resets on every server restart and is seeded with `asset_puerto_madero` plus wallet `0x1111…1111` already whitelisted. There is no database.
- Core flow can be exercised via API without a wallet: `POST /api/investor/register` → `POST /api/whitelist` → `POST /api/mint` → `POST /api/transfer`; health at `GET /api/health`; integration probes at `GET /api/health/integrations`.
- `/dashboard/contratos` needs MetaMask + a Polygon (Amoy) wallet for the on-chain flow; it cannot be fully exercised headlessly.
