-- ===========================================
-- SCHEMA DISTRIBUIDORA-SAAS (Supabase / Postgres)
-- ===========================================
-- IMPORTANTE:
-- 1) Rode este arquivo no SQL Editor do Supabase (projeto da distribuidora)
-- 2) Depois rode o arquivo de seed: seed-distribuidora-demo.sql

-- 1) Empresas (multi-tenant)
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade_name text,
  cnpj text,
  city text,
  state char(2),
  phone text,
  created_at timestamptz default now()
);

comment on table public.companies is 'Empresas distribuidoras que usam o SaaS.';
comment on column public.companies.trade_name is 'Nome fantasia da distribuidora.';


-- 2) Perfis de usuário (ligando auth.users à empresa)
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  role text not null check (role in ('owner','admin','sales','finance','stock','driver')),
  email text,
  created_at timestamptz default now()
);

comment on table public.user_profiles is 'Perfil do usuário dentro de uma empresa (papel e vínculo).';


-- 3) Clientes
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,              -- razão social
  fantasy_name text,               -- nome fantasia
  document text,                   -- CNPJ/CPF
  segment text,                    -- supermercado, mercearia, empório etc.
  route_id uuid,                   -- rota principal (opcional)
  city text,
  state char(2),
  address text,
  phone text,
  email text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists customers_company_idx on public.customers (company_id);
create index if not exists customers_route_idx on public.customers (route_id);


-- 4) Produtos
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  sku text,                          -- código interno
  ean text,                          -- código de barras
  brand text,
  category text,                     -- Massas, Doces etc.
  unit text not null default 'pct',  -- unidade: pct, cx, kg, etc.
  tax_ncm text,                      -- NCM
  price_list_default numeric(14,2) default 0,  -- preço base
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists products_company_idx on public.products (company_id);
create unique index if not exists products_company_sku_unique
  on public.products (company_id, sku);


-- 5) Rotas de entrega
create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  code text not null,         -- ex.: ZS, BR135
  name text not null,         -- ex.: Zona Sul, BR-135
  days text,                  -- ex.: 'Seg/Qui'
  notes text,
  created_at timestamptz default now()
);

create index if not exists routes_company_idx on public.routes (company_id);
create unique index if not exists routes_company_code_unique
  on public.routes (company_id, code);


-- 6) Veículos
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  plate text not null,
  description text,
  capacity_kg numeric(14,2),
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists vehicles_company_idx on public.vehicles (company_id);


-- 7) Pedidos
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  customer_id uuid not null references public.customers (id),
  number text,
  origin text not null default 'internal' check (origin in ('internal','portal')),
  status text not null default 'draft'
    check (status in ('draft','confirmed','in_preparation','shipped','delivered','canceled')),
  payment_terms text,
  issue_date date default (now()::date),
  delivery_date date,
  route_id uuid references public.routes (id),
  notes text,
  total_gross numeric(14,2) default 0,
  total_discount numeric(14,2) default 0,
  total_net numeric(14,2) default 0,
  created_by uuid references public.user_profiles (id),
  created_at timestamptz default now()
);

create index if not exists orders_company_idx on public.orders (company_id);
create index if not exists orders_customer_idx on public.orders (customer_id);


-- 8) Itens do pedido
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  qty numeric(14,3) not null,
  unit_price numeric(14,4) not null,
  discount_value numeric(14,2) default 0,
  total_line numeric(14,2) not null,
  notes text
);

create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_product_idx on public.order_items (product_id);


-- 9) Contas a receber (títulos / duplicatas)
create table if not exists public.receivables (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  customer_id uuid not null references public.customers (id),
  order_id uuid references public.orders (id),
  installment_number integer default 1,
  document_number text,
  due_date date not null,
  value numeric(14,2) not null,
  status text not null default 'open'
    check (status in ('open','partial','paid','canceled')),
  received_date date,
  received_value numeric(14,2),
  notes text,
  created_at timestamptz default now()
);

create index if not exists receivables_company_idx on public.receivables (company_id);
create index if not exists receivables_customer_idx on public.receivables (customer_id);
create index if not exists receivables_order_idx on public.receivables (order_id);
create index if not exists receivables_due_date_idx on public.receivables (due_date);


-- 10) Estoque - saldos por produto
create table if not exists public.stock_balances (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  product_id uuid not null references public.products (id),
  location text default 'DEPÓSITO',
  qty_on_hand numeric(14,3) not null default 0,
  updated_at timestamptz default now()
);

create unique index if not exists stock_balances_unique
  on public.stock_balances (company_id, product_id, location);


-- 11) Estoque - movimentos (Kardex)
create table if not exists public.stock_moves (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  product_id uuid not null references public.products (id),
  location text default 'DEPÓSITO',
  movement_type text not null
    check (movement_type in ('in','out','adjustment')),
  qty numeric(14,3) not null,
  unit_cost numeric(14,4),
  total_cost numeric(14,2),
  reason text,
  related_order_id uuid references public.orders (id),
  created_at timestamptz default now()
);

create index if not exists stock_moves_company_idx on public.stock_moves (company_id);
create index if not exists stock_moves_product_idx on public.stock_moves (product_id);
create index if not exists stock_moves_created_idx on public.stock_moves (created_at);
