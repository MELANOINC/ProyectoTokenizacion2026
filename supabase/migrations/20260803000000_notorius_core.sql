-- NOTORIUS core schema — capital-real foundation
-- Ledger tables require real on-chain tx hashes (no synthetic hashes in prod).

create extension if not exists pgcrypto;

-- Operators (Supabase Auth users with roles)
create table if not exists public.notorius_operators (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'compliance', 'issuer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notorius_assets (
  id text primary key,
  name text not null,
  class text not null check (class in ('property', 'development', 'equity', 'fund', 'high_value')),
  symbol text not null unique,
  total_supply numeric not null check (total_supply > 0),
  minted_supply numeric not null default 0 check (minted_supply >= 0),
  issuer_id text not null,
  chain text not null check (chain in ('polygon', 'base')),
  contract_address text,
  identity_registry_address text,
  deploy_tx_hash text,
  chain_id integer,
  status text not null default 'draft' check (status in ('draft', 'deployed', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notorius_assets_supply_ok check (minted_supply <= total_supply),
  constraint notorius_assets_deploy_tx_fmt check (
    deploy_tx_hash is null or deploy_tx_hash ~ '^0x[a-fA-F0-9]{64}$'
  )
);

create table if not exists public.notorius_investors (
  id text primary key,
  name text not null,
  email text not null unique,
  wallet_address text not null,
  country_code text,
  kyc_status text not null default 'pending'
    check (kyc_status in ('pending', 'approved', 'rejected')),
  kyc_reviewed_at timestamptz,
  kyc_reviewed_by uuid references auth.users (id),
  whitelisted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notorius_investors_wallet_fmt check (
    wallet_address ~ '^0x[a-fA-F0-9]{40}$'
  )
);

create unique index if not exists notorius_investors_wallet_idx
  on public.notorius_investors (lower(wallet_address));

create table if not exists public.notorius_whitelist (
  id text primary key,
  investor_id text not null references public.notorius_investors (id) on delete cascade,
  asset_id text not null references public.notorius_assets (id) on delete cascade,
  wallet_address text not null,
  onchain_tx_hash text,
  status text not null default 'requested'
    check (status in ('requested', 'onchain', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notorius_whitelist_wallet_fmt check (
    wallet_address ~ '^0x[a-fA-F0-9]{40}$'
  ),
  constraint notorius_whitelist_tx_fmt check (
    onchain_tx_hash is null or onchain_tx_hash ~ '^0x[a-fA-F0-9]{64}$'
  ),
  constraint notorius_whitelist_asset_wallet unique (asset_id, wallet_address)
);

create table if not exists public.notorius_mints (
  id text primary key,
  asset_id text not null references public.notorius_assets (id) on delete cascade,
  to_wallet text not null,
  amount numeric not null check (amount > 0),
  tx_hash text not null unique,
  block_number bigint,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'failed')),
  created_at timestamptz not null default now(),
  constraint notorius_mints_wallet_fmt check (to_wallet ~ '^0x[a-fA-F0-9]{40}$'),
  constraint notorius_mints_tx_fmt check (tx_hash ~ '^0x[a-fA-F0-9]{64}$')
);

create table if not exists public.notorius_transfers (
  id text primary key,
  asset_id text not null references public.notorius_assets (id) on delete cascade,
  from_wallet text not null,
  to_wallet text not null,
  amount numeric not null check (amount > 0),
  tx_hash text not null unique,
  block_number bigint,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'failed')),
  created_at timestamptz not null default now(),
  constraint notorius_transfers_from_fmt check (from_wallet ~ '^0x[a-fA-F0-9]{40}$'),
  constraint notorius_transfers_to_fmt check (to_wallet ~ '^0x[a-fA-F0-9]{40}$'),
  constraint notorius_transfers_tx_fmt check (tx_hash ~ '^0x[a-fA-F0-9]{64}$')
);

