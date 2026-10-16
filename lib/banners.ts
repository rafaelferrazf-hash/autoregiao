// Banners pagos do carrossel (supabase/fase22-banners.sql). Regras compartilhadas entre o /admin e o site.

export const VAGAS_BANNER = 4;

export type Banner = {
  id: string; anunciante: string; telefone: string | null;
  titulo: string; destaque: string | null; texto: string | null;
  botao: string; link: string; imagem_url: string;
  inicio: string; fim: string; ativo: boolean; valor: number | null;
  visualizacoes: number; cliques: number; criado_em: string;
};

// Só o que o site público precisa (sem anunciante, telefone e valor).
export type BannerPublico = Pick<Banner, "id" | "titulo" | "destaque" | "texto" | "botao" | "link" | "imagem_url">;

// "73 99999-8888" → https://wa.me/5573999998888 ; "/loja/..." e "https://..." ficam como estão.
export function normalizarLinkBanner(link: string): string | null {
  const l = link.trim();
  if (l.startsWith("/") && !l.startsWith("//")) return l;
  if (/^https:\/\/[^\s]+$/i.test(l)) return l;
  const digitos = l.replace(/\D/g, "");
  if (digitos.length >= 10 && digitos.length <= 13) return `https://wa.me/${digitos.length <= 11 ? `55${digitos}` : digitos}`;
  return null;
}

// Hoje em Brasília, "AAAA-MM-DD".
export function hojeBrasilia(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

// Maior número de banners no ar num mesmo dia dentro do período (para respeitar as 4 vagas).
export function lotacaoNoPeriodo(outros: { inicio: string; fim: string }[], inicio: string, fim: string): number {
  let maior = 0;
  for (let d = new Date(`${inicio}T12:00:00Z`); d <= new Date(`${fim}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    const dia = d.toISOString().slice(0, 10);
    maior = Math.max(maior, outros.filter(b => b.inicio <= dia && b.fim >= dia).length);
  }
  return maior;
}

// Anúncio flutuante (supabase/fase28): bolinha com a logo + selo que abre um cartão.
// Até 5 no ar ao mesmo tempo; cada visitante vê um, sorteado a cada visita.
export const VAGAS_FLUTUANTE = 5;

export type Flutuante = {
  id: string; anunciante: string; telefone: string | null; selo: string | null;
  titulo: string; texto: string | null; botao: string; link: string; logo_url: string;
  inicio: string; fim: string; ativo: boolean; valor: number | null;
  visualizacoes: number; aberturas: number; cliques: number; criado_em: string;
};

// Só o que o site público precisa (sem telefone, valor e números).
export type FlutuantePublico = Pick<Flutuante, "id" | "anunciante" | "selo" | "titulo" | "texto" | "botao" | "link" | "logo_url">;
