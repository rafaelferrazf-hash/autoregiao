-- AutoRegião — Fase 25: contador de visitas do site e dos apps (aba "Visitas" do /admin) — 15/10/2026.
--  • Cada página aberta vira 1 linha anônima: sem IP, sem nome, sem e-mail, sem localização.
--  • "visitante" é um código embaralhado que muda todo dia (não dá para seguir a pessoa entre dias).
--  • Detalhes guardados por 90 dias; depois ficam só os totais do dia (visitas_totais).
-- Rodar no SQL Editor do Supabase (uma vez).

-- ============ 1. Visitas (detalhe, 90 dias) ============
create table if not exists public.visitas (
  id bigint generated always as identity primary key,
  dia date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  criado_em timestamptz not null default now(),
  visitante text not null,                 -- código do dia (HMAC de IP + navegador + data, feito no servidor)
  origem text not null check (origem in ('site', 'android', 'iphone')),
  aparelho text not null check (aparelho in ('celular', 'computador')),
  fonte text,                              -- google, instagram, facebook, whatsapp, outro site, direto (só na 1ª página)
  pagina text not null,                    -- inicio, busca, anuncio, vitrine, loja, lojas, fipe, anunciar, painel, conta, outras
  busca text                               -- marca/modelo procurados (só nas páginas de busca)
);
create index if not exists visitas_dia on public.visitas (dia);
create index if not exists visitas_dia_visitante on public.visitas (dia, visitante);

alter table public.visitas enable row level security;
-- Sem policies: o navegador não lê nem grava. Escrita pela rota /api/visitas (chave de servidor).

-- ============ 2. Totais por dia (guardados para sempre) ============
create table if not exists public.visitas_totais (
  dia date not null,
  origem text not null,
  visitas integer not null,
  pessoas integer not null,
  primary key (dia, origem)
);
alter table public.visitas_totais enable row level security;

-- ============ 3. Números da aba "Visitas" ============
create or replace function public.painel_visitas(p_dias integer default 30)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with hoje as (select (now() at time zone 'America/Sao_Paulo')::date as d),
  periodo as (
    select v.* from public.visitas v, hoje
    where v.dia > hoje.d - least(greatest(p_dias, 1), 90)
  ),
  -- pessoas = visitantes diferentes em cada dia, somados no período
  pessoas_dia as (select dia, origem, count(distinct visitante) as pessoas, count(*) as visitas from periodo group by dia, origem)
  select jsonb_build_object(
    'dias', least(greatest(p_dias, 1), 90),
    'hoje', (select jsonb_build_object('visitas', count(*), 'pessoas', count(distinct visitante)) from public.visitas, hoje where dia = hoje.d),
    'ontem', (select jsonb_build_object('visitas', count(*), 'pessoas', count(distinct visitante)) from public.visitas, hoje where dia = hoje.d - 1),
    'periodo', (select jsonb_build_object('visitas', coalesce(sum(visitas), 0), 'pessoas', coalesce(sum(pessoas), 0)) from pessoas_dia),
    'por_dia', coalesce((
      select jsonb_agg(jsonb_build_object('dia', dia, 'visitas', visitas, 'pessoas', pessoas) order by dia)
      from (select dia, sum(visitas) as visitas, sum(pessoas) as pessoas from pessoas_dia group by dia) x
    ), '[]'::jsonb),
    'por_origem', coalesce((
      select jsonb_object_agg(origem, jsonb_build_object('visitas', visitas, 'pessoas', pessoas))
      from (select origem, sum(visitas) as visitas, sum(pessoas) as pessoas from pessoas_dia group by origem) x
    ), '{}'::jsonb),
    'por_aparelho', coalesce((
      select jsonb_object_agg(aparelho, pessoas)
      from (select aparelho, count(distinct (dia, visitante)) as pessoas from periodo group by aparelho) x
    ), '{}'::jsonb),
    'por_fonte', coalesce((
      select jsonb_object_agg(fonte, n)
      from (select fonte, count(*) as n from periodo where fonte is not null group by fonte) x
    ), '{}'::jsonb),
    'por_pagina', coalesce((
      select jsonb_object_agg(pagina, n)
      from (select pagina, count(*) as n from periodo group by pagina) x
    ), '{}'::jsonb),
    'buscas', coalesce((
      select jsonb_agg(jsonb_build_object('busca', busca, 'n', n) order by n desc)
      from (select busca, count(distinct (dia, visitante)) as n from periodo where busca is not null
            group by busca order by n desc limit 15) x
    ), '[]'::jsonb)
  );
$$;
revoke all on function public.painel_visitas(integer) from public, anon, authenticated;
grant execute on function public.painel_visitas(integer) to service_role;

-- ============ 4. Limpeza diária (cron): guarda os totais e apaga o detalhe com mais de 90 dias ============
create or replace function public.limpar_visitas()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limite date := (now() at time zone 'America/Sao_Paulo')::date - 90;
  v_apagadas integer;
begin
  insert into public.visitas_totais (dia, origem, visitas, pessoas)
    select dia, origem, count(*), count(distinct visitante) from public.visitas
    where dia < v_limite group by dia, origem
    on conflict (dia, origem) do nothing;
  delete from public.visitas where dia < v_limite;
  get diagnostics v_apagadas = row_count;
  return v_apagadas;
end;
$$;
revoke all on function public.limpar_visitas() from public, anon, authenticated;
grant execute on function public.limpar_visitas() to service_role;

-- Conferência: deve mostrar {"dias": 30, "hoje": {...}, ...} com zeros.
select public.painel_visitas(30);
