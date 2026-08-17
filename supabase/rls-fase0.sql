-- AutoRegião — RLS Fase 0 (contenção crítica)
-- Rodar no Supabase: Dashboard > SQL Editor > New query > colar tudo > Run.
-- Objetivo: fechar o acesso hoje totalmente aberto (leitura/escrita sem login em
-- qualquer tabela, usando só a anon key exposta no frontend), sem quebrar nenhum
-- fluxo que já funciona no app.
--
-- O que NÃO resolve ainda (fica para a Fase 2, quando existir rota de API):
--   - "Gerar cupom" em /admin: qualquer usuário LOGADO ainda consegue gerar cupom
--     (deixou de ser "qualquer pessoa da internet", mas ainda não é "só o admin").
--     Restrição por papel de admin de verdade exige rota de servidor com service key.
--   - Condição de corrida no resgate de cupom (dois resgates simultâneos do mesmo
--     código) continua existindo — depende de virar uma função no banco (RPC).

-- ============ VEICULOS ============
alter table public.veiculos enable row level security;

drop policy if exists "veiculos_select_public" on public.veiculos;
create policy "veiculos_select_public"
  on public.veiculos for select
  using (ativo = true);

drop policy if exists "veiculos_select_owner" on public.veiculos;
create policy "veiculos_select_owner"
  on public.veiculos for select
  to authenticated
  using (auth.uid() = usuario_id);

drop policy if exists "veiculos_insert_owner" on public.veiculos;
create policy "veiculos_insert_owner"
  on public.veiculos for insert
  to authenticated
  with check (auth.uid() = usuario_id);

drop policy if exists "veiculos_update_owner" on public.veiculos;
create policy "veiculos_update_owner"
  on public.veiculos for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

drop policy if exists "veiculos_delete_owner" on public.veiculos;
create policy "veiculos_delete_owner"
  on public.veiculos for delete
  to authenticated
  using (auth.uid() = usuario_id);

-- ============ LOJAS ============
alter table public.lojas enable row level security;

-- Perfil da loja é público (página /loja/[id] precisa ser lida sem login).
drop policy if exists "lojas_select_public" on public.lojas;
create policy "lojas_select_public"
  on public.lojas for select
  using (true);

drop policy if exists "lojas_insert_owner" on public.lojas;
create policy "lojas_insert_owner"
  on public.lojas for insert
  to authenticated
  with check (auth.uid() = usuario_id);

drop policy if exists "lojas_update_owner" on public.lojas;
create policy "lojas_update_owner"
  on public.lojas for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

-- ============ CUPONS (interino — ver nota no topo do arquivo) ============
alter table public.cupons enable row level security;

drop policy if exists "cupons_select_authenticated" on public.cupons;
create policy "cupons_select_authenticated"
  on public.cupons for select
  to authenticated
  using (true);

drop policy if exists "cupons_insert_authenticated" on public.cupons;
create policy "cupons_insert_authenticated"
  on public.cupons for insert
  to authenticated
  with check (true);

drop policy if exists "cupons_update_authenticated" on public.cupons;
create policy "cupons_update_authenticated"
  on public.cupons for update
  to authenticated
  using (true)
  with check (true);

-- ============ CUPONS_USADOS ============
alter table public.cupons_usados enable row level security;

drop policy if exists "cupons_usados_select_authenticated" on public.cupons_usados;
create policy "cupons_usados_select_authenticated"
  on public.cupons_usados for select
  to authenticated
  using (true);

drop policy if exists "cupons_usados_insert_authenticated" on public.cupons_usados;
create policy "cupons_usados_insert_authenticated"
  on public.cupons_usados for insert
  to authenticated
  with check (true);
