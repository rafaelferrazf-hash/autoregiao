import { ESTILOS, ehEstilo, type Estilo } from "@/lib/estilos";
import { precoMaximoPelaParcela } from "@/lib/financiamento";
import { condicaoDoSlug, slugDaCondicao } from "@/lib/situacaoVeiculo";
// Filtros da busca de veículos. Ficam na URL (?marca=Honda&preco_max=90000) para a busca
// poder ser compartilhada e para o botão "voltar" do navegador funcionar.

export type Ordem = "recentes" | "menor_preco" | "maior_preco" | "menor_km";
export type TipoVeiculo = "carro" | "moto" | "utilitario";
export type Anunciante = "loja" | "particular";

export type Filtros = {
  q?: string;
  tipo?: TipoVeiculo;
  marca?: string;
  cidade?: string;
  cambio?: string;
  combustivel?: string;
  carroceria?: string;        // Hatch, Sedã, SUV, Picape... (?carroceria=SUV)
  ano_min?: number;
  preco_min?: number;
  preco_max?: number;
  km_max?: number;
  ordem?: Ordem;
  abaixo_fipe?: boolean;       // só anúncios abaixo da Tabela FIPE (?abaixo_fipe=1)
  anunciante?: Anunciante;     // loja ou particular (?anunciante=loja)
  parcela_max?: number;        // "busca por parcela": parcela estimada até X por mês (lib/financiamento.ts)
  estilo?: Estilo;             // primeiro-carro, familia, economicos, trabalho, 4x4 (lib/estilos.ts)
  condicoes?: string[];        // situação do veículo, todas exigidas (?cond=ipva-pago,unico-dono)
};

const ORDENS: Ordem[] = ["recentes", "menor_preco", "maior_preco", "menor_km"];
const TIPOS: TipoVeiculo[] = ["carro", "moto", "utilitario"];
const TEXTOS = ["q", "marca", "cidade", "cambio", "combustivel", "carroceria"] as const;
const NUMEROS = ["ano_min", "preco_min", "preco_max", "km_max", "parcela_max"] as const;

// "R$ 90.000" / "90000" / "90.000,00" → 90000 (centavos descartados). Vazio ou inválido → undefined.
export function paraNumero(v: string | null | undefined): number | undefined {
  if (!v) return undefined;
  const n = parseInt(v.trim().replace(/[.,]\d{1,2}$/, "").replace(/\D/g, ""), 10);
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
  if (params.get("abaixo_fipe") === "1") f.abaixo_fipe = true;
  const anunciante = params.get("anunciante");
  if (anunciante === "loja" || anunciante === "particular") f.anunciante = anunciante;
  const estilo = params.get("estilo");
  if (ehEstilo(estilo)) f.estilo = estilo;
  const cond = (params.get("cond") ?? "").split(",").map(c => condicaoDoSlug(c.trim())).filter((c): c is string => !!c);
  if (cond.length) f.condicoes = [...new Set(cond)];
  const ordem = params.get("ordem");
  if (ordem && (ORDENS as string[]).includes(ordem) && ordem !== "recentes") f.ordem = ordem as Ordem;
  return f;
}

export function filtrosParaQuery(f: Filtros): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (v === undefined || v === "" || v === false || (k === "ordem" && v === "recentes")) continue;
    if (k === "condicoes") {
      const slugs = (v as string[]).map(slugDaCondicao).filter(Boolean);
      if (slugs.length) p.set("cond", slugs.join(","));
      continue;
    }
    p.set(k, v === true ? "1" : String(v));
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
  is(coluna: string, valor: null): Q;
  not(coluna: string, operador: string, valor: null): Q;
  in(coluna: string, valores: string[]): Q;
  contains(coluna: string, valores: string[]): Q;
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
  if (f.carroceria) consulta = consulta.eq("carroceria", f.carroceria);
  if (f.ano_min) consulta = consulta.gte("ano_num", f.ano_min);
  if (f.preco_min) consulta = consulta.gte("preco", f.preco_min);
  if (f.preco_max) consulta = consulta.lte("preco", f.preco_max);
  if (f.km_max) consulta = consulta.lte("km_num", f.km_max);
  if (f.parcela_max) consulta = consulta.lte("preco", precoMaximoPelaParcela(f.parcela_max));
  if (f.condicoes?.length) consulta = consulta.contains("condicoes", f.condicoes);
  if (f.estilo === "primeiro-carro") consulta = consulta.eq("carroceria", "Hatch").lte("preco", 60000);
  if (f.estilo === "familia") consulta = consulta.in("carroceria", ["SUV", "Sedã", "Minivan", "Perua"]);
  if (f.estilo === "trabalho") consulta = consulta.in("carroceria", ["Picape", "Van", "Furgão", "Caminhão"]);
  if (f.estilo === "economicos") consulta = consulta.or("versao.ilike.%1.0%,nome.ilike.%1.0%");
  if (f.estilo === "4x4") consulta = consulta.or("versao.ilike.%4x4%,nome.ilike.%4x4%,versao.ilike.%4wd%,versao.ilike.%awd%");
  // abaixo_fipe: coluna calculada pelo banco (supabase/fase7-filtros.sql).
  if (f.abaixo_fipe) consulta = consulta.eq("abaixo_fipe", "true");
  if (f.anunciante === "loja") consulta = consulta.not("loja_id", "is", null);
  if (f.anunciante === "particular") consulta = consulta.is("loja_id", null);
  return consulta;
}

const NOME_TIPO: Record<TipoVeiculo, string> = { carro: "Carros", moto: "Motos", utilitario: "Utilitários" };
const milhar = (n: number) => n.toLocaleString("pt-BR");

// "Carros · Toyota · até R$ 200.000 · 2018 ou mais novo" — usado no alerta e nos e-mails.
export function descreverFiltros(f: Filtros): string {
  const partes: string[] = [];
  if (f.estilo) partes.push(ESTILOS[f.estilo].nome);
  if (f.carroceria) partes.push(f.carroceria);
  else if (f.tipo) partes.push(NOME_TIPO[f.tipo]);
  if (f.q) partes.push(`"${f.q}"`);
  if (f.marca) partes.push(f.marca);
  if (f.cidade) partes.push(`em ${f.cidade}`);
  if (f.preco_min && f.preco_max) partes.push(`R$ ${milhar(f.preco_min)} a R$ ${milhar(f.preco_max)}`);
  else if (f.preco_max) partes.push(`até R$ ${milhar(f.preco_max)}`);
  else if (f.preco_min) partes.push(`a partir de R$ ${milhar(f.preco_min)}`);
  if (f.ano_min) partes.push(`${f.ano_min} ou mais novo`);
  if (f.km_max) partes.push(`até ${milhar(f.km_max)} km`);
  if (f.parcela_max) partes.push(`parcela até R$ ${milhar(f.parcela_max)}/mês`);
  if (f.condicoes?.length) partes.push(f.condicoes.join(", "));
  if (f.cambio) partes.push(`câmbio ${f.cambio.toLowerCase()}`);
  if (f.combustivel) partes.push(f.combustivel);
  if (f.abaixo_fipe) partes.push("abaixo da FIPE");
  if (f.anunciante) partes.push(f.anunciante === "loja" ? "de lojas" : "de particulares");
  return partes.length ? partes.join(" · ") : "Todos os veículos";
}
