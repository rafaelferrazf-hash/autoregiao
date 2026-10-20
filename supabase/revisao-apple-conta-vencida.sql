-- AutoRegião — conta de teste com PLANO VENCIDO, pedida pela revisão da Apple (20/10/2026, Guideline 2.1).
-- Antes: criar a conta de LOJA pelo site (www.autoregiao.com.br/cadastro) com o e-mail
--        revisao.vencido@autoregiao.com.br e confirmar o e-mail (chega no Gmail pelo ImprovMX).
-- Depois: rodar este arquivo no SQL Editor do Supabase (uma vez).

update public.lojas
   set nome = 'Demonstração Plano Vencido',
       plano = 'basico',
       expira_em = now() - interval '10 days',   -- venceu há 10 dias (já passou a carência de 3 dias)
       plano_proximo = null,
       plano_proximo_em = null
 where usuario_id = (select id from auth.users where email = 'revisao.vencido@autoregiao.com.br');

-- Conferência: deve mostrar 1 linha, plano basico, vencida.
select l.nome, l.plano, l.expira_em, l.expira_em < now() as vencida
  from public.lojas l join auth.users u on u.id = l.usuario_id
 where u.email = 'revisao.vencido@autoregiao.com.br';
