-- AutoRegião — Fase 3
-- Rodar no Supabase: SQL Editor > New query > colar tudo > Run (confirmar "Run this query").
-- Pode ser rodado mais de uma vez sem problema.
--
-- O que faz:
--  1. Colunas numéricas de ano e km (ano/km são TEXT) para filtrar "até 50.000 km",
--     "ano a partir de 2018" e ordenar por km. O banco mantém sozinho (coluna gerada).
--  2. Cidade do anúncio: se vier vazia, usa a cidade da loja (para o filtro de cidade
--     encontrar os carros de loja).
--  3. Loja desativada pelo admin: os anúncios dela somem do site público.
--  4. Índices para a busca.

-- ============ 1. ANO E KM NUMÉRICOS ============
-- left(...) evita estouro em textos estranhos (ex.: "2014/2015" vira 2014).
alter table public.veiculos
  add column if not exists ano_num int
  generated always as (nullif(left(regexp_replace(coalesce(ano, ''), '\D', '', 'g'), 4), '')::int) stored;

alter table public.veiculos
  add column if not exists km_num int
  generated always as (nullif(left(regexp_replace(coalesce(km, ''), '\D', '', 'g'), 9), '')::int) stored;

-- ============ 2. CIDADE DO ANÚNCIO ============
-- Mesmo trigger da Fase 2 (liga o anúncio à loja do dono), agora também preenche a cidade.
create or replace function public.vincular_veiculo_a_loja()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.usuario_id is null and new.loja_id is not null then
    select usuario_id into new.usuario_id from public.lojas where id = new.loja_id;
  end if;
  if new.usuario_id is not null then
    new.loja_id := (select id from public.lojas where usuario_id = new.usuario_id limit 1);
  end if;
  if coalesce(trim(new.cidade), '') = '' and new.loja_id is not null then
    select cidade into new.cidade from public.lojas where id = new.loja_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_vincular_veiculo_a_loja on public.veiculos;
create trigger trg_vincular_veiculo_a_loja
  before insert or update of usuario_id, loja_id, cidade on public.veiculos
  for each row execute function public.vincular_veiculo_a_loja();

-- Preenche a cidade dos anúncios que já existem sem cidade.
update public.veiculos set cidade = cidade
  where coalesce(trim(cidade), '') = '';

-- ============ 3. LOJA DESATIVADA: anúncios fora do site ============
drop policy if exists "veiculos_select_public" on public.veiculos;
create policy "veiculos_select_public"
  on public.veiculos for select
  using (
    ativo = true
    and (
      loja_id is null
      or exists (select 1 from public.lojas l where l.id = veiculos.loja_id and l.ativo is not false)
    )
  );
-- (O dono continua vendo os próprios anúncios pela policy veiculos_select_owner.)

-- ============ 4. ÍNDICES ============
create index if not exists veiculos_ativos_recentes on public.veiculos (ativo, criado_em desc);
create index if not exists veiculos_preco on public.veiculos (preco);
create index if not exists veiculos_ano_num on public.veiculos (ano_num);
create index if not exists veiculos_km_num on public.veiculos (km_num);
create index if not exists veiculos_marca on public.veiculos (lower(marca));
create index if not exists veiculos_cidade on public.veiculos (lower(cidade));
