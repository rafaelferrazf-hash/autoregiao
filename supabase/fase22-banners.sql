-- AutoRegião — Fase 22: banners pagos no carrossel da página inicial.
-- Vendidos pelo Rafael (Pix/WhatsApp) para lojas e negócios do ramo (despachante, seguradora,
-- financeira, autopeças, oficina...). No máximo 4 no ar ao mesmo tempo (conferido no /admin).
-- Rodar no SQL Editor do Supabase (uma vez).

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  anunciante text not null,            -- quem pagou (aparece só no /admin)
  telefone text,                       -- contato do anunciante (só no /admin, para renovar)
  titulo text not null,                -- frase principal do banner
  destaque text,                       -- parte da frase em laranja (opcional)
  texto text,                          -- frase menor embaixo
  botao text not null default 'Saiba mais',
  link text not null,                  -- página da loja, WhatsApp (https://wa.me/...) ou site
  imagem_url text not null,            -- foto (Storage do site)
  inicio date not null,
  fim date not null,
  ativo boolean not null default true, -- pausar sem apagar
  valor numeric(10,2),                 -- quanto foi cobrado (só no /admin)
  visualizacoes integer not null default 0,
  cliques integer not null default 0,
  criado_em timestamptz not null default now(),
  constraint banners_periodo check (fim >= inicio),
  constraint banners_imagem_do_site check (
    imagem_url like 'https://ffwsoudbjkciaihfnmzg.supabase.co/storage/v1/object/public/veiculos/%'
    or imagem_url like 'https://www.autoregiao.com.br/%'
  )
);

alter table public.banners enable row level security;

-- Público: só os banners no ar hoje (horário de Brasília). Escrita só pelo servidor (/admin).
drop policy if exists "banners_select_no_ar" on public.banners;
create policy "banners_select_no_ar"
  on public.banners for select
  using (ativo and (now() at time zone 'America/Sao_Paulo')::date between inicio and fim);

-- Contagem de visualizações e cliques (o site chama ao mostrar/clicar). Só conta banner no ar.
create or replace function public.contar_banner(p_id uuid, p_tipo text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.banners
     set visualizacoes = visualizacoes + case when p_tipo = 'visualizacao' then 1 else 0 end,
         cliques = cliques + case when p_tipo = 'clique' then 1 else 0 end
   where id = p_id and ativo and (now() at time zone 'America/Sao_Paulo')::date between inicio and fim;
$$;
grant execute on function public.contar_banner(uuid, text) to anon, authenticated;
