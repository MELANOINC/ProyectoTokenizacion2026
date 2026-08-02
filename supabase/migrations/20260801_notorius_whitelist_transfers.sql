-- Optional native tables for Notorius (orehvausvxxtvjomxchr).
-- Until applied, the app persists whitelist/transfers via public.audit_logs.

create table if not exists public.notorius_whitelist (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  asset_id uuid not null references public.assets(id) on delete cascade,
  investor_id uuid not null references public.investors(id) on delete cascade,
  wallet_address text not null,
  created_at timestamptz not null default now(),
  unique (asset_id, wallet_address)
);

create table if not exists public.notorius_transfers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  asset_id uuid not null references public.assets(id) on delete cascade,
  from_wallet text not null,
  to_wallet text not null,
  amount numeric not null check (amount > 0),
  tx_hash text,
  created_at timestamptz not null default now()
);

create index if not exists notorius_whitelist_asset_idx
  on public.notorius_whitelist (asset_id);
create index if not exists notorius_transfers_asset_idx
  on public.notorius_transfers (asset_id);
