-- AutoRegião — Fase 24: anúncio de pessoa física (particular) — 14/10/2026.
--  • Grátis: 1 por CPF e por WhatsApp (os dois guardados embaralhados, nunca o número), 60 dias, sem renovação.
--  • Depois: anúncio avulso pago — R$ 19,90 (30 dias) ou R$ 29,90 (60 dias), pelo Mercado Pago.
--  • Cada anúncio de particular "gasta" uma liberação (grátis ou paga) e sai do ar sozinho no vencimento.
--  • Particular aparece depois de todas as lojas na busca (prioridade -1).
-- Rodar no SQL Editor do Supabase (uma vez).

-- ============ 1. Vencimento do anúncio de particular ============
alter table public.veiculos add column if not exists expira_em timestamptz;

-- ============ 2. Liberações (direito de publicar 1 anúncio de particular) ============
create table if not exists public.liberacoes_particular (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('gratis', 'avulso')),
  dias integer not null check (dias in (30, 60)),
  cpf_hash text,          -- só no grátis (HMAC do CPF, feito no servidor)
  tel_hash text,          -- só no grátis (HMAC do WhatsApp)
  pagamento_id uuid,      -- só no avulso
  veiculo_id uuid,        -- anúncio que usou esta liberação
  usada_em timestamptz,
  criado_em timestamptz not null default now()
);
-- 1 grátis por CPF e por WhatsApp, para sempre (mesmo se apagar o anúncio ou a conta trocar de e-mail).
create unique index if not exists liberacoes_gratis_cpf on public.liberacoes_particular (cpf_hash) where tipo = 'gratis';
create unique index if not exists liberacoes_gratis_tel on public.liberacoes_particular (tel_hash) where tipo = 'gratis';
create unique index if not exists liberacoes_pagamento on public.liberacoes_particular (pagamento_id) where pagamento_id is not null;
create index if not exists liberacoes_usuario on public.liberacoes_particular (usuario_id, usada_em);

alter table public.liberacoes_particular enable row level security;
drop policy if exists "liberacoes_select_dono" on public.liberacoes_particular;
create policy "liberacoes_select_dono"
  on public.liberacoes_particular for select
  to authenticated
  using (usuario_id = auth.uid());
-- Escrita só pelo servidor (cadastro do grátis e pagamento aprovado) e pelo gatilho abaixo.

-- ============ 3. Pagamento do anúncio avulso (sem loja) ============
alter table public.pagamentos alter column loja_id drop not null;
alter table public.pagamentos drop constraint if exists pagamentos_plano_check;
alter table public.pagamentos add constraint pagamentos_plano_check
  check (plano in ('basico', 'profissional', 'premium', 'avulso30', 'avulso60'));

drop policy if exists "pagamentos_select_dono" on public.pagamentos;
create policy "pagamentos_select_dono"
  on public.pagamentos for select
  to authenticated
  using (usuario_id = auth.uid());

-- Mesma função da fase 15, agora também com o anúncio avulso (gera 1 liberação de 30 ou 60 dias).
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

  if v_pag.plano in ('avulso30', 'avulso60') then
    insert into public.liberacoes_particular (usuario_id, tipo, dias, pagamento_id)
      values (v_pag.usuario_id, 'avulso', case when v_pag.plano = 'avulso30' then 30 else 60 end, v_pag.id)
      on conflict do nothing;
    update public.pagamentos set aplicado = true, aprovado_em = coalesce(aprovado_em, now()), atualizado_em = now() where id = v_pag.id;
    return 'ok';
  end if;

  select * into v_loja from public.lojas where id = v_pag.loja_id for update;
  if v_loja.plano = 'vitalicio' then
    update public.pagamentos set aplicado = true, atualizado_em = now() where id = v_pag.id;
    return 'vitalicia';
  end if;

  v_dias := v_pag.meses * 30;

  if v_loja.expira_em is not null and v_loja.expira_em > now()
     and public.limite_menor(v_pag.plano, v_loja.plano) then
    update public.lojas
      set plano_proximo = v_pag.plano,
          plano_proximo_em = coalesce(plano_proximo_em, expira_em),
          expira_em = expira_em + make_interval(days => v_dias)
      where id = v_loja.id;
  else
    update public.lojas
      set plano = v_pag.plano,
          plano_proximo = null,
          plano_proximo_em = null,
          expira_em = greatest(coalesce(expira_em, now()), now()) + make_interval(days => v_dias)
      where id = v_loja.id;
    perform public.ajustar_anuncios_ao_limite(v_loja.id);
  end if;

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

