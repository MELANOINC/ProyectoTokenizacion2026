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

## Next hardening steps

1. Adopt full ERC-3643 modular stack (or ONCHAINID-compatible identity).
2. Add compliance modules (country restrictions, holding periods).
3. Add role separation (agent, compliance officer, issuer).
4. Formal verification + external audit before mainnet capital.
