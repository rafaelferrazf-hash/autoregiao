-- AutoRegião — Fase 21: selo "Loja verificada" e relatório mensal das lojas.
-- Rodar no SQL Editor do Supabase (uma vez).

-- ============ 1. Selo "Loja verificada" ============
-- Só o admin marca (pelo painel /admin, com a chave do servidor). O lojista NÃO consegue se
-- autoverificar: a coluna fica fora da lista de colunas que o lojista pode alterar (fase1-seguranca).
alter table public.lojas add column if not exists verificada boolean not null default false;
alter table public.lojas add column if not exists verificada_em timestamptz;

-- ============ 2. Relatório mensal ============
-- Um registro por loja e mês (mes = primeiro dia do mês do relatório). Guarda os números do mês
-- e quando foi enviado por e-mail (automático, dia 1º) e por WhatsApp (botão no /admin).
create table if not exists public.relatorios_mensais (
  loja_id uuid not null references public.lojas(id) on delete cascade,
  mes date not null,
  dados jsonb not null,
  email_em timestamptz,
  whatsapp_em timestamptz,
  criado_em timestamptz not null default now(),
  primary key (loja_id, mes)
);
alter table public.relatorios_mensais enable row level security;

-- O lojista vê os relatórios da própria loja (no painel). Escrita só pelo servidor.
drop policy if exists "relatorios_select_dono" on public.relatorios_mensais;
create policy "relatorios_select_dono"
  on public.relatorios_mensais for select
  to authenticated
  using (exists (select 1 from public.lojas l where l.id = loja_id and l.usuario_id = auth.uid()));

-- Números do mês de uma loja (horário de Brasília). Comparação com o mês anterior.
create or replace function public.dados_relatorio_mensal(p_loja uuid, p_mes date)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with lim as (
    select (p_mes::timestamp at time zone 'America/Sao_Paulo') as ini,
           ((p_mes + interval '1 month')::timestamp at time zone 'America/Sao_Paulo') as fim,
           ((p_mes - interval '1 month')::timestamp at time zone 'America/Sao_Paulo') as ini_ant
  ),
  v as (select id, nome from public.veiculos where loja_id = p_loja),
  ev as (
    select e.veiculo_id, e.tipo, e.criado_em >= lim.ini as atual
    from public.eventos_veiculo e join v on v.id = e.veiculo_id, lim
    where e.criado_em >= lim.ini_ant and e.criado_em < lim.fim
  )
  select jsonb_build_object(
    'visualizacoes', (select count(*) from ev where atual and tipo = 'visualizacao'),
    'whatsapp', (select count(*) from ev where atual and tipo = 'whatsapp'),
    'ligacoes', (select count(*) from ev where atual and tipo = 'ligacao'),
    'visualizacoes_anterior', (select count(*) from ev where not atual and tipo = 'visualizacao'),
    'contatos_anterior', (select count(*) from ev where not atual and tipo <> 'visualizacao'),
    'mais_visto', (
      select jsonb_build_object('nome', v.nome, 'visualizacoes', count(*))
      from ev join v on v.id = ev.veiculo_id
      where ev.atual and ev.tipo = 'visualizacao'
      group by v.id, v.nome order by count(*) desc limit 1
    ),
    'no_ar', (select count(*) from public.veiculos where loja_id = p_loja and ativo is true),
    'vendidos', (select count(*) from public.veiculos, lim
                 where loja_id = p_loja and status = 'vendido' and vendido_em >= lim.ini and vendido_em < lim.fim)
  );
$$;

revoke all on function public.dados_relatorio_mensal(uuid, date) from public, anon, authenticated;
grant execute on function public.dados_relatorio_mensal(uuid, date) to service_role;
