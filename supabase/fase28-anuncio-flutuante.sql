-- AutoRegião — Fase 28: anúncio flutuante (bolinha com a logo + selo, abre um cartão) — 16/10/2026.
-- Vendido pelo Rafael como os banners. Até 5 no ar ao mesmo tempo (conferido no /admin);
-- cada visitante vê um deles, sorteado a cada visita.
-- Rodar no SQL Editor do Supabase (uma vez).

create table if not exists public.anuncios_flutuantes (
  id uuid primary key default gen_random_uuid(),
  anunciante text not null,            -- nome que aparece no cartão
  telefone text,                       -- contato do anunciante (só no /admin, para renovar)
  selo text,                           -- texto curto na bolinha, ex.: "-10%"
  titulo text not null,                -- frase principal do cartão
  texto text,                          -- linha em verde
  botao text not null default 'Chamar no WhatsApp',
  link text not null,                  -- WhatsApp (https://wa.me/...), página do site ou https://
  logo_url text not null,              -- logo (Storage do site)
  inicio date not null,
  fim date not null,
  ativo boolean not null default true, -- pausar sem apagar
  valor numeric(10,2),                 -- quanto foi cobrado (só no /admin)
  visualizacoes integer not null default 0, -- bolinha apareceu (1 por visita)
  aberturas integer not null default 0,     -- tocaram na bolinha e abriram o cartão
  cliques integer not null default 0,       -- tocaram no botão do cartão
  criado_em timestamptz not null default now(),
  constraint flutuantes_periodo check (fim >= inicio),
  constraint flutuantes_logo_do_site check (
    logo_url like 'https://ffwsoudbjkciaihfnmzg.supabase.co/storage/v1/object/public/veiculos/%'
    or logo_url like 'https://www.autoregiao.com.br/%'
  )
);

alter table public.anuncios_flutuantes enable row level security;

-- Público: só os que estão no ar hoje (horário de Brasília). Escrita só pelo servidor (/admin).
drop policy if exists "flutuantes_select_no_ar" on public.anuncios_flutuantes;
create policy "flutuantes_select_no_ar"
  on public.anuncios_flutuantes for select
  using (ativo and (now() at time zone 'America/Sao_Paulo')::date between inicio and fim);

-- Contagem (o site chama ao mostrar a bolinha, ao abrir o cartão e ao clicar no botão).
create or replace function public.contar_flutuante(p_id uuid, p_tipo text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.anuncios_flutuantes
     set visualizacoes = visualizacoes + case when p_tipo = 'visualizacao' then 1 else 0 end,
         aberturas = aberturas + case when p_tipo = 'abertura' then 1 else 0 end,
         cliques = cliques + case when p_tipo = 'clique' then 1 else 0 end
   where id = p_id and ativo and (now() at time zone 'America/Sao_Paulo')::date between inicio and fim;
$$;
grant execute on function public.contar_flutuante(uuid, text) to anon, authenticated;

-- Conferência: deve mostrar 0.
select count(*) as anuncios_flutuantes from public.anuncios_flutuantes;
