-- AutoRegião — Fase 23: planos novos (13/10/2026).
-- Básico R$ 69 · até 15 anúncios | Profissional R$ 129 · até 40 | Premium R$ 249 · ilimitados.
-- Período grátis (trial) = recursos do Profissional (até 40). Os preços ficam no site (lib/planos.ts);
-- aqui só os limites de anúncios ativos. Quem já assinou continua com o plano e ganha o limite novo.
-- Rodar no SQL Editor do Supabase (uma vez).

create or replace function public.limite_anuncios(p_plano text)
returns integer
language sql
immutable
as $$
  select case coalesce(p_plano, 'trial')
    when 'vitalicio' then null
    when 'premium' then null
    when 'profissional' then 40
    when 'basico' then 15
    when 'trial' then 40
    else 15
  end;
$$;

-- Conferência: limite de cada plano.
select p as plano, public.limite_anuncios(p) as limite
from unnest(array['basico', 'profissional', 'premium', 'trial']) p;
