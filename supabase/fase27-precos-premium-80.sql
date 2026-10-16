-- AutoRegião — Fase 27: Premium passa a ter limite de 80 anúncios ativos (16/10/2026).
-- Preços novos ficam no site (lib/planos.ts): Básico R$99/15 · Profissional R$169/40 · Premium R$279/80.
-- Acima de 80: sob consulta (o admin pode colocar a loja no plano "vitalicio", que não tem limite).
-- Lojas Premium que já tiverem mais de 80 anúncios no ar NÃO são tiradas do ar: só não ativam novos além do limite.
-- Rodar no SQL Editor do Supabase (uma vez).

create or replace function public.limite_anuncios(p_plano text)
returns integer
language sql
immutable
as $$
  select case coalesce(p_plano, 'trial')
    when 'vitalicio' then null
    when 'premium' then 80
    when 'profissional' then 40
    when 'basico' then 15
    when 'trial' then 40
    else 15
  end;
$$;

-- Conferência: limite de cada plano (vitalicio = vazio = sem limite).
select p as plano, public.limite_anuncios(p) as limite
from unnest(array['basico', 'profissional', 'premium', 'trial', 'vitalicio']) p;

-- Lojas Premium reais com mais de 80 anúncios ativos (deve vir vazio).
select l.nome, count(*) as ativos
  from public.lojas l join public.veiculos v on v.loja_id = l.id
 where l.plano = 'premium' and v.ativo is true and coalesce(l.demonstracao, false) = false
 group by l.nome having count(*) > 80;
