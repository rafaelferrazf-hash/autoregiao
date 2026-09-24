// Plano "vitalicio": conta do dono do AutoRegião. Sem vencimento, sem limite de anúncios
// e fora de qualquer bloqueio por falta de pagamento (regra da Fase 4 deve respeitar isto).
// Só pode ser atribuído pelo servidor/banco — o lojista não altera a coluna `plano`.
export const PLANO_VITALICIO = "vitalicio";

export function ehVitalicio(plano: string | null | undefined): boolean {
  return plano === PLANO_VITALICIO;
}
