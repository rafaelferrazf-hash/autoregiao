-- Fase 6: anúncio ligado à Tabela FIPE.
-- O lojista escolhe marca/modelo/ano da FIPE (fipe_tipo/marca/modelo/ano/nome). O VALOR da FIPE
-- (fipe_valor, fipe_codigo, fipe_mes, fipe_em) só é gravado pelo servidor do site (service key),
-- consultando a FIPE — assim ninguém inventa um valor alto para ganhar o selo "Abaixo da FIPE".

alter table public.veiculos
  add column if not exists fipe_tipo   text,
  add column if not exists fipe_marca  text,
  add column if not exists fipe_modelo text,
  add column if not exists fipe_ano    text,
  add column if not exists fipe_nome   text,
  add column if not exists fipe_valor  numeric,
  add column if not exists fipe_codigo text,
  add column if not exists fipe_mes    text,
  add column if not exists fipe_em     timestamptz;

create or replace function public.proteger_valor_fipe()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT'
     or (new.fipe_tipo, new.fipe_marca, new.fipe_modelo, new.fipe_ano)
        is distinct from (old.fipe_tipo, old.fipe_marca, old.fipe_modelo, old.fipe_ano) then
    -- Modelo FIPE novo/trocado: o valor é recalculado pelo servidor logo depois de salvar.
    new.fipe_valor := null; new.fipe_codigo := null; new.fipe_mes := null; new.fipe_em := null;
  else
    new.fipe_valor := old.fipe_valor; new.fipe_codigo := old.fipe_codigo;
    new.fipe_mes := old.fipe_mes; new.fipe_em := old.fipe_em;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_proteger_valor_fipe on public.veiculos;
create trigger trg_proteger_valor_fipe
  before insert or update on public.veiculos
  for each row execute function public.proteger_valor_fipe();
