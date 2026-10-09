-- AutoRegião — Fase 18: 30 LOJAS DE TESTE (fictícias), 15 carros cada (450 anúncios).
-- 10 Premium, 10 Profissional, 10 Básico (Básico: 10 no ar + 5 pausados, por causa do limite do plano).
-- Tudo marcado como demonstração: SÓ a conta da Auto Paulista (logada) vê os anúncios; fora do Google,
-- do sitemap, da página "Lojas" e dos e-mails de alerta. Fotos = as dos 20 carros de demonstração (fase13).
-- Rodar no SQL Editor do Supabase (uma vez).
--
-- PARA APAGAR TUDO (lojas de teste + todos os anúncios de demonstração), rodar só estas duas linhas:
--   delete from public.veiculos where demonstracao = true;
--   delete from public.lojas where demonstracao = true;

-- 1. Marca de "loja de teste".
alter table public.lojas add column if not exists demonstracao boolean not null default false;

-- 2. Logo das lojas de teste vem do próprio site (/demo/lojas/), além do nosso Storage.
alter table public.lojas drop constraint if exists lojas_logo_url_do_site;
alter table public.lojas add constraint lojas_logo_url_do_site check (
  logo_url is null
  or logo_url like 'https://ffwsoudbjkciaihfnmzg.supabase.co/storage/v1/object/public/veiculos/%'
  or logo_url like 'https://www.autoregiao.com.br/demo/%'
);

-- 3. O dono da Auto Paulista vê TODOS os anúncios de demonstração (também os das lojas de teste).
drop policy if exists "veiculos_select_demo_dono" on public.veiculos;
create policy "veiculos_select_demo_dono"
  on public.veiculos for select
  to authenticated
  using (demonstracao = true and ativo = true
         and auth.uid() = (select usuario_id from public.lojas where id = '9c29ad84-1ab6-4e16-8c72-a5916185cabc'));

-- 4. As 30 lojas (sem conta de usuário; WhatsApp = o da Auto Paulista, para nenhum teste ir para desconhecidos).
insert into public.lojas (nome, cidade, estado, plano, logo_url, endereco, horario, descricao, telefone, whatsapp, ativo, expira_em, demonstracao, usuario_id)
select v.nome, v.cidade, v.estado, v.plano, v.logo, v.endereco, 'Seg. a Sex. 08:00 às 18:00 · Sáb. 08:00 às 12:00',
       'Loja fictícia de TESTE do AutoRegião (não existe).', ap.telefone, ap.whatsapp, true, now() + interval '1 year', true, null
