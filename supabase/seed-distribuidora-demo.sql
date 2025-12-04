-- ===========================================
-- SEED DEMO DISTRIBUIDORA-SAAS
-- ===========================================
-- Este arquivo cria:
-- - 1 empresa demo
-- - 3 rotas
-- - 3 clientes
-- - 3 produtos
-- - alguns saldos de estoque
-- Use APENAS EM AMBIENTE DE TESTE.

-- Usaremos UUIDs fixos para facilitar os relacionamentos.
-- Se já existirem registros com esses IDs, ajuste antes de rodar.

-- Empresa demo
insert into public.companies (id, name, trade_name, cnpj, city, state, phone)
values (
  '00000000-0000-0000-0000-000000000001',
  'Doce & Massa Distribuidora LTDA',
  'Doce & Massa Distribuidora',
  '12.345.678/0001-99',
  'Montes Claros',
  'MG',
  '(38) 3222-0000'
)
on conflict (id) do nothing;

-- Rotas demo
insert into public.routes (id, company_id, code, name, days, notes)
values
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'ZS',
    'Zona Sul',
    'Seg / Qui',
    'Atende bairros da região Sul de Montes Claros'
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000001',
    'ZN',
    'Zona Norte',
    'Ter / Sex',
    'Atende bairros da região Norte de Montes Claros'
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000001',
    'BR135',
    'BR-135',
    'Qua',
    'Atende Bocaiúva e Engenheiro Navarro'
  )
on conflict (id) do nothing;

-- Clientes demo
insert into public.customers (
  id, company_id, name, fantasy_name, document, segment,
  route_id, city, state, address, phone, email
)
values
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000001',
    'Supermercado Central LTDA',
    'Supermercado Central',
    '11.111.111/0001-11',
    'Supermercado',
    '00000000-0000-0000-0000-000000000101',
    'Montes Claros',
    'MG',
    'Av. Principal, 1000 - Centro',
    '(38) 3211-0001',
    'compras@supercentral.com.br'
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000001',
    'Empório Bom Sabor ME',
    'Empório Bom Sabor',
    '22.222.222/0001-22',
    'Empório',
    '00000000-0000-0000-0000-000000000103',
    'Bocaiúva',
    'MG',
    'Rua das Flores, 220 - Centro',
    '(38) 3251-0002',
    'contato@emporiobomsabor.com.br'
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000001',
    'Mercearia São Pedro',
    'Mercearia São Pedro',
    '33.333.333/0001-33',
    'Mercearia',
    '00000000-0000-0000-0000-000000000102',
    'Montes Claros',
    'MG',
    'Rua São Pedro, 45 - Bairro São Pedro',
    '(38) 3233-0003',
    'sao.pedro@mercearia.com.br'
  )
on conflict (id) do nothing;

-- Produtos demo
insert into public.products (
  id, company_id, name, sku, ean, brand, category, unit, tax_ncm, price_list_default
)
values
  (
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000001',
    'Macarrão Espaguete 500g',
    'ESP-500',
    '7890000000011',
    'NutiFlex',
    'Massas',
    'pct',
    '1902.19.00',
    4.59
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000001',
    'Macarrão Parafuso 500g',
    'PAR-500',
    '7890000000028',
    'NutiFlex',
    'Massas',
    'pct',
    '1902.19.00',
    4.79
  ),
  (
    '00000000-0000-0000-0000-000000000303',
    '00000000-0000-0000-0000-000000000001',
    'Doce de Leite Cremoso 400g',
    'DDLC-400',
    '7890000000035',
    'Doce Bom',
    'Doces',
    'pct',
    '0403.90.00',
    8.90
  )
on conflict (id) do nothing;

-- Estoque demo (posição)
insert into public.stock_balances (id, company_id, product_id, location, qty_on_hand)
values
  (
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000301',
    'DEPÓSITO',
    200
  ),
  (
    '00000000-0000-0000-0000-000000000402',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000302',
    'DEPÓSITO',
    150
  ),
  (
    '00000000-0000-0000-0000-000000000403',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000303',
    'DEPÓSITO',
    80
  )
on conflict (id) do nothing;
