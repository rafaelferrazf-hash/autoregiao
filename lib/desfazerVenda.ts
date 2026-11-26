// Prazo do lojista para "Desfazer venda" (marcado como vendido por engano). O admin desfaz sempre.
export const DIAS_DESFAZER_VENDA = 7;

export function dentroDoPrazoDesfazer(vendidoEm: string | null | undefined): boolean {
  if (!vendidoEm) return true; // vendido antes de existir vendido_em: sem data para contar
  const ms = Date.now() - new Date(vendidoEm).getTime();
  return ms <= DIAS_DESFAZER_VENDA * 24 * 60 * 60 * 1000;
}
