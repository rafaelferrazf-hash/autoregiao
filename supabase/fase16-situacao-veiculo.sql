-- Fase 16: "Situação do veículo" (IPVA pago, licenciado, único dono...), marcada pelo lojista no anúncio,
-- mostrada no anúncio/card e usada como filtro da busca.

alter table public.veiculos add column if not exists condicoes text[] not null default '{}';

alter table public.veiculos drop constraint if exists veiculos_condicoes_validas;
alter table public.veiculos add constraint veiculos_condicoes_validas check (
  condicoes <@ array['IPVA pago', 'Licenciado', 'Único dono', 'Revisões em dia', 'Laudo cautelar aprovado', 'Com garantia']::text[]
);

-- Anúncios antigos: "Único dono" e "Revisões na concessionária" estavam nos opcionais; passam para a situação.
update public.veiculos
  set condicoes = array(select distinct unnest(
        condicoes
        || case when 'Único dono' = any(opcionais) then array['Único dono'] else '{}'::text[] end
        || case when 'Revisões na concessionária' = any(opcionais) then array['Revisões em dia'] else '{}'::text[] end)),
      opcionais = array_remove(array_remove(opcionais, 'Único dono'), 'Revisões na concessionária')
  where opcionais && array['Único dono', 'Revisões na concessionária'];

create index if not exists veiculos_condicoes on public.veiculos using gin (condicoes);
