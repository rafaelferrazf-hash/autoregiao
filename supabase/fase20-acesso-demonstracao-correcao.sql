-- AutoRegião — Fase 20: correção da fase 19.
-- A regra de leitura consultava a lista acesso_demonstracao, mas a lista é trancada (RLS sem policies)
-- e a consulta roda com a conta de quem está logado — então a lista sempre parecia vazia.
-- Agora a conferência é feita por uma função do banco (security definer), que lê a lista por dentro
-- sem abrir a lista para ninguém. Rodar no SQL Editor do Supabase (uma vez).

create or replace function public.pode_ver_demonstracao()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and (
    auth.uid() = (select usuario_id from public.lojas where id = '9c29ad84-1ab6-4e16-8c72-a5916185cabc')
    or exists (select 1 from public.acesso_demonstracao a where lower(a.email) = lower(auth.jwt() ->> 'email'))
  );
$$;

revoke all on function public.pode_ver_demonstracao() from public, anon;
grant execute on function public.pode_ver_demonstracao() to authenticated;

drop policy if exists "veiculos_select_demo_dono" on public.veiculos;
create policy "veiculos_select_demo_dono"
  on public.veiculos for select
  to authenticated
  using (demonstracao = true and ativo = true and public.pode_ver_demonstracao());
