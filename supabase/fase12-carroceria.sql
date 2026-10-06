-- Fase 12: tipo de carroceria do anúncio (Hatch, Sedã, SUV, Picape...), mostrado na ficha e usado
-- como filtro da busca e nas páginas /carros/suv, /carros/seda...

alter table public.veiculos add column if not exists carroceria text;

alter table public.veiculos drop constraint if exists veiculos_carroceria_valida;
alter table public.veiculos add constraint veiculos_carroceria_valida check (
  carroceria is null or carroceria in
    ('Hatch', 'Sedã', 'SUV', 'Picape', 'Minivan', 'Perua', 'Cupê', 'Conversível', 'Van', 'Furgão', 'Caminhão')
);

create index if not exists veiculos_carroceria on public.veiculos (carroceria) where ativo = true;