-- ============ 4. Regras do anúncio (fase 17 + particular) ============
create or replace function public.aplicar_regras_anuncio()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plano text;
  v_limite integer;
  v_ativos integer;
  v_lib public.liberacoes_particular%rowtype;
  v_admin boolean := coalesce(auth.role(), '') = 'service_role';
begin
  select plano into v_plano from public.lojas where id = new.loja_id;

  -- Prioridade e destaque vêm do plano da loja; particular fica depois de todas as lojas.
  new.prioridade := case when new.loja_id is null then -1 else public.prioridade_do_plano(v_plano) end;
  new.destaque := new.prioridade >= 1;

  if new.loja_id is null then
    -- ===== Particular =====
    if tg_op = 'UPDATE' and not v_admin then
      new.expira_em := old.expira_em; -- o vencimento não é alterado pelo navegador
    end if;
    -- Anúncio de demonstração (fase 13/18) não gasta liberação.
    if tg_op = 'INSERT' and not v_admin and new.demonstracao is not true then
      select * into v_lib from public.liberacoes_particular
        where usuario_id = new.usuario_id and usada_em is null
        order by (tipo = 'gratis') desc, criado_em
        limit 1
        for update skip locked;
      if not found then
        raise exception 'sem_anuncio_particular' using hint = 'Você já usou seu anúncio grátis. Escolha um anúncio avulso para publicar outro veículo.';
      end if;
      new.expira_em := now() + make_interval(days => v_lib.dias);
      update public.liberacoes_particular set usada_em = now(), veiculo_id = new.id where id = v_lib.id;
    end if;
    -- Reativar um anúncio que já venceu não é permitido.
    if new.ativo is true and (tg_op = 'UPDATE' and old.ativo is not true) and not v_admin
       and new.expira_em is not null and new.expira_em <= now() then
      raise exception 'anuncio_vencido' using hint = 'Este anúncio venceu. Para voltar ao ar, publique um anúncio avulso.';
    end if;
    return new;
  end if;

  -- ===== Loja =====
  if new.ativo is true and (tg_op = 'INSERT' or old.ativo is not true) and not v_admin then
    if not public.loja_em_dia(new.loja_id) then
      raise exception 'plano_vencido' using hint = 'O plano da loja venceu. Renove para publicar ou reativar anúncios.';
    end if;

    v_limite := public.limite_anuncios(v_plano);
    if v_limite is not null then
      select count(*) into v_ativos from public.veiculos v
        where v.ativo is true and v.id is distinct from new.id and v.loja_id = new.loja_id;
      if v_ativos >= v_limite then
        raise exception 'limite_anuncios' using hint = format('Limite de %s anúncios ativos do seu plano.', v_limite);
      end if;
    end if;
  end if;

  return new;
end;
$$;

-- Particulares que já existem: prioridade -1 e 60 dias a partir de hoje (se ainda não têm vencimento).
update public.veiculos set prioridade = -1, destaque = false where loja_id is null;
update public.veiculos set expira_em = now() + interval '60 days' where loja_id is null and expira_em is null and demonstracao is not true;

-- ============ 5. Site público: anúncio de particular vencido some ============
drop policy if exists "veiculos_select_public" on public.veiculos;
create policy "veiculos_select_public"
  on public.veiculos for select
  using (ativo = true and demonstracao = false and public.loja_em_dia(loja_id)
         and (expira_em is null or expira_em > now()));
