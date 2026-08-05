-- Indexes, grants, and probe-compatible view for NOTORIUS

create index if not exists notorius_whitelist_wallet_idx
  on public.notorius_whitelist (lower(wallet_address));

create index if not exists notorius_whitelist_asset_idx
  on public.notorius_whitelist (asset_id);

create index if not exists notorius_mints_asset_idx
  on public.notorius_mints (asset_id);

create index if not exists notorius_mints_tx_idx
  on public.notorius_mints (tx_hash);

create index if not exists notorius_transfers_asset_idx
  on public.notorius_transfers (asset_id);

create index if not exists notorius_transfers_tx_idx
  on public.notorius_transfers (tx_hash);

create index if not exists notorius_handoffs_external_idx
  on public.notorius_handoffs (external_id);

create index if not exists notorius_handoffs_email_idx
  on public.notorius_handoffs (lower(lead_email));

create index if not exists notorius_chain_events_asset_idx
  on public.notorius_chain_events (asset_id);

create index if not exists notorius_kyc_reviews_investor_idx
  on public.notorius_kyc_reviews (investor_id);

-- Grants: service_role full; authenticated via RLS; anon select assets + view
grant select on public.notorius_assets to anon, authenticated;
grant select, insert, update, delete on public.notorius_assets to authenticated, service_role;
grant select, insert, update, delete on public.notorius_investors to authenticated, service_role;
grant select, insert, update, delete on public.notorius_whitelist to authenticated, service_role;
grant select, insert, update, delete on public.notorius_mints to authenticated, service_role;
grant select, insert, update, delete on public.notorius_transfers to authenticated, service_role;
grant select, insert, update, delete on public.notorius_handoffs to authenticated, service_role;
grant select, insert, update, delete on public.notorius_kyc_reviews to authenticated, service_role;
grant select, insert on public.notorius_chain_events to authenticated, service_role;
grant select on public.notorius_operators to authenticated, service_role;
grant insert, update, delete on public.notorius_operators to service_role;

-- Explicitly revoke anon writes (legacy notorius_platform_tables_v2 had anon ALL)
revoke insert, update, delete on public.notorius_assets from anon;
revoke insert, update, delete on public.notorius_investors from anon;
revoke insert, update, delete on public.notorius_whitelist from anon;
revoke insert, update, delete on public.notorius_mints from anon;
revoke insert, update, delete on public.notorius_transfers from anon;
revoke insert, update, delete on public.notorius_handoffs from anon;

-- Health probe view (compat with integrations probe names)
create or replace view public.notorius_assets_probe
with (security_invoker = true) as
select id, name, class, status, created_at
from public.notorius_assets;

grant select on public.notorius_assets_probe to anon, authenticated, service_role;

-- Note: public.tokenization_assets already exists as a view/table in Melano CRM.
-- Probes should use notorius_assets / notorius_assets_probe.
