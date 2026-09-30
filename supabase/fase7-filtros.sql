-- Fase 7: filtro "Abaixo da FIPE" na busca.
-- Coluna calculada pelo próprio banco (ninguém grava nela): verdadeira quando o preço do anúncio
-- é menor que o valor da FIPE gravado pelo servidor.

alter table public.veiculos
  add column if not exists abaixo_fipe boolean
  generated always as (preco is not null and fipe_valor is not null and preco < fipe_valor) stored;

create index if not exists veiculos_abaixo_fipe on public.veiculos (abaixo_fipe) where abaixo_fipe;
