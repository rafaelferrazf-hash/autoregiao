-- AutoRegião — conta de teste com PLANO VENCIDO, pedida pela revisão da Apple (20/10/2026, Guideline 2.1).
-- A conta revisao.vencido@autoregiao.com.br já foi criada pelo site (ficou como "comprador").
-- Este SQL a transforma em LOJA com o plano vencido. Rodar no SQL Editor do Supabase (pode rodar de novo sem problema).

-- 1. Marca a conta como lojista.
update auth.users
   set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"tipo": "lojista"}'::jsonb
 where email = 'revisao.vencido@autoregiao.com.br';

-- 2. Cria a loja (se ainda não existir).
insert into public.lojas (nome, cidade, telefone, usuario_id, ativo, plano, expira_em)
select 'Demonstração Plano Vencido', 'Teixeira de Freitas', '(73) 99820-9698', u.id, true, 'basico', now() - interval '10 days'
  from auth.users u
 where u.email = 'revisao.vencido@autoregiao.com.br'
   and not exists (select 1 from public.lojas l where l.usuario_id = u.id);

-- 3. Garante o plano vencido há 10 dias (já passou a carência de 3 dias).
update public.lojas
   set nome = 'Demonstração Plano Vencido',
       plano = 'basico',
       expira_em = now() - interval '10 days',
       plano_proximo = null,
       plano_proximo_em = null
 where usuario_id = (select id from auth.users where email = 'revisao.vencido@autoregiao.com.br');

-- Conferência: deve mostrar 1 linha, plano basico, vencida = true.
select l.nome, l.plano, l.expira_em, l.expira_em < now() as vencida
  from public.lojas l join auth.users u on u.id = l.usuario_id
 where u.email = 'revisao.vencido@autoregiao.com.br';
