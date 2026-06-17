-- ================================================================
-- Idempotent: drop all tables in dependency order (CASCADE removes
-- all policies, triggers, and foreign-key references automatically)
-- ================================================================
drop table if exists return_events   cascade;
drop table if exists store_credits   cascade;
drop table if exists workflows       cascade;
drop table if exists "returns"       cascade;
drop table if exists return_policies cascade;
drop table if exists merchants       cascade;

drop function if exists update_updated_at()    cascade;
drop function if exists generate_return_code() cascade;

-- ================================================================
-- Tables
-- ================================================================

create table merchants (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        references auth.users(id) on delete cascade,
  store_name          text        not null,
  store_slug          text        unique not null,
  platform            text        check (platform in ('shopify','woocommerce')),
  platform_store_url  text,
  platform_api_key    text,
  platform_api_secret text,
  logo_url            text,
  primary_color       text        default '#2563eb',
  plan                text        default 'free' check (plan in ('free','essential','advanced','enterprise')),
  created_at          timestamptz default now()
);

create table return_policies (
  id                    uuid        primary key default gen_random_uuid(),
  merchant_id           uuid        references merchants(id) on delete cascade,
  return_window_days    int         default 30,
  refund_enabled        boolean     default true,
  exchange_enabled      boolean     default true,
  store_credit_enabled  boolean     default true,
  exchange_bonus_vnd    bigint      default 0,
  store_credit_bonus_vnd bigint     default 0,
  auto_approve          boolean     default false,
  require_photo         boolean     default false,
  allowed_reasons       text[]      default array['Sản phẩm lỗi','Sai kích thước','Không như mô tả','Thay đổi quyết định','Khác'],
  shipping_carriers     text[]      default array['GHN','GHTK','ViettelPost','J&T Express','Tự giao'],
  created_at            timestamptz default now(),
  unique(merchant_id)
);

-- Quoted because RETURNS is a PL/pgSQL keyword
create table "returns" (
  id               uuid        primary key default gen_random_uuid(),
  merchant_id      uuid        references merchants(id) on delete cascade,
  return_code      text        unique not null,
  order_id         text        not null,
  order_number     text,
  customer_name    text,
  customer_email   text,
  customer_phone   text,
  status           text        default 'pending' check (status in ('pending','approved','rejected','shipped','completed','cancelled')),
  outcome          text        check (outcome in ('refund','exchange','store_credit')),
  items            jsonb       not null default '[]',
  refund_amount    bigint      default 0,
  exchange_items   jsonb       default '[]',
  store_credit_amount bigint   default 0,
  bonus_credit     bigint      default 0,
  payment_method   text        check (payment_method in ('bank_transfer','momo','vnpay','zalopay','cash')),
  payment_info     jsonb,
  tracking_number  text,
  shipping_carrier text,
  photos           text[]      default array[]::text[],
  notes            text,
  merchant_notes   text,
  workflow_applied jsonb       default '[]',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table workflows (
  id          uuid        primary key default gen_random_uuid(),
  merchant_id uuid        references merchants(id) on delete cascade,
  name        text        not null,
  enabled     boolean     default true,
  priority    int         default 0,
  conditions  jsonb       not null default '[]',
  actions     jsonb       not null default '[]',
  created_at  timestamptz default now()
);

create table store_credits (
  id          uuid        primary key default gen_random_uuid(),
  merchant_id uuid        references merchants(id) on delete cascade,
  customer_email text,
  customer_phone text,
  amount      bigint      not null,
  used_amount bigint      default 0,
  return_id   uuid        references "returns"(id),
  expires_at  timestamptz,
  created_at  timestamptz default now()
);

create table return_events (
  id          uuid        primary key default gen_random_uuid(),
  merchant_id uuid        references merchants(id) on delete cascade,
  return_id   uuid        references "returns"(id) on delete cascade,
  event_type  text        not null,
  metadata    jsonb       default '{}',
  created_at  timestamptz default now()
);

-- ================================================================
-- Row-Level Security
-- ================================================================

alter table merchants       enable row level security;
alter table return_policies enable row level security;
alter table "returns"       enable row level security;
alter table workflows       enable row level security;
alter table store_credits   enable row level security;
alter table return_events   enable row level security;

-- Merchant-owned data
create policy "merchant owns their data" on merchants
  for all using (auth.uid() = user_id);

create policy "merchant policy" on return_policies
  for all using (merchant_id in (select id from merchants where user_id = auth.uid()));

create policy "merchant returns" on "returns"
  for all using (merchant_id in (select id from merchants where user_id = auth.uid()));

create policy "merchant workflows" on workflows
  for all using (merchant_id in (select id from merchants where user_id = auth.uid()));

create policy "merchant credits" on store_credits
  for all using (merchant_id in (select id from merchants where user_id = auth.uid()));

create policy "merchant events" on return_events
  for all using (merchant_id in (select id from merchants where user_id = auth.uid()));

-- Public access for customer portal
create policy "public portal read" on merchants
  for select using (true);

create policy "public returns create" on "returns"
  for insert with check (true);

create policy "public policy read" on return_policies
  for select using (true);

-- ================================================================
-- Functions & Triggers
-- ================================================================

create function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger returns_updated_at
  before update on "returns"
  for each row execute function update_updated_at();

create function generate_return_code()
returns trigger language plpgsql as $$
begin
  new.return_code = 'RET-' || upper(substring(gen_random_uuid()::text, 1, 8));
  return new;
end;
$$;

create trigger set_return_code
  before insert on "returns"
  for each row execute function generate_return_code();
