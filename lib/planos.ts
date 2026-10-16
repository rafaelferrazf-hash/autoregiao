// Planos do AutoRegião. Os limites e o destaque também são aplicados no banco
// (supabase/fase4a.sql: limite_anuncios e aplicar_regras_anuncio) — manter os dois iguais.

// Plano "vitalicio": conta do dono do AutoRegião. Sem vencimento, sem limite de anúncios
// e fora de qualquer bloqueio por falta de pagamento.
// Só pode ser atribuído pelo servidor/banco — o lojista não altera a coluna `plano`.
export const PLANO_VITALICIO = "vitalicio";

export function ehVitalicio(plano: string | null | undefined): boolean {
  return plano === PLANO_VITALICIO;
}

export type IdPlanoPago = "basico" | "profissional" | "premium";

export type PlanoPago = {
  id: IdPlanoPago;
  nome: string;
  precoMensal: number; // em reais
  limite: number | null; // null = sem limite
  destaque: boolean;
  recursos: string[];
};

// Ordem nas listas (supabase/fase17): Premium > Profissional (e período grátis) > Básico.
// Preços revistos em 16/10/2026 (comparados ao CarroSP). Limites também no banco (fase27: limite_anuncios) — manter iguais.
// Mais de LIMITE_PREMIUM anúncios: preço sob consulta (o Rafael negocia; o admin pode pôr a loja no vitalício/sem limite).
export const PLANOS: PlanoPago[] = [
  {
    id: "basico", nome: "Básico", precoMensal: 99, limite: 15, destaque: false,
    recursos: ["Até 15 anúncios ativos", "Página da loja com logo, capa e mapa", "Contato direto pelo WhatsApp", "Relatório mensal de visualizações e contatos"],
  },
  {
    id: "profissional", nome: "Profissional", precoMensal: 169, limite: 40, destaque: true,
    recursos: ["Até 40 anúncios ativos", "Seus anúncios aparecem antes dos do plano Básico", "Etiqueta “Destaque” nos seus anúncios", "Logo da sua loja nos anúncios", "Página da loja com logo, capa e mapa", "Contato direto pelo WhatsApp", "Relatório mensal de visualizações e contatos"],
  },
  {
    id: "premium", nome: "Premium", precoMensal: 279, limite: 80, destaque: true,
    recursos: ["Até 80 anúncios ativos", "Seus anúncios aparecem primeiro na busca", "Vitrine “Ofertas em destaque” no topo da página inicial", "Anúncios com borda laranja, etiqueta “Destaque” e selo “Loja Premium”", "Logo da sua loja nos anúncios", "Página da loja com logo, capa e mapa", "Contato direto pelo WhatsApp", "Relatório mensal de visualizações e contatos"],
  },
];

// Períodos de pagamento (renovação manual). Desconto para pagar adiantado.
export const PERIODOS = [
  { meses: 1, desconto: 0, rotulo: "Mensal" },
  { meses: 3, desconto: 0.05, rotulo: "Trimestral" },
  { meses: 6, desconto: 0.1, rotulo: "Semestral" },
] as const;
export type MesesPeriodo = (typeof PERIODOS)[number]["meses"];

export function planoPorId(id: string | null | undefined): PlanoPago | undefined {
  return PLANOS.find(p => p.id === id);
}

// Valor total do período, já com desconto, arredondado em centavos.
export function valorDoPeriodo(plano: PlanoPago, meses: MesesPeriodo): number {
  const periodo = PERIODOS.find(p => p.meses === meses)!;
  return Math.round(plano.precoMensal * meses * (1 - periodo.desconto) * 100) / 100;
}

export function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Pessoa física (supabase/fase24): 1 anúncio grátis por CPF/WhatsApp (60 dias); depois, anúncio avulso.
export const DIAS_GRATIS_PARTICULAR = 60;
export const AVULSOS = [
  { id: "avulso30", dias: 30, preco: 19.9 },
  { id: "avulso60", dias: 60, preco: 29.9 },
] as const;
export type IdAvulso = (typeof AVULSOS)[number]["id"];

export const DIAS_GRATIS = 60;
export const LIMITE_PREMIUM = 80;
export const TEXTO_SOB_CONSULTA = `Mais de ${LIMITE_PREMIUM} veículos? Fale com a gente: preço sob consulta.`;
export const DIAS_CARENCIA = 3;
export const LIMITE_PARTICULAR = 1;

export function nomeDoPlano(plano: string | null | undefined): string {
  if (ehVitalicio(plano)) return "Acesso vitalício";
  if (!plano || plano === "trial") return "Período grátis";
  const avulso = AVULSOS.find(a => a.id === plano);
  if (avulso) return `Anúncio avulso (${avulso.dias} dias)`;
  return PLANOS.find(p => p.id === plano)?.nome ?? plano;
}

export function limiteDoPlano(plano: string | null | undefined): number | null {
  if (ehVitalicio(plano)) return null;
  if (!plano || plano === "trial") return 40;
  const p = PLANOS.find(x => x.id === plano);
  return p ? p.limite : 15;
}

// Situação do plano da loja para os avisos do painel.
export type SituacaoPlano =
  | { tipo: "vitalicio" }
  | { tipo: "em_dia"; diasRestantes: number; avisar: boolean }
  | { tipo: "carencia"; diasAteSairDoAr: number; venceuEm: Date }
  | { tipo: "vencido"; venceuEm: Date }
  | { tipo: "sem_loja" };

export function situacaoDoPlano(plano: string | null | undefined, expiraEm: string | null | undefined, agora: number): SituacaoPlano {
  if (ehVitalicio(plano)) return { tipo: "vitalicio" };
  if (!expiraEm) return { tipo: "sem_loja" };
  const fim = new Date(expiraEm);
  const restante = Math.ceil((fim.getTime() - agora) / 86_400_000);
  if (restante > 0) return { tipo: "em_dia", diasRestantes: restante, avisar: restante <= 7 };
  const foraDoAr = fim.getTime() + DIAS_CARENCIA * 86_400_000;
  if (foraDoAr > agora) return { tipo: "carencia", diasAteSairDoAr: Math.ceil((foraDoAr - agora) / 86_400_000), venceuEm: fim };
  return { tipo: "vencido", venceuEm: fim };
}

// Erros levantados pelo banco (aplicar_regras_anuncio) em linguagem do lojista.
export function mensagemErroAnuncio(mensagem: string | undefined): string | null {
  if (!mensagem) return null;
  if (mensagem.includes("plano_vencido")) return "O plano da sua loja venceu. Os anúncios voltam a ser publicados quando o plano estiver ativo.";
  if (mensagem.includes("anuncio_vendido")) return "Este anúncio foi marcado como vendido e não volta ao ar. Para anunciar de novo, crie um anúncio novo.";
  if (mensagem.includes("sem_anuncio_particular")) return "Você já usou seu anúncio grátis. Para publicar outro veículo, escolha um anúncio avulso.";
  if (mensagem.includes("anuncio_vencido")) return "Este anúncio venceu. Para voltar ao ar, publique um anúncio avulso.";
  if (mensagem.includes("limite_anuncios")) return "Você atingiu o limite de anúncios ativos do seu plano. Pause um anúncio ou escolha um plano maior.";
  return null;
}
