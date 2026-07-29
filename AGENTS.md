# NOTORIUS™

See `README.md` for the product overview, surfaces, and API list.

## Cursor Cloud specific instructions

Single service: a Next.js 16 (App Router, Turbopack) app that serves the landing page, dashboard, and demo JSON API. Node 22 is required (`render.yaml` sets `NODE_VERSION=22`).

- Run dev server: `npm run dev` (serves on `http://localhost:3000`). No `.env` is needed — there are no required environment variables.
- Lint: `npm run lint`. Build: `npm run build` (runs `compile:contracts` then `next build`).
- Contract artifacts in `src/lib/web3/artifacts/` are committed, so the app runs without recompiling. Regenerate them only after editing `contracts/*.sol` via `npm run compile:contracts`.
- The API store (`src/lib/store.ts`) is in-memory and ephemeral: data resets on every server restart and is seeded with `asset_puerto_madero` plus wallet `0x1111…1111` already whitelisted. There is no database.
- Core flow can be exercised via API without a wallet: `POST /api/investor/register` → `POST /api/whitelist` → `POST /api/mint` → `POST /api/transfer`; health at `GET /api/health`.
- Known pre-existing bug (not an env issue): the dashboard `ActionForm` calls `event.currentTarget.reset()` after an `await`, so successful submits show a red "Cannot read properties of null (reading 'reset')" message even though the request already succeeded on the backend. Verify via the API (e.g. `GET /api/mint`) rather than the UI banner.
- `/dashboard/contratos` needs MetaMask + a Polygon (Amoy) wallet for the on-chain flow; it cannot be fully exercised headlessly.
