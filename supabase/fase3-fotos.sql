-- AutoRegião — Fase 3: lojista pode apagar as próprias fotos
-- Rodar no Supabase: SQL Editor > New query > colar tudo > Run (confirmar "Run this query").
-- Pode ser rodado mais de uma vez sem problema.
--
-- As fotos ficam no bucket "veiculos" em <id do usuário>/<arquivo>. Sem esta regra, excluir
-- um anúncio (ou remover foto na edição) deixava a foto órfã no Storage, ocupando espaço.
-- A regra só libera apagar arquivos da PRÓPRIA pasta.

drop policy if exists "veiculos_fotos_delete_propria_pasta" on storage.objects;
create policy "veiculos_fotos_delete_propria_pasta"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'veiculos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
