-- AutoRegião — Fase 17: ordem por plano (Premium > Profissional > Básico) e vitrine Premium.
-- Rodar no SQL Editor do Supabase (uma vez). Pode rodar de novo sem problema.
--
-- veiculos.prioridade (calculada pelo banco a partir do plano da loja; o site não grava):
--   2 = Premium (e a conta vitalícia do dono)  → vitrine "Ofertas em destaque", logo da loja no card
--   1 = Profissional e período grátis (trial)  → borda/etiqueta "Destaque"
--   0 = Básico e particular
-- destaque continua existindo e passa a ser prioridade >= 1 (o período grátis ganha destaque).

alter table public.veiculos add column if not exists prioridade smallint not null default 0;

create or replace function public.prioridade_do_plano(p_plano text)
returns smallint
language sql
immutable
as $$
  select case
    when p_plano in ('premium', 'vitalicio') then 2
    when p_plano in ('profissional', 'trial') then 1
    else 0
  end::smallint;
$$;

-- Regras do anúncio (mesma função da fase 4a, agora também com a prioridade).
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

  -- Prioridade e destaque sempre vêm do plano da loja (particular = 0).
  new.prioridade := case when new.loja_id is null then 0 else public.prioridade_do_plano(v_plano) end;
  new.destaque := new.prioridade >= 1;

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

-- Quando o plano da loja muda (pagamento, admin, plano agendado), os anúncios acompanham.
create or replace function public.sincronizar_destaque_loja()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.plano is distinct from old.plano then
    update public.veiculos
      set prioridade = public.prioridade_do_plano(new.plano),
          destaque = public.prioridade_do_plano(new.plano) >= 1
      where loja_id = new.id;
  end if;
  return new;
end;
$$;

-- Recalcula os anúncios que já existem.
update public.veiculos v
  set prioridade = coalesce((select public.prioridade_do_plano(l.plano) from public.lojas l where l.id = v.loja_id), 0),
      destaque = coalesce((select public.prioridade_do_plano(l.plano) from public.lojas l where l.id = v.loja_id), 0) >= 1;

create index if not exists veiculos_prioridade_recentes on public.veiculos (prioridade desc, criado_em desc);

-- Conferência: quantos anúncios em cada nível.
select prioridade, count(*) from public.veiculos group by prioridade order by prioridade desc;
