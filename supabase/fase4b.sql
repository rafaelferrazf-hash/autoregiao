-- AutoRegião — Fase 4, Etapa B: pagamentos (Mercado Pago, Checkout Pro)
-- Rodar no Supabase: SQL Editor > New query > colar tudo > Run (confirmar "Run this query").
-- Pode ser rodado mais de uma vez sem problema.
--
-- Fluxo:
--  1. Lojista escolhe plano + período no painel → servidor cria uma linha em `pagamentos`
--     (status "pendente") e uma preferência no Mercado Pago com external_reference = id da linha.
--  2. Mercado Pago avisa o site (webhook) ou o lojista volta do checkout → o servidor consulta
--     o pagamento DIRETO na API do Mercado Pago (nunca confia no que vem do navegador).
--  3. Aprovado → aplicar_pagamento_aprovado(): ativa o plano e soma os dias ao vencimento.
--     Idempotente: o mesmo pagamento nunca é aplicado duas vezes.

create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  usuario_id uuid not null,
  plano text not null check (plano in ('basico', 'profissional', 'premium')),
  meses integer not null check (meses in (1, 3, 6)),
  valor numeric(10, 2) not null check (valor > 0),
  status text not null default 'pendente',       -- pendente | approved | pending | in_process | rejected | cancelled | refunded ...
  mp_preference_id text,
  mp_payment_id text unique,
  metodo text,                                     -- pix | credit_card | ticket ...
  aplicado boolean not null default false,          -- plano já foi ativado por este pagamento
  criado_em timestamptz not null default now(),
  aprovado_em timestamptz,
  atualizado_em timestamptz not null default now()
);

create index if not exists pagamentos_loja on public.pagamentos (loja_id, criado_em desc);

alter table public.pagamentos enable row level security;

-- Lojista vê só o próprio histórico. Ninguém escreve pelo navegador (só o servidor, com a service key).
drop policy if exists "pagamentos_select_dono" on public.pagamentos;
create policy "pagamentos_select_dono"
  on public.pagamentos for select
  to authenticated
  using (usuario_id = auth.uid());

-- Ativa o plano de um pagamento aprovado. Só o servidor (service_role) pode chamar.
-- Retorna: 'ok' | 'ja_aplicado' | 'nao_encontrado' | 'vitalicia'
create or replace function public.aplicar_pagamento_aprovado(p_pagamento uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pag public.pagamentos%rowtype;
  v_plano_atual text;
begin
  select * into v_pag from public.pagamentos where id = p_pagamento for update;
  if not found then
    return 'nao_encontrado';
  end if;
  if v_pag.aplicado then
    return 'ja_aplicado';
  end if;

  select plano into v_plano_atual from public.lojas where id = v_pag.loja_id for update;
  if v_plano_atual = 'vitalicio' then
    update public.pagamentos set aplicado = true, atualizado_em = now() where id = v_pag.id;
    return 'vitalicia';
  end if;

  -- Soma a partir do vencimento atual (se ainda em dia) ou de hoje (se já venceu).
  update public.lojas
    set plano = v_pag.plano,
        expira_em = greatest(coalesce(expira_em, now()), now()) + make_interval(days => v_pag.meses * 30)
    where id = v_pag.loja_id;
  -- (não mexe em `ativo`: loja desativada pelo admin continua desativada mesmo pagando)

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
