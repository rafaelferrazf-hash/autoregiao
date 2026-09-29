-- Fase 5: alertas de veículos por e-mail ("Criar alerta" na busca).
-- O visitante (não precisa ter conta) salva uma busca + e-mail. Só vale depois de confirmar pelo
-- link do e-mail. Uma vez por dia o site manda os anúncios novos que combinam com a busca.
-- Toda leitura/escrita passa pelas rotas do site com a service key: nenhum acesso direto.

create table if not exists public.alertas (
  id            uuid primary key default gen_random_uuid(),
  email         text not null check (char_length(email) between 5 and 200),
  filtros       jsonb not null default '{}'::jsonb,
  descricao     text not null default '',
  token         uuid not null unique default gen_random_uuid(),
  criado_em     timestamptz not null default now(),
  confirmado_em timestamptz,
  cancelado_em  timestamptz,
  ultimo_envio  timestamptz
);

create index if not exists alertas_email on public.alertas (lower(email));
create index if not exists alertas_ativos on public.alertas (confirmado_em) where cancelado_em is null;

alter table public.alertas enable row level security;
revoke all on public.alertas from anon, authenticated;
