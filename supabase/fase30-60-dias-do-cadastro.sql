-- AutoRegião — Fase 30 (30/10/2026): os 60 dias grátis da loja contam SEMPRE a partir do cadastro.
-- Decisão do Rafael: a oferta vale para todas as lojas novas, sem prazo, e não espera mais o lançamento
-- (substitui a regra de pré-lançamento da fase26). Hoje nenhuma loja real está no período grátis,
-- então não há loja para ajustar.
-- Rodar no SQL Editor do Supabase (uma vez). Pode rodar de novo sem problema.

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
      now() + interval '60 days'
    );
  end if;
  return new;
end;
$$;

-- Conferência: deve mostrar "now() + interval '60 days'" no texto da função.
select position('now() + interval ''60 days''' in pg_get_functiondef('public.criar_loja_no_cadastro()'::regprocedure)) > 0
       as regra_nova_ativa;
