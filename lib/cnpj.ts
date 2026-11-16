// CNPJ da loja (supabase/fase32). Loja só com CNPJ; quem não tem anuncia como particular (CPF).

export function soDigitosCnpj(v: string): string {
  return (v || "").replace(/\D/g, "").slice(0, 14);
}

// Confere os dígitos verificadores (não diz se a empresa existe). Igual a public.cnpj_valido() no banco.
export function cnpjValido(v: string): boolean {
  const c = soDigitosCnpj(v);
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false;
  const dv = (base: string, pesos: number[]) => {
    const resto = pesos.reduce((s, p, i) => s + Number(base[i]) * p, 0) % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const d1 = dv(c, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = dv(c, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(c[12]) && d2 === Number(c[13]);
}

// 11222333000181 -> 11.222.333/0001-81 (vai formatando enquanto digita)
export function formatarCnpj(v: string): string {
  const c = soDigitosCnpj(v);
  return c
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export type DadosCnpj = {
  razao_social: string | null;
  nome_fantasia: string | null;
  situacao: string | null;   // "ATIVA", "BAIXADA", "INAPTA", "SUSPENSA", "NULA"
  municipio: string | null;
  uf: string | null;
};

// Consulta pública da Receita pela BrasilAPI (grátis, sem chave). Só no servidor.
// Devolve null se o serviço estiver fora do ar; "nao_encontrado" se a base não conhece o número.
// A base às vezes não tem CNPJs verdadeiros: "nao_encontrado" NÃO bloqueia o cadastro, só fica sem confirmação.
export async function consultarCnpj(cnpj: string): Promise<DadosCnpj | "nao_encontrado" | null> {
  const c = soDigitosCnpj(cnpj);
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${c}`, {
      headers: { "User-Agent": "AutoRegiao/1.0 (+https://www.autoregiao.com.br)" },  // sem isso o serviço responde 403
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(8000),
    });
    if (r.status === 404) return "nao_encontrado";
    if (!r.ok) return null;
    const j = await r.json();
    const titulo = (s: unknown) => (typeof s === "string" && s.trim() ? s.trim() : null);
    return {
      razao_social: titulo(j.razao_social),
      nome_fantasia: titulo(j.nome_fantasia),
      situacao: titulo(j.descricao_situacao_cadastral)?.toUpperCase() ?? null,
      municipio: titulo(j.municipio),
      uf: titulo(j.uf),
    };
  } catch {
    return null;
  }
}

// Lojas de teste/demonstração que não precisam de CNPJ: o Perfil da Loja não mostra o aviso amarelo.
// Auto Paulista (demonstrações do Rafael) e as duas lojas usadas pela Apple/Google na revisão dos apps.
export const LOJAS_SEM_AVISO_CNPJ = [
  "9c29ad84-1ab6-4e16-8c72-a5916185cabc", // Auto Paulista
  "973e71c7-537f-404b-95f2-4f256cafdf4d", // Demonstração AutoRegião (revisao@)
  "bdb9411c-96d5-4a88-99ac-b901c532061d", // Demonstração Plano Vencido (revisao.vencido@)
];
