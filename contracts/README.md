# NOTORIUS™ Contracts

Security-token scaffolds aligned with ERC-3643 patterns:

| Contract | Role |
|---|---|
| `IdentityRegistry.sol` | KYC / identity verification mapping |
| `SecurityToken.sol` | Whitelist-gated mint + controlled transfers |

## Target chains

- Polygon
- Base

## Status

Scaffold for R&D. Not audited. Estimated production audit range: USD 15–50k.

**Role hardening (done):** both contracts use lightweight role mappings (no OpenZeppelin) —
`ADMIN_ROLE`, `COMPLIANCE_ROLE`, and (on `SecurityToken`) `ISSUER_ROLE`. Deployer receives
all roles; `owner` remains as the admin alias. Compliance owns KYC/whitelist; issuer owns mint.

## Next hardening steps

1. Adopt full ERC-3643 modular stack (or ONCHAINID-compatible identity).
2. Add compliance modules (country restrictions, holding periods).
3. Formal verification + external audit before mainnet capital.
