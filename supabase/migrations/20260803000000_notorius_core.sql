-- NOTORIUS core schema — capital-real foundation
-- Ledger tables require real on-chain tx hashes (no synthetic hashes in prod).
-- Idempotent: upgrades existing notorius_platform_tables_v2 objects when present.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Operators (Supabase Auth users with roles)
-- ---------------------------------------------------------------------------
create table if not exists public.notorius_operators (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'compliance', 'issuer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Assets
-- ---------------------------------------------------------------------------
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

alter table public.notorius_assets
  add column if not exists identity_registry_address text,
  add column if not exists deploy_tx_hash text,
  add column if not exists chain_id integer,
  add column if not exists status text,
  add column if not exists updated_at timestamptz;

update public.notorius_assets
set status = coalesce(status, 'draft'),
    updated_at = coalesce(updated_at, created_at, now())
where status is null or updated_at is null;

alter table public.notorius_assets
  alter column status set default 'draft',
  alter column status set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

do $$ begin
  alter table public.notorius_assets
    add constraint notorius_assets_status_check
    check (status in ('draft', 'deployed', 'paused'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_assets
    add constraint notorius_assets_supply_ok
    check (minted_supply <= total_supply);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_assets
    add constraint notorius_assets_deploy_tx_fmt
    check (deploy_tx_hash is null or deploy_tx_hash ~ '^0x[a-fA-F0-9]{64}$');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Investors
-- ---------------------------------------------------------------------------
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

alter table public.notorius_investors
  add column if not exists country_code text,
  add column if not exists kyc_reviewed_at timestamptz,
  add column if not exists kyc_reviewed_by uuid,
  add column if not exists updated_at timestamptz;

update public.notorius_investors
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

alter table public.notorius_investors
  alter column updated_at set default now(),
  alter column updated_at set not null;

do $$ begin
  alter table public.notorius_investors
    add constraint notorius_investors_kyc_reviewed_by_fkey
    foreign key (kyc_reviewed_by) references auth.users (id);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_investors
    add constraint notorius_investors_wallet_fmt
    check (wallet_address ~ '^0x[a-fA-F0-9]{40}$');
exception when duplicate_object then null;
end $$;

create unique index if not exists notorius_investors_wallet_idx
  on public.notorius_investors (lower(wallet_address));

-- ---------------------------------------------------------------------------
-- Whitelist
-- ---------------------------------------------------------------------------
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

alter table public.notorius_whitelist
  add column if not exists onchain_tx_hash text,
  add column if not exists status text,
  add column if not exists updated_at timestamptz;

update public.notorius_whitelist
set status = coalesce(status, 'requested'),
    updated_at = coalesce(updated_at, created_at, now())
where status is null or updated_at is null;

alter table public.notorius_whitelist
  alter column status set default 'requested',
  alter column status set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

do $$ begin
  alter table public.notorius_whitelist
    add constraint notorius_whitelist_status_check
    check (status in ('requested', 'onchain', 'revoked'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_whitelist
    add constraint notorius_whitelist_wallet_fmt
    check (wallet_address ~ '^0x[a-fA-F0-9]{40}$');
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_whitelist
    add constraint notorius_whitelist_tx_fmt
    check (onchain_tx_hash is null or onchain_tx_hash ~ '^0x[a-fA-F0-9]{64}$');
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_whitelist
    add constraint notorius_whitelist_asset_wallet unique (asset_id, wallet_address);
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Mints / Transfers (real tx_hash required)
-- ---------------------------------------------------------------------------
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

alter table public.notorius_mints
  add column if not exists block_number bigint,
  add column if not exists status text;

-- Drop synthetic / non-canonical demo hashes before format constraints
delete from public.notorius_mints
where tx_hash is null
   or tx_hash !~ '^0x[a-fA-F0-9]{64}$';

update public.notorius_mints
set status = coalesce(status, 'confirmed')
where status is null;

alter table public.notorius_mints
  alter column status set default 'pending',
  alter column status set not null;

-- Reconcile minted_supply after removing invalid mints
update public.notorius_assets a
set minted_supply = coalesce((
  select sum(m.amount)
  from public.notorius_mints m
  where m.asset_id = a.id
    and coalesce(m.status, 'confirmed') <> 'failed'
), 0),
updated_at = now();

do $$ begin
  alter table public.notorius_mints
    add constraint notorius_mints_status_check
    check (status in ('pending', 'confirmed', 'failed'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_mints
    add constraint notorius_mints_amount_check
    check (amount > 0);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_mints
    add constraint notorius_mints_wallet_fmt
    check (to_wallet ~ '^0x[a-fA-F0-9]{40}$');
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_mints
    add constraint notorius_mints_tx_fmt
    check (tx_hash ~ '^0x[a-fA-F0-9]{64}$');
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_mints
    add constraint notorius_mints_tx_hash_key unique (tx_hash);
exception when duplicate_object then null;
end $$;

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

alter table public.notorius_transfers
  add column if not exists block_number bigint,
  add column if not exists status text;

delete from public.notorius_transfers
where tx_hash is null
   or tx_hash !~ '^0x[a-fA-F0-9]{64}$';

update public.notorius_transfers
set status = coalesce(status, 'confirmed')
where status is null;

alter table public.notorius_transfers
  alter column status set default 'pending',
  alter column status set not null;

do $$ begin
  alter table public.notorius_transfers
    add constraint notorius_transfers_status_check
    check (status in ('pending', 'confirmed', 'failed'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_transfers
    add constraint notorius_transfers_amount_check
    check (amount > 0);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_transfers
    add constraint notorius_transfers_from_fmt
    check (from_wallet ~ '^0x[a-fA-F0-9]{40}$');
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_transfers
    add constraint notorius_transfers_to_fmt
    check (to_wallet ~ '^0x[a-fA-F0-9]{40}$');
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_transfers
    add constraint notorius_transfers_tx_fmt
    check (tx_hash ~ '^0x[a-fA-F0-9]{64}$');
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.notorius_transfers
    add constraint notorius_transfers_tx_hash_key unique (tx_hash);
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Handoffs
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- KYC reviews + chain events
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.notorius_operators enable row level security;
alter table public.notorius_assets enable row level security;
alter table public.notorius_investors enable row level security;
alter table public.notorius_whitelist enable row level security;
alter table public.notorius_mints enable row level security;
alter table public.notorius_transfers enable row level security;
alter table public.notorius_handoffs enable row level security;
alter table public.notorius_kyc_reviews enable row level security;
alter table public.notorius_chain_events enable row level security;

-- Drop legacy open anon write policies from notorius_platform_tables_v2
do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'notorius_operators',
        'notorius_assets',
        'notorius_investors',
        'notorius_whitelist',
        'notorius_mints',
        'notorius_transfers',
        'notorius_handoffs',
        'notorius_kyc_reviews',
        'notorius_chain_events'
      )
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

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

-- Anon: read-only probe surface on assets (service_role bypasses RLS)
create policy notorius_assets_anon_select
  on public.notorius_assets for select
  to anon
  using (true);

create policy notorius_assets_operator_all
  on public.notorius_assets for all
  to authenticated
  using (public.notorius_is_operator(null))
  with check (public.notorius_is_operator(array['admin', 'issuer']));

create policy notorius_investors_operator_all
  on public.notorius_investors for all
  to authenticated
  using (public.notorius_is_operator(null))
  with check (public.notorius_is_operator(array['admin', 'compliance', 'issuer']));

create policy notorius_whitelist_operator_all
  on public.notorius_whitelist for all
  to authenticated
  using (public.notorius_is_operator(null))
  with check (public.notorius_is_operator(array['admin', 'compliance', 'issuer']));

create policy notorius_mints_operator_all
  on public.notorius_mints for all
  to authenticated
  using (public.notorius_is_operator(null))
  with check (public.notorius_is_operator(array['admin', 'issuer']));

create policy notorius_transfers_operator_all
  on public.notorius_transfers for all
  to authenticated
  using (public.notorius_is_operator(null))
  with check (public.notorius_is_operator(array['admin', 'issuer']));

create policy notorius_handoffs_operator_all
  on public.notorius_handoffs for all
  to authenticated
  using (public.notorius_is_operator(null))
  with check (public.notorius_is_operator(array['admin', 'issuer']));

create policy notorius_kyc_operator_all
  on public.notorius_kyc_reviews for all
  to authenticated
  using (public.notorius_is_operator(array['admin', 'compliance']))
  with check (public.notorius_is_operator(array['admin', 'compliance']));

create policy notorius_events_operator_select
  on public.notorius_chain_events for select
  to authenticated
  using (public.notorius_is_operator(null));

create policy notorius_events_operator_insert
  on public.notorius_chain_events for insert
  to authenticated
  with check (public.notorius_is_operator(array['admin', 'issuer']));

create policy notorius_operators_self_select
  on public.notorius_operators for select
  to authenticated
  using (user_id = auth.uid() or public.notorius_is_operator(array['admin']));
