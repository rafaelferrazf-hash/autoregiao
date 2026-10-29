// Página "Divulgar" do painel (supabase/fase29-divulgar.sql): imagens prontas para Status, Stories e feed.
// Quem tem: todas as lojas no período grátis (60 dias); depois só Profissional, Premium e vitalício.
// Posts com frase de destaque têm limite por semana (segunda a domingo); sem frase, à vontade.
import { ehVitalicio } from "@/lib/planos";

export type AcessoDivulgar = { liberado: boolean; limiteFrases: number };

export function acessoDivulgar(plano: string | null | undefined, expiraEm: string | null | undefined, agora = Date.now()): AcessoDivulgar {
  if (ehVitalicio(plano)) return { liberado: true, limiteFrases: 4 };
  const emDia = !!expiraEm && new Date(expiraEm).getTime() > agora;
  if (!emDia) return { liberado: false, limiteFrases: 0 };
  if (plano === "premium") return { liberado: true, limiteFrases: 4 };
  if (!plano || plano === "trial" || plano === "profissional") return { liberado: true, limiteFrases: 2 };
  return { liberado: false, limiteFrases: 0 };
}

// Frases prontas (sem texto livre: evita propaganda enganosa e arte quebrada).
// As com `exige` só aparecem quando o anúncio confirma a informação.
type DadosFrase = { aceita_troca?: boolean | null; abaixoFipe: boolean; condicoes?: string[] | null };
export const FRASES: { texto: string; exige?: (v: DadosFrase) => boolean }[] = [
  { texto: "Oportunidade imperdível" },
  { texto: "Oferta da semana" },
  { texto: "Baixou o preço!" },
  { texto: "Recém-chegado" },
  { texto: "Pronto para levar" },
  { texto: "Aceita troca", exige: v => !!v.aceita_troca },
  { texto: "Abaixo da FIPE", exige: v => v.abaixoFipe },
  { texto: "Único dono", exige: v => !!v.condicoes?.includes("Único dono") },
];

export function frasesDoVeiculo(v: DadosFrase): string[] {
  return FRASES.filter(f => !f.exige || f.exige(v)).map(f => f.texto);
}

// Segunda-feira da semana atual no horário de Brasília (AAAA-MM-DD), chave da contagem semanal.
export function segundaDaSemana(agora = new Date()): string {
  const br = new Date(agora.getTime() - 3 * 3_600_000);
  const dia = br.getUTCDay(); // 0 = domingo
  br.setUTCDate(br.getUTCDate() - (dia === 0 ? 6 : dia - 1));
  return br.toISOString().slice(0, 10);
}
