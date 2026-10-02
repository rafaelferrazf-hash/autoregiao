-- Fase 8: logo/foto da loja (Perfil da Loja no painel).
-- A imagem vai para o Storage (bucket "veiculos", pasta do próprio lojista) e o endereço fica em lojas.logo_url.
-- Só aceita imagem do nosso Storage — ninguém consegue apontar para uma imagem de fora do site.

alter table public.lojas add column if not exists logo_url text;

alter table public.lojas drop constraint if exists lojas_logo_url_do_site;
alter table public.lojas add constraint lojas_logo_url_do_site check (
  logo_url is null
  or logo_url like 'https://ffwsoudbjkciaihfnmzg.supabase.co/storage/v1/object/public/veiculos/%'
);

-- O lojista pode trocar o próprio logo (as outras colunas travadas continuam travadas).
grant update (logo_url) on public.lojas to authenticated;
