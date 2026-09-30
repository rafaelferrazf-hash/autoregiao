import { criarClienteAdmin } from "@/lib/supabase-servidor";

// Tabela FIPE pela API pública da Parallelum (fipe.parallelum.com.br/api/v2), sem chave:
// limite de ~1000 consultas por dia por servidor. Por isso tudo passa pelo cache da Vercel:
// listas de marcas/modelos/anos mudam pouco (7 dias) e o valor muda 1x por mês (1 dia de cache).
// Só no servidor.

const BASE = "https://fipe.parallelum.com.br/api/v2";

// Tipo do anúncio → tipo da FIPE. Utilitários (picapes, vans, SUVs) estão em "cars" na FIPE.
export const TIPO_FIPE: Record<string, "cars" | "motorcycles"> = { carro: "cars", utilitario: "cars", moto: "motorcycles" };
export type TipoFipe = "cars" | "motorcycles";
export type OpcaoFipe = { codigo: string; nome: string };
export type ValorFipe = { valor: number; codigoFipe: string; mes: string; modelo: string; marca: string; anoModelo: number; combustivel: string };

const CODIGO = /^[0-9]{1,6}$/;
const CODIGO_ANO = /^[0-9]{4}-[0-9]{1,2}$/;

export function tipoFipeValido(t: string | null | undefined): t is TipoFipe {
  return t === "cars" || t === "motorcycles";
}

async function buscar<T>(caminho: string, revalidar: number): Promise<T> {
  const r = await fetch(`${BASE}${caminho}`, { next: { revalidate: revalidar } });
  if (!r.ok) throw new Error(`FIPE ${r.status}`);
  return r.json() as Promise<T>;
}

const SETE_DIAS = 7 * 86_400;

export async function listarMarcas(tipo: TipoFipe): Promise<OpcaoFipe[]> {
  const lista = await buscar<{ code: string; name: string }[]>(`/${tipo}/brands`, SETE_DIAS);
  return lista.map(m => ({ codigo: m.code, nome: m.name }));
}

export async function listarModelos(tipo: TipoFipe, marca: string): Promise<OpcaoFipe[]> {
  if (!CODIGO.test(marca)) return [];
  const lista = await buscar<{ code: string; name: string }[]>(`/${tipo}/brands/${marca}/models`, SETE_DIAS);
  return lista.map(m => ({ codigo: m.code, nome: m.name }));
}

export async function listarAnos(tipo: TipoFipe, marca: string, modelo: string): Promise<OpcaoFipe[]> {
  if (!CODIGO.test(marca) || !CODIGO.test(modelo)) return [];
  const lista = await buscar<{ code: string; name: string }[]>(`/${tipo}/brands/${marca}/models/${modelo}/years`, SETE_DIAS);
  // "32000-1" é o código da FIPE para 0 km.
  return lista.map(a => ({ codigo: a.code, nome: a.name.replace(/^32000\b/, "0 km") }));
}

// "R$ 53.969,00" → 53969
function paraReais(texto: string): number | null {
  const n = Number(texto.replace(/[^\d,]/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

export async function consultarValor(tipo: TipoFipe, marca: string, modelo: string, ano: string): Promise<ValorFipe | null> {
  if (!CODIGO.test(marca) || !CODIGO.test(modelo) || !CODIGO_ANO.test(ano)) return null;
  const d = await buscar<{ price: string; codeFipe: string; referenceMonth: string; model: string; brand: string; modelYear: number; fuel: string }>(
    `/${tipo}/brands/${marca}/models/${modelo}/years/${ano}`, 86_400,
  );
  const valor = paraReais(d.price);
  if (!valor) return null;
  return { valor, codigoFipe: d.codeFipe, mes: d.referenceMonth, modelo: d.model, marca: d.brand, anoModelo: d.modelYear, combustivel: d.fuel };
}

type LinhaFipe = { id: string; fipe_tipo: string | null; fipe_marca: string | null; fipe_modelo: string | null; fipe_ano: string | null };

// Grava o valor da FIPE no anúncio (service key: o trigger proteger_valor_fipe só deixa o servidor
// mexer nesses campos).
async function gravarValor(linha: LinhaFipe): Promise<ValorFipe | null> {
  const admin = criarClienteAdmin();
  const { fipe_tipo, fipe_marca, fipe_modelo, fipe_ano } = linha;
  const valor = tipoFipeValido(fipe_tipo) && fipe_marca && fipe_modelo && fipe_ano
    ? await consultarValor(fipe_tipo, fipe_marca, fipe_modelo, fipe_ano)
    : null;
  await admin.from("veiculos").update({
    fipe_valor: valor?.valor ?? null,
    fipe_codigo: valor?.codigoFipe ?? null,
    fipe_mes: valor?.mes ?? null,
    fipe_em: new Date().toISOString(),
  }).eq("id", linha.id);
  return valor;
}

const COLUNAS = "id, fipe_tipo, fipe_marca, fipe_modelo, fipe_ano";

export async function atualizarFipeDoVeiculo(id: string): Promise<ValorFipe | null> {
  const { data } = await criarClienteAdmin().from("veiculos").select(COLUNAS).eq("id", id).maybeSingle();
  return data ? gravarValor(data) : null;
}

// Cron diário: a FIPE muda todo mês. Atualiza aos poucos os anúncios ativos com valor de mais
// de 25 dias (ou nunca calculado), para não estourar o limite diário da API.
export async function atualizarFipesVencidas(limite = 40): Promise<{ atualizados: number }> {
  const corte = new Date(Date.now() - 25 * 86_400_000).toISOString();
  const { data } = await criarClienteAdmin()
    .from("veiculos")
    .select(COLUNAS)
    .eq("ativo", true)
    .not("fipe_ano", "is", null)
    .or(`fipe_em.is.null,fipe_em.lt.${corte}`)
    .order("fipe_em", { ascending: true, nullsFirst: true })
    .limit(limite);
  let atualizados = 0;
  for (const linha of data ?? []) {
    try { await gravarValor(linha); atualizados++; } catch (e) { console.error("fipe:", linha.id, e); }
  }
  return { atualizados };
}
