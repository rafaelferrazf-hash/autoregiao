-- AutoRegião — Fase 34 (18/11/2026): REPASSE ENTRE LOJISTAS.
-- Página /repasse: o lojista oferece a outros lojistas carros parados no estoque (de troca, não comerciais ou com
-- reparos) por um preço de repasse. O comprador comum NUNCA vê: a trava é aqui no banco (RLS), não só na tela.
--
-- Quem vê (função pode_ver_repasse):
--   * sempre: o admin (Gmail do Rafael) e a loja de teste Auto Paulista;
--   * depois que o Rafael LIBERAR no /admin: lojas com CNPJ, ativas e com o plano em dia (inclusive nos 60 dias grátis).
-- Enquanto não for liberado, os lojistas não veem nem o link.
-- Quem grava: só o servidor do site (rotas /api/repasse), que confere loja, limite e fotos. Não há permissão de
-- escrita direta para ninguém.
-- Rodar no SQL Editor do Supabase (uma vez). Pode rodar de novo sem problema.

-- 1. Chave liga/desliga (e outras configurações do site no futuro). Trancada: só o servidor lê e grava.
create table if not exists public.site_config (
  chave text primary key,
  valor jsonb not null,
  atualizado_em timestamptz not null default now()
);
alter table public.site_config enable row level security;
insert into public.site_config (chave, valor) values ('repasse_liberado', 'false'::jsonb)
on conflict (chave) do nothing;

create or replace function public.repasse_liberado()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select valor = 'true'::jsonb from public.site_config where chave = 'repasse_liberado'), false);
$$;

-- 2. Quem pode ver o Repasse.
create or replace function public.pode_ver_repasse()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'rafaelferrazf05@gmail.com'
    or auth.uid() = (select usuario_id from public.lojas where id = '9c29ad84-1ab6-4e16-8c72-a5916185cabc')
    or (public.repasse_liberado() and exists (
          select 1 from public.lojas l
          where l.usuario_id = auth.uid()
            and l.cnpj is not null
            and coalesce(l.demonstracao, false) = false
            and public.loja_em_dia(l.id)))
  );
$$;
revoke all on function public.pode_ver_repasse() from public, anon;
grant execute on function public.pode_ver_repasse() to authenticated;
revoke all on function public.repasse_liberado() from public, anon;
grant execute on function public.repasse_liberado() to authenticated;

-- 3. Os carros do repasse.
create table if not exists public.repasses (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  usuario_id uuid not null,
  veiculo_id uuid references public.veiculos(id) on delete set null,  -- quando veio de um anúncio da loja
  tipo text not null default 'carro',
  nome text not null,
  marca text, modelo text, versao text,
  ano text, km text, cambio text, combustivel text, cor text,
  preco numeric not null check (preco > 0),
  condicao text not null default 'pronto' check (condicao in ('pronto', 'reparo')),
  reparos text,
  descricao text,
  fotos text[] not null default '{}',
  cidade text,
  fipe_tipo text, fipe_marca text, fipe_modelo text, fipe_ano text, fipe_nome text,
  fipe_valor numeric, fipe_mes text,
  status text not null default 'ativo' check (status in ('ativo', 'pausado', 'repassado')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  repassado_em timestamptz
);
create index if not exists repasses_status_criado on public.repasses (status, criado_em desc);
create index if not exists repasses_loja on public.repasses (loja_id);

alter table public.repasses enable row level security;

drop policy if exists "repasses_select" on public.repasses;
create policy "repasses_select"
  on public.repasses for select
  to authenticated
  using (usuario_id = auth.uid() or (status = 'ativo' and public.pode_ver_repasse()));

-- Conferência: deve mostrar false (ainda fechado) e 0 carros.
select public.repasse_liberado() as repasse_liberado, (select count(*) from public.repasses) as carros_no_repasse;
