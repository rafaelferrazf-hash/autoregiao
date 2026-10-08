// "Situação do veículo" (veiculos.condicoes — supabase/fase16-situacao-veiculo.sql).
// `slug` é o que vai na URL da busca (?cond=ipva-pago,unico-dono).
export const CONDICOES = [
  { nome: "IPVA pago", slug: "ipva-pago" },
  { nome: "Licenciado", slug: "licenciado" },
  { nome: "Único dono", slug: "unico-dono" },
  { nome: "Revisões em dia", slug: "revisoes-em-dia" },
  { nome: "Laudo cautelar aprovado", slug: "laudo-cautelar" },
  { nome: "Com garantia", slug: "com-garantia" },
] as const;

export const condicaoDoSlug = (s: string): string | null => CONDICOES.find(c => c.slug === s)?.nome ?? null;
export const slugDaCondicao = (nome: string) => CONDICOES.find(c => c.nome === nome)?.slug ?? null;
