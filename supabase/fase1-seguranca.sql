-- AutoRegião — Fase 1, Parte B (segurança)
-- Rodar no Supabase: SQL Editor > New query > colar tudo > Run (confirmar "Run this query").
-- Pode ser rodado mais de uma vez sem problema.
--
-- O que faz:
--  1. Lojista só consegue editar os dados "de perfil" da loja. Campos de cobrança
--     (expira_em, plano, ativo) só mudam pelo servidor/banco.
--  2. A loja passa a ser criada pelo próprio banco no cadastro (trigger), com os
--     60 dias grátis calculados aqui — antes era o navegador que calculava, e o
--     insert falhava com RLS porque o usuário ainda não confirmou o e-mail.
--  3. Cupons: ninguém lê/escreve direto pelo navegador. Gerar = rota de admin no
--     servidor. Resgatar = função resgatar_cupom(), atômica (sem resgate duplo).
--  4. Fecha a tabela usuarios (não usada pelo app, estava sem RLS).

-- ============ 1. LOJAS: lojista não altera campos de cobrança ============
revoke insert, update on public.lojas from anon, authenticated;
grant update (nome, cidade, estado, telefone, whatsapp, descricao, endereco, horario)
  on public.lojas to authenticated;

-- Loja agora nasce pelo trigger abaixo; o navegador não cria mais loja.
drop policy if exists "lojas_insert_owner" on public.lojas;

-- ============ 2. TRIGGER: cria a loja no cadastro do lojista ============
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

drop trigger if exists trg_criar_loja_no_cadastro on auth.users;
create trigger trg_criar_loja_no_cadastro
  after insert on auth.users
  for each row execute function public.criar_loja_no_cadastro();

-- ============ 3. CUPONS: sem acesso direto pelo navegador ============
drop policy if exists "cupons_select_authenticated" on public.cupons;
drop policy if exists "cupons_insert_authenticated" on public.cupons;
drop policy if exists "cupons_update_authenticated" on public.cupons;
drop policy if exists "cupons_usados_select_authenticated" on public.cupons_usados;
drop policy if exists "cupons_usados_insert_authenticated" on public.cupons_usados;
-- (RLS continua ligado e sem policies = só o servidor, com a service key, acessa.)

-- Resgate atômico: trava a linha do cupom (FOR UPDATE), então dois resgates
-- simultâneos do mesmo código não passam os dois.
-- Retorna: 'ok' | 'invalido' | 'usado' | 'ja_resgatado' | 'sem_loja' | 'nao_logado'
create or replace function public.resgatar_cupom(p_codigo text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usuario uuid := auth.uid();
  v_cupom public.cupons%rowtype;
  v_loja public.lojas%rowtype;
begin
  if v_usuario is null then
    return 'nao_logado';
  end if;

  select * into v_cupom from public.cupons
    where codigo = upper(trim(p_codigo)) and ativo = true
    for update;
  if not found or (v_cupom.expira_em is not null and v_cupom.expira_em < now()) then
    return 'invalido';
  end if;
  if v_cupom.usos_realizados >= v_cupom.usos_maximos then
    return 'usado';
  end if;

  select * into v_loja from public.lojas where usuario_id = v_usuario for update;
  if not found then
    return 'sem_loja';
  end if;

  if exists (select 1 from public.cupons_usados where cupom_id = v_cupom.id and loja_id = v_loja.id) then
    return 'ja_resgatado';
  end if;

  update public.lojas
    set expira_em = greatest(coalesce(expira_em, now()), now()) + make_interval(days => v_cupom.dias)
    where id = v_loja.id;

  insert into public.cupons_usados (cupom_id, loja_id, usuario_id, usado_em)
    values (v_cupom.id, v_loja.id, v_usuario, now());

  update public.cupons
    set usos_realizados = usos_realizados + 1
    where id = v_cupom.id;

  return 'ok';
end;
$$;

revoke all on function public.resgatar_cupom(text) from public, anon;
grant execute on function public.resgatar_cupom(text) to authenticated;

-- ============ 4. USUARIOS: fecha a tabela ============
alter table public.usuarios enable row level security;
