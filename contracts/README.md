# NOTORIUS™ Contracts

Security-token scaffolds aligned with ERC-3643 patterns, with role separation:

| Contract | Role |
|---|---|
| `IdentityRegistry.sol` | KYC / identity verification (`ADMIN_ROLE`, `COMPLIANCE_ROLE`) |
| `SecurityToken.sol` | Whitelist-gated mint + controlled transfers (`ADMIN_ROLE`, `COMPLIANCE_ROLE`, `ISSUER_ROLE`) |

## Target chains

- Polygon (Amoy / Mainnet)
- Base (schema-ready; wagmi transport pending)

## Status

Hardened scaffold for capital-real foundation. **Not audited.** Do not deploy mainnet capital without an external audit (est. USD 15–50k).

## Roles

- Deployer receives admin + compliance (+ issuer on SecurityToken).
- `registerIdentity` / `setWhitelisted` → compliance
- `mint` → issuer

## Next (Fase 2)

1. Full ERC-3643 / ONCHAINID modular stack
2. Compliance modules (country, holding periods)
3. Formal verification + external audit before mainnet capital