from (select coalesce(whatsapp, telefone) as whatsapp, telefone from public.lojas where id = '9c29ad84-1ab6-4e16-8c72-a5916185cabc') ap,
(values
  ('Bahia Sul Veículos', 'Teixeira de Freitas', 'BA', 'premium', 'https://www.autoregiao.com.br/demo/lojas/loja-01.jpg', 'Rua Marechal Castelo Branco, 107, Centro'),
  ('Costa do Descobrimento Motors', 'Porto Seguro', 'BA', 'premium', 'https://www.autoregiao.com.br/demo/lojas/loja-02.jpg', 'Av. Presidente Kennedy, 114, Centro'),
  ('Extremo Sul Automóveis', 'Teixeira de Freitas', 'BA', 'premium', 'https://www.autoregiao.com.br/demo/lojas/loja-03.jpg', 'Rua Sete de Setembro, 121, Centro'),
  ('Prime Car Teixeira', 'Teixeira de Freitas', 'BA', 'premium', 'https://www.autoregiao.com.br/demo/lojas/loja-04.jpg', 'Av. Uirapuru, 128, Centro'),
  ('Atlântico Veículos', 'Alcobaça', 'BA', 'premium', 'https://www.autoregiao.com.br/demo/lojas/loja-05.jpg', 'Rua Juscelino Kubitschek, 135, Centro'),
  ('Rota 101 Multimarcas', 'Itamaraju', 'BA', 'premium', 'https://www.autoregiao.com.br/demo/lojas/loja-06.jpg', 'Av. São Paulo, 142, Centro'),
  ('Imperial Seminovos', 'Teixeira de Freitas', 'BA', 'premium', 'https://www.autoregiao.com.br/demo/lojas/loja-07.jpg', 'Rua Bahia, 149, Centro'),
  ('Horizonte Car', 'Eunápolis', 'BA', 'premium', 'https://www.autoregiao.com.br/demo/lojas/loja-08.jpg', 'Av. Brasil, 156, Centro'),
  ('Nobre Veículos', 'Teixeira de Freitas', 'BA', 'premium', 'https://www.autoregiao.com.br/demo/lojas/loja-09.jpg', 'Rua Rio de Janeiro, 163, Centro'),
  ('Vale do Mucuri Motors', 'Nanuque', 'MG', 'premium', 'https://www.autoregiao.com.br/demo/lojas/loja-10.jpg', 'Av. Getúlio Vargas, 170, Centro'),
  ('Ponto Certo Veículos', 'Teixeira de Freitas', 'BA', 'profissional', 'https://www.autoregiao.com.br/demo/lojas/loja-11.jpg', 'Rua Marechal Castelo Branco, 177, Centro'),
  ('Avenida Car', 'Teixeira de Freitas', 'BA', 'profissional', 'https://www.autoregiao.com.br/demo/lojas/loja-12.jpg', 'Av. Presidente Kennedy, 184, Centro'),
  ('Garagem Central', 'Itamaraju', 'BA', 'profissional', 'https://www.autoregiao.com.br/demo/lojas/loja-13.jpg', 'Rua Sete de Setembro, 191, Centro'),
  ('Top Drive Seminovos', 'Teixeira de Freitas', 'BA', 'profissional', 'https://www.autoregiao.com.br/demo/lojas/loja-14.jpg', 'Av. Uirapuru, 198, Centro'),
  ('Estrela Automóveis', 'Mucuri', 'BA', 'profissional', 'https://www.autoregiao.com.br/demo/lojas/loja-15.jpg', 'Rua Juscelino Kubitschek, 205, Centro'),
  ('Litoral Car', 'Prado', 'BA', 'profissional', 'https://www.autoregiao.com.br/demo/lojas/loja-16.jpg', 'Av. São Paulo, 212, Centro'),
  ('Família Veículos', 'Teixeira de Freitas', 'BA', 'profissional', 'https://www.autoregiao.com.br/demo/lojas/loja-17.jpg', 'Rua Bahia, 219, Centro'),
  ('Arena Motors', 'Eunápolis', 'BA', 'profissional', 'https://www.autoregiao.com.br/demo/lojas/loja-18.jpg', 'Av. Brasil, 226, Centro'),
  ('Conquista Car', 'Medeiros Neto', 'BA', 'profissional', 'https://www.autoregiao.com.br/demo/lojas/loja-19.jpg', 'Rua Rio de Janeiro, 233, Centro'),
  ('Real Seminovos', 'Teixeira de Freitas', 'BA', 'profissional', 'https://www.autoregiao.com.br/demo/lojas/loja-20.jpg', 'Av. Getúlio Vargas, 240, Centro'),
  ('JR Veículos', 'Teixeira de Freitas', 'BA', 'basico', 'https://www.autoregiao.com.br/demo/lojas/loja-21.jpg', 'Rua Marechal Castelo Branco, 247, Centro'),
  ('Nova Era Automóveis', 'Posto da Mata', 'BA', 'basico', 'https://www.autoregiao.com.br/demo/lojas/loja-22.jpg', 'Av. Presidente Kennedy, 254, Centro'),
  ('Show Car', 'Teixeira de Freitas', 'BA', 'basico', 'https://www.autoregiao.com.br/demo/lojas/loja-23.jpg', 'Rua Sete de Setembro, 261, Centro'),
  ('Via Sul Veículos', 'Caravelas', 'BA', 'basico', 'https://www.autoregiao.com.br/demo/lojas/loja-24.jpg', 'Av. Uirapuru, 268, Centro'),
  ('Mega Veículos', 'Teixeira de Freitas', 'BA', 'basico', 'https://www.autoregiao.com.br/demo/lojas/loja-25.jpg', 'Rua Juscelino Kubitschek, 275, Centro'),
  ('Alvorada Car', 'Itamaraju', 'BA', 'basico', 'https://www.autoregiao.com.br/demo/lojas/loja-26.jpg', 'Av. São Paulo, 282, Centro'),
  ('Bom Negócio Veículos', 'Teixeira de Freitas', 'BA', 'basico', 'https://www.autoregiao.com.br/demo/lojas/loja-27.jpg', 'Rua Bahia, 289, Centro'),
  ('Rei dos Seminovos', 'Porto Seguro', 'BA', 'basico', 'https://www.autoregiao.com.br/demo/lojas/loja-28.jpg', 'Av. Brasil, 296, Centro'),
  ('Ágil Car', 'Nova Viçosa', 'BA', 'basico', 'https://www.autoregiao.com.br/demo/lojas/loja-29.jpg', 'Rua Rio de Janeiro, 303, Centro'),
  ('Planalto Veículos', 'Teixeira de Freitas', 'BA', 'basico', 'https://www.autoregiao.com.br/demo/lojas/loja-30.jpg', 'Av. Getúlio Vargas, 310, Centro')
) as v(nome, cidade, estado, plano, logo, endereco)
where not exists (select 1 from public.lojas l where l.demonstracao and l.nome = v.nome);

