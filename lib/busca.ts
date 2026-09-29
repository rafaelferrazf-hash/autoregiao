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

// O mínimo que uma consulta do Supabase precisa ter para receber os filtros. Serve tanto para a
// busca do site quanto para o envio diário dos alertas (que roda no servidor).
type ConsultaFiltravel<Q> = {
  or(filtro: string): Q;
  eq(coluna: string, valor: string): Q;
  ilike(coluna: string, padrao: string): Q;
  gte(coluna: string, valor: number): Q;
  lte(coluna: string, valor: number): Q;
};

export function aplicarFiltros<Q extends ConsultaFiltravel<Q>>(consulta: Q, f: Filtros): Q {
  if (f.q) {
    const termo = limparTextoBusca(f.q);
    if (termo) consulta = consulta.or(["nome", "marca", "modelo", "versao"].map(c => `${c}.ilike.%${termo}%`).join(","));
  }
  // Anúncio antigo sem tipo conta como carro.
  if (f.tipo === "carro") consulta = consulta.or("tipo.eq.carro,tipo.is.null");
  else if (f.tipo) consulta = consulta.eq("tipo", f.tipo);
  if (f.marca) consulta = consulta.ilike("marca", escaparLike(f.marca));
  if (f.cidade) consulta = consulta.ilike("cidade", escaparLike(f.cidade));
  if (f.cambio) consulta = consulta.ilike("cambio", escaparLike(f.cambio));
  if (f.combustivel) consulta = consulta.ilike("combustivel", escaparLike(f.combustivel));
  if (f.ano_min) consulta = consulta.gte("ano_num", f.ano_min);
  if (f.preco_min) consulta = consulta.gte("preco", f.preco_min);
  if (f.preco_max) consulta = consulta.lte("preco", f.preco_max);
  if (f.km_max) consulta = consulta.lte("km_num", f.km_max);
  return consulta;
}

const NOME_TIPO: Record<TipoVeiculo, string> = { carro: "Carros", moto: "Motos", utilitario: "Utilitários" };
const milhar = (n: number) => n.toLocaleString("pt-BR");

// "Carros · Toyota · até R$ 200.000 · 2018 ou mais novo" — usado no alerta e nos e-mails.
export function descreverFiltros(f: Filtros): string {
  const partes: string[] = [];
  if (f.tipo) partes.push(NOME_TIPO[f.tipo]);
  if (f.q) partes.push(`"${f.q}"`);
  if (f.marca) partes.push(f.marca);
  if (f.cidade) partes.push(`em ${f.cidade}`);
  if (f.preco_min && f.preco_max) partes.push(`R$ ${milhar(f.preco_min)} a R$ ${milhar(f.preco_max)}`);
  else if (f.preco_max) partes.push(`até R$ ${milhar(f.preco_max)}`);
  else if (f.preco_min) partes.push(`a partir de R$ ${milhar(f.preco_min)}`);
  if (f.ano_min) partes.push(`${f.ano_min} ou mais novo`);
  if (f.km_max) partes.push(`até ${milhar(f.km_max)} km`);
  if (f.cambio) partes.push(`câmbio ${f.cambio.toLowerCase()}`);
  if (f.combustivel) partes.push(f.combustivel);
  return partes.length ? partes.join(" · ") : "Todos os veículos";
}
