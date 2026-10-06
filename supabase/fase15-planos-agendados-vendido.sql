-- Fase 15 (decidido em 06/10/2026):
--  1. Plano MENOR pago com o plano atual ainda em dia (ex.: Básico durante o período grátis) só começa
--     quando o atual termina — até lá o lojista mantém o limite atual (grátis = 30 anúncios).
--     Plano igual ou maior vale na hora.
--  2. Quando o plano muda e a loja tem mais anúncios ativos que o novo limite, TODOS são pausados;
--     o lojista reativa os que quiser até o limite. Os outros só podem ser finalizados ou excluídos.
--  3. "Finalizar" = marcar como vendido: sai do site, fica no painel como "Vendido", não conta no
--     limite e não volta mais ao ar.

alter table public.lojas add column if not exists plano_proximo text;
alter table public.lojas add column if not exists plano_proximo_em timestamptz;
alter table public.veiculos add column if not exists vendido_em timestamptz;

-- "a" tem limite menor que "b"? (null = sem limite)
create or replace function public.limite_menor(a text, b text)
returns boolean
language sql
immutable
as $$
  select public.limite_anuncios(a) is not null
     and (public.limite_anuncios(b) is null or public.limite_anuncios(a) < public.limite_anuncios(b));
$$;

-- Passou do limite do plano? Pausa todos os anúncios ativos da loja. Retorna quantos pausou.
create or replace function public.ajustar_anuncios_ao_limite(p_loja uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limite integer;
  v_ativos integer;
  v_pausados integer := 0;
begin
  select public.limite_anuncios(plano) into v_limite from public.lojas where id = p_loja;
  if v_limite is null then return 0; end if;
  select count(*) into v_ativos from public.veiculos where loja_id = p_loja and ativo is true;
  if v_ativos > v_limite then
    update public.veiculos set ativo = false, status = 'pausado' where loja_id = p_loja and ativo is true;
    get diagnostics v_pausados = row_count;
  end if;
  return v_pausados;
end;
$$;
revoke all on function public.ajustar_anuncios_ao_limite(uuid) from public, anon, authenticated;
grant execute on function public.ajustar_anuncios_ao_limite(uuid) to service_role;

-- Pagamento aprovado (substitui a versão da fase 4b).
create or replace function public.aplicar_pagamento_aprovado(p_pagamento uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pag public.pagamentos%rowtype;
  v_loja public.lojas%rowtype;
  v_dias integer;
begin
  select * into v_pag from public.pagamentos where id = p_pagamento for update;
  if not found then
    return 'nao_encontrado';
  end if;
  if v_pag.aplicado then
    return 'ja_aplicado';
  end if;

  select * into v_loja from public.lojas where id = v_pag.loja_id for update;
  if v_loja.plano = 'vitalicio' then
    update public.pagamentos set aplicado = true, atualizado_em = now() where id = v_pag.id;
    return 'vitalicia';
  end if;

  v_dias := v_pag.meses * 30;

  if v_loja.expira_em is not null and v_loja.expira_em > now()
     and public.limite_menor(v_pag.plano, v_loja.plano) then
    -- Plano menor com o atual em dia: agenda para quando o atual terminar (mantém o limite atual até lá).
    update public.lojas
      set plano_proximo = v_pag.plano,
          plano_proximo_em = coalesce(plano_proximo_em, expira_em),
          expira_em = expira_em + make_interval(days => v_dias)
      where id = v_loja.id;
  else
    -- Igual ou maior (ou plano já vencido): vale na hora; soma a partir do vencimento atual ou de hoje.
    update public.lojas
      set plano = v_pag.plano,
          plano_proximo = null,
          plano_proximo_em = null,
          expira_em = greatest(coalesce(expira_em, now()), now()) + make_interval(days => v_dias)
      where id = v_loja.id;
    perform public.ajustar_anuncios_ao_limite(v_loja.id);
  end if;
  -- (não mexe em `ativo` da loja: loja desativada pelo admin continua desativada mesmo pagando)

  update public.pagamentos
    set aplicado = true,
        aprovado_em = coalesce(aprovado_em, now()),
        atualizado_em = now()
    where id = v_pag.id;

  return 'ok';
end;
$$;
revoke all on function public.aplicar_pagamento_aprovado(uuid) from public, anon, authenticated;
grant execute on function public.aplicar_pagamento_aprovado(uuid) to service_role;

-- Rotina diária (cron do site): troca para o plano agendado quando chega a data. Retorna quantas lojas trocou.
create or replace function public.virar_planos_agendados()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loja record;
  v_qtd integer := 0;
begin
  for v_loja in
    select id, plano_proximo from public.lojas
    where plano_proximo is not null and plano_proximo_em <= now()
    for update
  loop
    update public.lojas set plano = v_loja.plano_proximo, plano_proximo = null, plano_proximo_em = null where id = v_loja.id;
    perform public.ajustar_anuncios_ao_limite(v_loja.id);
    v_qtd := v_qtd + 1;
  end loop;
  return v_qtd;
end;
$$;
revoke all on function public.virar_planos_agendados() from public, anon, authenticated;
grant execute on function public.virar_planos_agendados() to service_role;

-- Anúncio vendido: fica fora do ar para sempre (só o admin/servidor desfaz).
create or replace function public.regras_anuncio_vendido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.status = 'vendido' and coalesce(auth.role(), '') <> 'service_role' then
    new.status := 'vendido';
    new.vendido_em := old.vendido_em;
    if new.ativo is true then
      raise exception 'anuncio_vendido' using hint = 'Anúncio marcado como vendido não volta ao ar.';
    end if;
  end if;
  if new.status = 'vendido' then
    new.ativo := false;
    new.vendido_em := coalesce(new.vendido_em, now());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_regras_anuncio_vendido on public.veiculos;
create trigger trg_regras_anuncio_vendido
  before insert or update on public.veiculos
  for each row execute function public.regras_anuncio_vendido();
