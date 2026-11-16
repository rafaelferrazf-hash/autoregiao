-- AutoRegião — Fase 32 (16/11/2026): loja só com CNPJ.
-- Decisão do Rafael: conta de LOJISTA exige CNPJ válido; quem não tem CNPJ anuncia como particular (CPF, fase24).
--   * lojas.cnpj (14 dígitos, sem pontos), único: cada CNPJ abre UMA loja (evita repetir os 60 dias grátis);
--   * lojas.razao_social / cnpj_situacao: preenchidos pelo servidor com a consulta pública da Receita (BrasilAPI);
--   * o cadastro (trigger criar_loja_no_cadastro) recusa lojista sem CNPJ válido ou com CNPJ já usado;
--   * o lojista NÃO consegue trocar o CNPJ sozinho (sem permissão de coluna); só o servidor grava.
-- Lojas antigas ficam sem CNPJ e são convidadas a informar no Perfil da Loja.
-- Rodar no SQL Editor do Supabase (uma vez). Pode rodar de novo sem problema.

alter table public.lojas add column if not exists cnpj text;
alter table public.lojas add column if not exists razao_social text;
alter table public.lojas add column if not exists cnpj_situacao text;

alter table public.lojas drop constraint if exists lojas_cnpj_formato;
alter table public.lojas add constraint lojas_cnpj_formato check (cnpj is null or cnpj ~ '^[0-9]{14}$');

create unique index if not exists lojas_cnpj_unico on public.lojas (cnpj) where cnpj is not null;

-- Confere os dígitos verificadores do CNPJ (não diz se a empresa existe).
create or replace function public.cnpj_valido(p text)
returns boolean
language plpgsql
immutable
as $$
declare
  c text := regexp_replace(coalesce(p, ''), '[^0-9]', '', 'g');
  pesos1 int[] := array[5,4,3,2,9,8,7,6,5,4,3,2];
  pesos2 int[] := array[6,5,4,3,2,9,8,7,6,5,4,3,2];
  soma int; resto int; d1 int; d2 int;
begin
  if length(c) <> 14 or c ~ '^(\d)\1{13}$' then return false; end if;
  soma := 0;
  for i in 1..12 loop soma := soma + substr(c, i, 1)::int * pesos1[i]; end loop;
  resto := soma % 11; d1 := case when resto < 2 then 0 else 11 - resto end;
  soma := 0;
  for i in 1..13 loop soma := soma + substr(c, i, 1)::int * pesos2[i]; end loop;
  resto := soma % 11; d2 := case when resto < 2 then 0 else 11 - resto end;
  return d1 = substr(c, 13, 1)::int and d2 = substr(c, 14, 1)::int;
end;
$$;

-- Cadastro: a loja nasce com o CNPJ (60 dias grátis contam do cadastro — regra da fase30, mantida).
create or replace function public.criar_loja_no_cadastro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cnpj text;
begin
  if coalesce(new.raw_user_meta_data->>'tipo', '') = 'lojista' then
    v_cnpj := regexp_replace(coalesce(new.raw_user_meta_data->>'cnpj', ''), '[^0-9]', '', 'g');
    if not public.cnpj_valido(v_cnpj) then
      raise exception 'CNPJ_INVALIDO';
    end if;
    if exists (select 1 from public.lojas where cnpj = v_cnpj) then
      raise exception 'CNPJ_JA_CADASTRADO';
    end if;
    insert into public.lojas (nome, cidade, telefone, usuario_id, ativo, plano, expira_em, cnpj)
    values (
      coalesce(nullif(trim(new.raw_user_meta_data->>'loja'), ''), 'Minha loja'),
      coalesce(nullif(trim(new.raw_user_meta_data->>'cidade'), ''), ''),
      nullif(trim(new.raw_user_meta_data->>'telefone'), ''),
      new.id,
      true,
      'trial',
      now() + interval '60 days',
      v_cnpj
    );
  end if;
  return new;
end;
$$;

-- Conferência: deve mostrar true, false, true.
select public.cnpj_valido('11.222.333/0001-81') as cnpj_de_exemplo_valido,
       public.cnpj_valido('11.222.333/0001-82') as cnpj_errado,
       position('CNPJ_INVALIDO' in pg_get_functiondef('public.criar_loja_no_cadastro()'::regprocedure)) > 0 as cadastro_novo_ativo;
