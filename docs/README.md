# NOTORIUS™ Documentation

Product documentation for the Smart Contract Engine + Tokenization Platform.

## Contents

- [Whitepaper (draft)](./WHITEPAPER.md)
- [Manual legal (borrador AR)](./MANUAL-LEGAL.md)
- [Contracts](../contracts/README.md)

## API surface (v1)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/investor/register` | Register investor |
| `POST` | `/api/whitelist` | Approve KYC + whitelist wallet for asset |
| `POST` | `/api/mint` | Mint tokens to whitelisted wallet |
| `POST` | `/api/transfer` | Controlled transfer between whitelisted wallets |
| `GET/POST` | `/api/assets` | List / create tokenized assets |
| `GET` | `/api/health` | Health check |

## Architecture

```text
/contracts   → ERC-3643-style security tokens
/src/app     → Landing + dashboards + API
/docs        → Product, legal draft, whitepaper
```

## Persistence note

The current API uses an in-memory store suitable for demos. Render disks are ephemeral — production must use a managed SQL database (or equivalent) and a regulated KYC provider.
