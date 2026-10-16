// Oferta de pré-lançamento (supabase/fase26): lojas cadastradas antes do lançamento ganham os 60 dias
// grátis contando a partir do lançamento. A oferta de 60 dias vale para cadastros até 30/11/2026.
// Se a data do lançamento mudar, trocar aqui E em public.data_lancamento() (fase26).
export const DATA_LANCAMENTO = new Date("2026-11-03T00:00:00-03:00");
export const FIM_PRE_LANCAMENTO = new Date("2026-12-01T00:00:00-03:00"); // até 30/11, inclusive

export type FaseOferta = "antes" | "pre" | "normal";

export function faseOferta(agora = new Date()): FaseOferta {
  if (agora < DATA_LANCAMENTO) return "antes";
  if (agora < FIM_PRE_LANCAMENTO) return "pre";
  return "normal";
}

// Texto curto do período grátis da loja, conforme a fase da oferta.
export function textoOfertaLoja(agora = new Date()): { titulo: string; texto: string } {
  switch (faseOferta(agora)) {
    case "antes":
      return {
        titulo: "Pré-lançamento: 60 dias grátis",
        texto: "Cadastre agora: os 60 dias só começam a contar no lançamento, em 03/11. Sem cartão de crédito.",
      };
    case "pre":
      return {
        titulo: "Pré-lançamento: 60 dias grátis",
        texto: "Oferta para lojas cadastradas até 30/11. Sem cartão de crédito.",
      };
    default:
      return { titulo: "60 dias grátis para lojistas", texto: "Anuncie seus veículos sem custo no período grátis. Sem cartão de crédito." };
  }
}
