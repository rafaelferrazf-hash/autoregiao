-- AutoRegião — Fase 33 (16/11/2026): a loja de teste Auto Paulista sai do plano "vitalício" e vai para
-- Premium por 6 meses, para as demonstrações aos lojistas mostrarem um plano igual ao que eles terão
-- (pedido do Rafael: não dar margem para perguntas sobre plano vitalício).
-- Vence em 6 meses (~16/05/2027): antes disso, rodar de novo para renovar.
-- Rodar no SQL Editor do Supabase (uma vez).

update public.lojas
   set plano = 'premium',
       expira_em = now() + interval '6 months',
       plano_proximo = null,
       plano_proximo_em = null
 where id = '9c29ad84-1ab6-4e16-8c72-a5916185cabc';  -- Auto Paulista

-- Conferência: deve mostrar Auto Paulista | premium | data daqui a 6 meses.
select nome, plano, expira_em::date as vence_em from public.lojas where id = '9c29ad84-1ab6-4e16-8c72-a5916185cabc';

-- PARA DESFAZER (voltar ao vitalício):
--   update public.lojas set plano = 'vitalicio', expira_em = null where id = '9c29ad84-1ab6-4e16-8c72-a5916185cabc';
