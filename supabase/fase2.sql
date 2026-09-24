-- AutoRegião — Fase 2
-- Rodar no Supabase: SQL Editor > New query > colar tudo > Run (confirmar "Run this query").
-- Pode ser rodado mais de uma vez sem problema.
--
-- O que faz:
--  1. Anúncio sempre ligado à loja do dono (trigger). Antes, "novo anúncio" não gravava
--     loja_id, então o anúncio não aparecia na página da loja. Também impede que alguém
--     aponte o próprio anúncio para a loja de outra pessoa.
--  2. Tabela eventos_veiculo: visualizações e cliques em WhatsApp/Ligar. Só o servidor
--     grava (rota /api/eventos, com a service key); o navegador não lê nem escreve.
--  3. Função painel_estatisticas(): números do painel do lojista logado.

-- ============ 1. VEICULOS: loja_id e usuario_id sempre coerentes ============
create or replace function public.vincular_veiculo_a_loja()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Anúncio antigo sem dono, mas com loja: herda o dono da loja.
  if new.usuario_id is null and new.loja_id is not null then
    select usuario_id into new.usuario_id from public.lojas where id = new.loja_id;
  end if;
  -- A loja do anúncio é sempre a loja do dono (ignora o que vier do navegador).
  if new.usuario_id is not null then
    new.loja_id := (select id from public.lojas where usuario_id = new.usuario_id limit 1);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_vincular_veiculo_a_loja on public.veiculos;
create trigger trg_vincular_veiculo_a_loja
  before insert or update of usuario_id, loja_id on public.veiculos
  for each row execute function public.vincular_veiculo_a_loja();

-- Corrige os anúncios que já existem (dispara o trigger acima).
update public.veiculos set usuario_id = usuario_id
  where loja_id is null or usuario_id is null;

-- ============ 2. EVENTOS (visualizações e contatos) ============
create table if not exists public.eventos_veiculo (
  id bigint generated always as identity primary key,
  veiculo_id uuid not null references public.veiculos(id) on delete cascade,
  tipo text not null check (tipo in ('visualizacao', 'whatsapp', 'ligacao')),
  visitante text,           -- hash anônimo (IP + navegador), só para não contar repetido
  criado_em timestamptz not null default now()
);

create index if not exists eventos_veiculo_veiculo_data on public.eventos_veiculo (veiculo_id, criado_em desc);
create index if not exists eventos_veiculo_dedupe on public.eventos_veiculo (visitante, veiculo_id, tipo, criado_em desc);

alter table public.eventos_veiculo enable row level security;
-- Sem policies: navegador não acessa. Escrita pela rota /api/eventos (service key);
-- leitura agregada pela função abaixo.

-- ============ 3. ESTATÍSTICAS DO PAINEL ============
-- Retorna JSON com os números dos anúncios do lojista logado (auth.uid()).
create or replace function public.painel_estatisticas()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_usuario uuid := auth.uid();
  v_resultado json;
begin
  if v_usuario is null then
    return null;
  end if;

  with meus as (
    select v.id, v.nome from public.veiculos v
    where v.usuario_id = v_usuario
       or v.loja_id in (select id from public.lojas where usuario_id = v_usuario)
  ),
  ev as (
    select e.* from public.eventos_veiculo e join meus m on m.id = e.veiculo_id
    where e.criado_em >= now() - interval '60 days'
  )
  select json_build_object(
    'visualizacoes_30d', (select count(*) from ev where tipo = 'visualizacao' and criado_em >= now() - interval '30 days'),
    'visualizacoes_30d_anterior', (select count(*) from ev where tipo = 'visualizacao' and criado_em < now() - interval '30 days'),
    'contatos_30d', (select count(*) from ev where tipo <> 'visualizacao' and criado_em >= now() - interval '30 days'),
    'contatos_30d_anterior', (select count(*) from ev where tipo <> 'visualizacao' and criado_em < now() - interval '30 days'),
    -- Visitas por dia nos últimos 7 dias (horário de Brasília), inclusive dias com zero.
    'visitas_7d', (
      select json_agg(json_build_object('dia', d.dia, 'total', coalesce(c.total, 0)) order by d.dia)
      from generate_series(
             (now() at time zone 'America/Sao_Paulo')::date - 6,
             (now() at time zone 'America/Sao_Paulo')::date,
             interval '1 day') as d(dia)
      left join (
        select (criado_em at time zone 'America/Sao_Paulo')::date as dia, count(*) as total
        from ev where tipo = 'visualizacao'
        group by 1
      ) c on c.dia = d.dia::date
    ),
    -- Últimos 5 cliques de contato (anônimos: não sabemos quem clicou).
    'contatos_recentes', (
      select coalesce(json_agg(x order by x.criado_em desc), '[]'::json) from (
        select m.nome as veiculo, e.tipo, e.criado_em
        from ev e join meus m on m.id = e.veiculo_id
        where e.tipo <> 'visualizacao'
        order by e.criado_em desc
        limit 5
      ) x
    ),
    -- Visualizações e contatos por anúncio (30 dias).
    'por_veiculo', (
      select coalesce(json_object_agg(m.id, json_build_object(
        'visualizacoes', (select count(*) from ev where veiculo_id = m.id and tipo = 'visualizacao' and criado_em >= now() - interval '30 days'),
        'contatos', (select count(*) from ev where veiculo_id = m.id and tipo <> 'visualizacao' and criado_em >= now() - interval '30 days')
      )), '{}'::json)
      from meus m
    )
  ) into v_resultado;

  return v_resultado;
end;
$$;

revoke all on function public.painel_estatisticas() from public, anon;
grant execute on function public.painel_estatisticas() to authenticated;
