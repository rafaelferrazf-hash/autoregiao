-- AutoRegião — Fase 4, Etapa A: vencimento, limites de anúncios e destaque
-- Rodar no Supabase: SQL Editor > New query > colar tudo > Run (confirmar "Run this query").
-- Pode ser rodado mais de uma vez sem problema.
--
-- Regras (decididas em 28/09/2026):
--  • Plano vence → 3 dias de carência → anúncios saem do site (NÃO são apagados) e a loja
--    não publica/reativa anúncios até pagar. Ao pagar, tudo volta sozinho.
--  • Loja com plano "vitalicio" (dono) nunca vence e não tem limite.
--  • Limite de anúncios ativos: trial 30 · basico 10 · profissional 30 · premium sem limite.
--    Particular (sem loja): 1 anúncio ativo, grátis.
--  • "Destaque nos resultados": anúncios de lojas profissional/premium ficam com destaque = true
--    (aparecem primeiro). O valor é sempre calculado pelo banco — o lojista não consegue forçar.
--  • Admin (service key) não é barrado por estas regras (moderação).

-- ============ 1. Funções de apoio ============
create or replace function public.loja_em_dia(p_loja uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_loja is null then true
    else coalesce((
      select l.ativo is not false
         and (l.plano = 'vitalicio' or (l.expira_em is not null and l.expira_em + interval '3 days' > now()))
      from public.lojas l where l.id = p_loja
    ), false)
  end;
$$;

create or replace function public.limite_anuncios(p_plano text)
returns integer
language sql
immutable
as $$
  select case coalesce(p_plano, 'trial')
    when 'vitalicio' then null
    when 'premium' then null
    when 'profissional' then 30
    when 'basico' then 10
    when 'trial' then 30
    else 10
  end;
$$;

-- ============ 2. Regras aplicadas em todo anúncio criado/alterado ============
-- Nome com "zz" para rodar DEPOIS do trg_vincular_veiculo_a_loja (que define loja_id).
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
  v_admin boolean := coalesce(auth.role(), '') = 'service_role';
begin
  select plano into v_plano from public.lojas where id = new.loja_id;

  -- Destaque sempre vem do plano da loja.
  new.destaque := coalesce(v_plano in ('profissional', 'premium'), false);

  -- Só confere quando o anúncio vai ficar ativo (novo ativo, ou reativação).
  if new.ativo is true and (tg_op = 'INSERT' or old.ativo is not true) and not v_admin then
    if not public.loja_em_dia(new.loja_id) then
      raise exception 'plano_vencido' using hint = 'O plano da loja venceu. Renove para publicar ou reativar anúncios.';
    end if;

    v_limite := case when new.loja_id is null then 1 else public.limite_anuncios(v_plano) end;
    if v_limite is not null then
      select count(*) into v_ativos from public.veiculos v
        where v.ativo is true
          and v.id is distinct from new.id
          and (case when new.loja_id is null then v.usuario_id = new.usuario_id and v.loja_id is null
                    else v.loja_id = new.loja_id end);
      if v_ativos >= v_limite then
        raise exception 'limite_anuncios' using hint = format('Limite de %s anúncios ativos do seu plano.', v_limite);
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_zz_regras_anuncio on public.veiculos;
create trigger trg_zz_regras_anuncio
  before insert or update on public.veiculos
  for each row execute function public.aplicar_regras_anuncio();

-- Quando o plano da loja muda (pagamento, admin), o destaque dos anúncios acompanha.
create or replace function public.sincronizar_destaque_loja()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.plano is distinct from old.plano then
    update public.veiculos
      set destaque = coalesce(new.plano in ('profissional', 'premium'), false)
      where loja_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sincronizar_destaque_loja on public.lojas;
create trigger trg_sincronizar_destaque_loja
  after update of plano on public.lojas
  for each row execute function public.sincronizar_destaque_loja();

-- Recalcula o destaque dos anúncios que já existem.
update public.veiculos v
  set destaque = coalesce((select l.plano in ('profissional', 'premium') from public.lojas l where l.id = v.loja_id), false);

-- ============ 3. Site público: some anúncio de loja vencida (após carência) ou desativada ============
drop policy if exists "veiculos_select_public" on public.veiculos;
create policy "veiculos_select_public"
  on public.veiculos for select
  using (ativo = true and public.loja_em_dia(loja_id));
-- O dono continua vendo os próprios anúncios (policy veiculos_select_owner) para renovar.

-- ============ 4. Lojas novas começam na Bahia (lançamento em Teixeira de Freitas) ============
-- O padrão da coluna era 'SP'. O lojista pode trocar no painel (Perfil da Loja).
alter table public.lojas alter column estado set default 'BA';

-- ============ 5. Índice para a ordem "destaque primeiro" ============
create index if not exists veiculos_destaque_recentes on public.veiculos (destaque desc, criado_em desc);
