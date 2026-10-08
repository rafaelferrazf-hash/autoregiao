// Selo de preço comparando com a Tabela FIPE do mês. Só existe quando o preço está ABAIXO da FIPE
// (acima da FIPE nunca é mostrado ao comprador — regra do negócio).
//  - "Super preço": 10% ou mais abaixo da FIPE;
//  - "Bom preço": abaixo da FIPE, até 10%.
export type SeloPreco = { tipo: "super" | "bom"; rotulo: string; pct: number; diferenca: number };

export function seloDePreco(v: { preco: number | null; fipe_valor?: number | null }): SeloPreco | null {
  if (!v.preco || !v.fipe_valor || v.preco >= v.fipe_valor) return null;
  const diferenca = v.fipe_valor - v.preco;
  const pct = Math.round((diferenca / v.fipe_valor) * 100);
  return pct >= 10
    ? { tipo: "super", rotulo: "Super preço", pct, diferenca }
    : { tipo: "bom", rotulo: "Bom preço", pct, diferenca };
}
