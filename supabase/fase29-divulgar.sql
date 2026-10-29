-- Fase 29 — página "Divulgar" do painel (posts para redes sociais).
-- Guarda os posts COM FRASE gerados por cada loja, para o limite semanal:
--   período grátis e Profissional = 2 por semana; Premium e vitalício = 4 por semana (semana de segunda a domingo).
-- Gerar de novo o mesmo carro com a mesma frase na mesma semana não conta outra vez (unique abaixo).
-- Só o servidor (service key, /api/divulgar) lê e grava: RLS ligado e sem políticas.

create table if not exists public.posts_divulgacao (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  veiculo_id uuid not null references public.veiculos(id) on delete cascade,
  frase text not null,
  semana date not null,                 -- segunda-feira da semana (horário de Brasília)
  criado_em timestamptz not null default now(),
  unique (loja_id, veiculo_id, frase, semana)
);

create index if not exists posts_divulgacao_loja_semana on public.posts_divulgacao (loja_id, semana);

alter table public.posts_divulgacao enable row level security;
