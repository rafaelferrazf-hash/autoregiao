// Conta de parcela usada no simulador do anúncio e na "busca por parcela":
// entrada de 20%, 60 meses, taxa aproximada de 1,49% ao mês (Tabela Price). É só uma estimativa.
export const TAXA_MES = 0.0149;
export const PRAZO_PADRAO = 60;
export const ENTRADA_PADRAO = 0.2;

export function parcelaMensal(valorFinanciado: number, meses = PRAZO_PADRAO, taxa = TAXA_MES): number {
  if (valorFinanciado <= 0) return 0;
  return Math.round(valorFinanciado * (taxa / (1 - Math.pow(1 + taxa, -meses))));
}

// Preço máximo de carro cuja parcela (com a entrada padrão) cabe no valor informado.
export function precoMaximoPelaParcela(parcela: number): number {
  const fator = TAXA_MES / (1 - Math.pow(1 + TAXA_MES, -PRAZO_PADRAO));
  return Math.floor(parcela / fator / (1 - ENTRADA_PADRAO));
}

export const FAIXAS_PARCELA = [1000, 1500, 2000, 2500, 3000];
