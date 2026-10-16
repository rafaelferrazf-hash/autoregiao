-- AutoRegião — Fase 26: oferta de PRÉ-LANÇAMENTO (16/10/2026).
-- Lojas cadastradas ANTES do lançamento (03/11/2026) ganham os 60 dias grátis contando a partir
-- do LANÇAMENTO, e não do cadastro. Quem se cadastra depois de 03/11 continua com 60 dias a partir do cadastro.
-- (A oferta de 60 dias vale para lojas cadastradas até 30/11/2026; depois o Rafael decide se reduz para 30.)
-- Rodar no SQL Editor do Supabase (uma vez). Pode rodar de novo sem problema.
--
-- SE O LANÇAMENTO MUDAR DE DATA: trocar a data na função do passo 1 e rodar o arquivo inteiro de novo
-- (o passo 3 ajusta as lojas que já estão no período grátis).

-- 1. Data do lançamento (meia-noite, horário da Bahia).
create or replace function public.data_lancamento()
returns timestamptz
language sql
immutable
as $$ select timestamptz '2026-11-03 00:00:00-03' $$;

-- 2. Cadastro da loja: 60 dias contados do lançamento (se ainda não chegou) ou de agora.
create or replace function public.criar_loja_no_cadastro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_user_meta_data->>'tipo', '') = 'lojista' then
    insert into public.lojas (nome, cidade, telefone, usuario_id, ativo, plano, expira_em)
    values (
      coalesce(nullif(trim(new.raw_user_meta_data->>'loja'), ''), 'Minha loja'),
      coalesce(nullif(trim(new.raw_user_meta_data->>'cidade'), ''), ''),
      nullif(trim(new.raw_user_meta_data->>'telefone'), ''),
      new.id,
      true,
      'trial',
      greatest(now(), public.data_lancamento()) + interval '60 days'
    );
  end if;
  return new;
end;
$$;

-- 3. Lojas REAIS que já estão no período grátis: passam a ir até 60 dias depois do lançamento
--    (só aumenta, nunca diminui; não mexe em lojas de teste nem em quem já pagou).
update public.lojas
   set expira_em = public.data_lancamento() + interval '60 days'
 where plano = 'trial'
   and coalesce(demonstracao, false) = false
   and ativo = true
   and expira_em > now()  -- só quem ainda está no período grátis (não revive loja vencida)
   and expira_em < public.data_lancamento() + interval '60 days';

-- Conferência: lojas no período grátis e até quando vão.
select nome, cidade, plano, expira_em
  from public.lojas
 where plano = 'trial' and coalesce(demonstracao, false) = false
 order by expira_em;