create table if not exists public.notorius_handoffs (
  id text primary key,
  source text not null check (source in ('alenya', 'luxia', 'brunomelano', 'manual')),
  external_id text,
  lead_name text,
  lead_email text,
  lead_phone text,
  wallet_address text,
  asset_id text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received'
    check (status in ('received', 'investor_created', 'whitelisted', 'minted', 'rejected', 'error')),
  investor_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notorius_kyc_reviews (
  id text primary key default gen_random_uuid()::text,
  investor_id text not null references public.notorius_investors (id) on delete cascade,
  decision text not null check (decision in ('approved', 'rejected')),
  reviewer_id uuid references auth.users (id),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.notorius_chain_events (
  id text primary key default gen_random_uuid()::text,
  asset_id text references public.notorius_assets (id) on delete set null,
  event_name text not null,
  tx_hash text not null,
  block_number bigint,
  log_index integer,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint notorius_chain_events_tx_fmt check (tx_hash ~ '^0x[a-fA-F0-9]{64}$'),
  constraint notorius_chain_events_unique unique (tx_hash, log_index)
);

-- RLS
alter table public.notorius_operators enable row level security;
alter table public.notorius_assets enable row level security;
alter table public.notorius_investors enable row level security;
alter table public.notorius_whitelist enable row level security;
alter table public.notorius_mints enable row level security;
alter table public.notorius_transfers enable row level security;
alter table public.notorius_handoffs enable row level security;
alter table public.notorius_kyc_reviews enable row level security;
alter table public.notorius_chain_events enable row level security;

-- Helper: is active operator
create or replace function public.notorius_is_operator(roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.notorius_operators o
    where o.user_id = auth.uid()
      and o.active = true
      and (roles is null or o.role = any (roles))
  );
$$;

revoke all on function public.notorius_is_operator(text[]) from public;
grant execute on function public.notorius_is_operator(text[]) to authenticated, service_role;

-- Anon: read-only probe surface on assets (id only via view later)
drop policy if exists notorius_assets_anon_select on public.notorius_assets;
create policy notorius_assets_anon_select
  on public.notorius_assets for select
  to anon
  using (true);

drop policy if exists notorius_assets_operator_all on public.notorius_assets;
create policy notorius_assets_operator_all
  on public.notorius_assets for all
  to authenticated
  using (public.notorius_is_operator(null))
  with check (public.notorius_is_operator(array['admin', 'issuer']));

drop policy if exists notorius_investors_operator_all on public.notorius_investors;
create policy notorius_investors_operator_all
  on public.notorius_investors for all
  to authenticated
  using (public.notorius_is_operator(null))
  with check (public.notorius_is_operator(array['admin', 'compliance', 'issuer']));

drop policy if exists notorius_whitelist_operator_all on public.notorius_whitelist;
create policy notorius_whitelist_operator_all
  on public.notorius_whitelist for all
  to authenticated
  using (public.notorius_is_operator(null))
  with check (public.notorius_is_operator(array['admin', 'compliance', 'issuer']));

drop policy if exists notorius_mints_operator_all on public.notorius_mints;
create policy notorius_mints_operator_all
  on public.notorius_mints for all
  to authenticated
  using (public.notorius_is_operator(null))
  with check (public.notorius_is_operator(array['admin', 'issuer']));

drop policy if exists notorius_transfers_operator_all on public.notorius_transfers;
create policy notorius_transfers_operator_all
  on public.notorius_transfers for all
  to authenticated
  using (public.notorius_is_operator(null))
  with check (public.notorius_is_operator(array['admin', 'issuer']));

drop policy if exists notorius_handoffs_operator_all on public.notorius_handoffs;
create policy notorius_handoffs_operator_all
  on public.notorius_handoffs for all
  to authenticated
  using (public.notorius_is_operator(null))
  with check (public.notorius_is_operator(array['admin', 'issuer']));

drop policy if exists notorius_kyc_operator_all on public.notorius_kyc_reviews;
create policy notorius_kyc_operator_all
  on public.notorius_kyc_reviews for all
  to authenticated
  using (public.notorius_is_operator(array['admin', 'compliance']))
  with check (public.notorius_is_operator(array['admin', 'compliance']));

drop policy if exists notorius_events_operator_select on public.notorius_chain_events;
create policy notorius_events_operator_select
  on public.notorius_chain_events for select
  to authenticated
  using (public.notorius_is_operator(null));

drop policy if exists notorius_events_operator_insert on public.notorius_chain_events;
create policy notorius_events_operator_insert
  on public.notorius_chain_events for insert
  to authenticated
  with check (public.notorius_is_operator(array['admin', 'issuer']));

drop policy if exists notorius_operators_self_select on public.notorius_operators;
create policy notorius_operators_self_select
  on public.notorius_operators for select
  to authenticated
  using (user_id = auth.uid() or public.notorius_is_operator(array['admin']));
