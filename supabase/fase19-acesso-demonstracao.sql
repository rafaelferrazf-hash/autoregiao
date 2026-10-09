-- AutoRegião — Fase 19: liberar os anúncios de demonstração/teste para OUTRAS contas (além da Auto Paulista).
-- Quem estiver nesta lista e entrar no site/app com o próprio e-mail vê todos os anúncios de teste
-- (os 20 da Auto Paulista e os 450 das 30 lojas fictícias). O resto do público continua sem ver.
-- Rodar no SQL Editor do Supabase (uma vez).

create table if not exists public.acesso_demonstracao (
  email text primary key,
  criado_em timestamptz not null default now()
);
alter table public.acesso_demonstracao enable row level security;
-- Sem policies: o navegador não lê nem altera a lista (só o banco usa, na regra abaixo).

-- Regra de leitura: dono da Auto Paulista OU e-mail da lista (o e-mail vem do login, não dá para falsificar).
drop policy if exists "veiculos_select_demo_dono" on public.veiculos;
create policy "veiculos_select_demo_dono"
  on public.veiculos for select
  to authenticated
  using (
    demonstracao = true and ativo = true and (
      auth.uid() = (select usuario_id from public.lojas where id = '9c29ad84-1ab6-4e16-8c72-a5916185cabc')
      or lower(auth.jwt() ->> 'email') in (select lower(email) from public.acesso_demonstracao)
    )
  );

-- ==== PARA LIBERAR UMA CONTA: troque o e-mail e rode só esta linha (uma por pessoa) ====
-- insert into public.acesso_demonstracao (email) values ('pessoa@exemplo.com') on conflict do nothing;

-- ==== PARA TIRAR O ACESSO ====
-- delete from public.acesso_demonstracao where email = 'pessoa@exemplo.com';

-- ==== PARA VER QUEM TEM ACESSO ====
-- select * from public.acesso_demonstracao order by criado_em;