-- 5. 15 carros por loja, sorteados entre os 20 de demonstração, com preço/km/situação variando.
insert into public.veiculos (
  nome, tipo, marca, modelo, versao, ano, km, cambio, combustivel, cor, portas, carroceria,
  preco, aceita_troca, opcionais, descricao, fotos, ativo, status, condicoes,
  fipe_tipo, fipe_marca, fipe_modelo, fipe_ano, fipe_nome, demonstracao, criado_em,
  usuario_id, loja_id, nome_contato, telefone, cidade
)
select x.nome, x.tipo, x.marca, x.modelo, x.versao, x.ano,
       (round(coalesce(nullif(regexp_replace(x.km, '\D', '', 'g'), '')::int, 50000) * (0.75 + random() * 0.5) / 1000) * 1000)::int::text,
       x.cambio, x.combustivel, x.cor, x.portas, x.carroceria,
       round(x.preco * (0.90 + random() * 0.18) / 100) * 100,
       x.aceita_troca, x.opcionais, x.descricao, x.fotos,
       not (x.plano = 'basico' and x.n > 10), 'ativo',
       (select coalesce(array_agg(c), '{}') from unnest(array['IPVA pago','Licenciado','Único dono','Revisões em dia','Laudo cautelar aprovado','Com garantia']) c where (hashtext(c || x.nova_loja::text || x.n::text) & 1023) < 360),
       x.fipe_tipo, x.fipe_marca, x.fipe_modelo, x.fipe_ano, x.fipe_nome, true,
       now() - (random() * interval '30 days'),
       null, x.nova_loja, x.loja_nome, x.loja_tel, x.loja_cidade
from (
  select d.*, l.id as nova_loja, l.nome as loja_nome, coalesce(l.whatsapp, l.telefone) as loja_tel, l.cidade as loja_cidade, l.plano,
         row_number() over (partition by l.id order by md5(d.id::text || l.id::text)) as n
  from public.lojas l
  cross join public.veiculos d
  where l.demonstracao
    and d.demonstracao and d.loja_id = '9c29ad84-1ab6-4e16-8c72-a5916185cabc'
    and not exists (select 1 from public.veiculos v where v.loja_id = l.id)
) x
where x.n <= 15;

-- Conferência: lojas de teste por plano, anúncios no ar e pausados.
select l.plano, count(distinct l.id) as lojas,
       count(v.id) filter (where v.ativo) as no_ar,
       count(v.id) filter (where not v.ativo) as pausados
from public.lojas l left join public.veiculos v on v.loja_id = l.id
where l.demonstracao
group by l.plano order by l.plano;
