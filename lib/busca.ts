// Filtros da busca de veículos. Ficam na URL (?marca=Honda&preco_max=90000) para a busca
// poder ser compartilhada e para o botão "voltar" do navegador funcionar.

export type Ordem = "recentes" | "menor_preco" | "maior_preco" | "menor_km";
export type TipoVeiculo = "carro" | "moto" | "utilitario";

export type Filtros = {
  q?: string;
  tipo?: TipoVeiculo;
  marca?: string;
  cidade?: string;
  cambio?: string;
  combustivel?: string;
  ano_min?: number;
  preco_min?: number;
  preco_max?: number;
  km_max?: number;
  ordem?: Ordem;
};

const ORDENS: Ordem[] = ["recentes", "menor_preco", "maior_preco", "menor_km"];
const TIPOS: TipoVeiculo[] = ["carro", "moto", "utilitario"];
const TEXTOS = ["q", "marca", "cidade", "cambio", "combustivel"] as const;
const NUMEROS = ["ano_min", "preco_min", "preco_max", "km_max"] as const;

// "R$ 90.000" / "90000" / "90 mil" → 90000. Vazio ou inválido → undefined.
export function paraNumero(v: string | null | undefined): number | undefined {
  if (!v) return undefined;
  const n = parseInt(v.replace(/\D/g, ""), 10);
  return Number.isNaN(n) || n <= 0 ? undefined : n;
}

export function lerFiltros(params: URLSearchParams): Filtros {
  const f: Filtros = {};
  for (const k of TEXTOS) {
    const v = params.get(k)?.trim().slice(0, 60);
    if (v) f[k] = v;
  }
  for (const k of NUMEROS) {
    const v = paraNumero(params.get(k));
    if (v !== undefined) f[k] = v;
  }
  const tipo = params.get("tipo");
  if (tipo && (TIPOS as string[]).includes(tipo)) f.tipo = tipo as TipoVeiculo;
  const ordem = params.get("ordem");
  if (ordem && (ORDENS as string[]).includes(ordem) && ordem !== "recentes") f.ordem = ordem as Ordem;
  return f;
}

export function filtrosParaQuery(f: Filtros): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (v === undefined || v === "" || (k === "ordem" && v === "recentes")) continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function temFiltroAtivo(f: Filtros): boolean {
  return Object.entries(f).some(([k, v]) => k !== "ordem" && k !== "tipo" && v !== undefined && v !== "");
}

// Texto livre vai dentro de um filtro .or() do PostgREST: tira caracteres que quebram a sintaxe
// (vírgula, parênteses) e curingas do LIKE.
export function limparTextoBusca(v: string): string {
  return v.replace(/[,()%*_\\:."]/g, " ").replace(/\s+/g, " ").trim();
}

// Para comparação exata sem diferenciar maiúsculas (ilike sem curinga).
export function escaparLike(v: string): string {
  return v.replace(/[%_\\]/g, m => `\\${m}`);
}
