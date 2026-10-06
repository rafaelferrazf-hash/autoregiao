-- Fase 14: anúncios de demonstração (fase 13) visíveis SÓ para o dono (conta da loja logada).
-- Visitantes, testadores e revisores da Google/Apple não veem. O dono continua vendo os próprios
-- anúncios pela policy "veiculos_select_owner" (rls-fase0.sql).

drop policy if exists "veiculos_select_public" on public.veiculos;
create policy "veiculos_select_public"
  on public.veiculos for select
  using (ativo = true and demonstracao = false and public.loja_em_dia(loja_id));
