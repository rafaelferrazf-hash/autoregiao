-- AutoRegião — Fase 31: todos os veículos cadastrados hoje ficam visíveis SÓ na conta da Auto Paulista.
-- Pedido do Rafael em 16/11/2026 (antes do lançamento, ainda sem lojas reais).
--
-- Hoje: 470 anúncios de demonstração (só contas liberadas veem) + 2 anúncios da Auto Paulista (Civic e Onix),
-- que aparecem para todo mundo. Depois deste arquivo:
--   * os 2 da Auto Paulista viram "demonstração" (somem do público, do Google e dos alertas);
--   * a lista de contas liberadas fica com o Gmail de admin do Rafael e revisao@autoregiao.com.br (conta que a
--     Apple e o Google usam para revisar os apps). A Auto Paulista vê tudo pela regra da fase 20.
-- Anúncios NOVOS de lojas reais continuam aparecendo para todo mundo normalmente.
-- Rodar no SQL Editor do Supabase (uma vez).

update public.veiculos
   set demonstracao = true
 where id in ('261be1bb-8cca-445a-8951-5f5fa20b812c', '129a26f3-b28d-4f15-b421-bc027e02473a');  -- Civic e Onix

delete from public.acesso_demonstracao
 where lower(email) = 'mibososantos@gmail.com';

-- Conferência: deve mostrar 0 anúncios públicos e, na lista, só o Gmail de admin e revisao@.
select count(*) filter (where not demonstracao) as anuncios_publicos,
       count(*) filter (where demonstracao)     as anuncios_so_auto_paulista
  from public.veiculos;
select email from public.acesso_demonstracao;

-- PARA DESFAZER (se precisar):
--   update public.veiculos set demonstracao = false
--    where id in ('261be1bb-8cca-445a-8951-5f5fa20b812c', '129a26f3-b28d-4f15-b421-bc027e02473a');  -- Civic e Onix
--   insert into public.acesso_demonstracao (email) values ('mibososantos@gmail.com');
