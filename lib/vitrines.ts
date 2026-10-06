import { criarClienteAnonimo } from "@/lib/supabase-servidor";
import { aplicarFiltros, type Filtros, type TipoVeiculo } from "@/lib/busca";
import type { VeiculoComLoja } from "@/lib/tipos";
import { slug } from "@/lib/nomesVeiculo";
import { carroceriaDoSlug, pluralCarroceria, slugCarroceria } from "@/lib/carroceria";

// "Vitrines": páginas prontas de busca com endereço próprio, para o Google encontrar
// (/carros, /carros/chevrolet, /carros/chevrolet/onix, /carros/ate-50-mil, /motos, /utilitarios).
// Só no servidor.

export const TIPOS_ROTA = {
  carros: { tipo: "carro" as TipoVeiculo, nome: "Carros", singular: "carro" },
  motos: { tipo: "moto" as TipoVeiculo, nome: "Motos", singular: "moto" },
  utilitarios: { tipo: "utilitario" as TipoVeiculo, nome: "Utilitários", singular: "utilitário" },
};
export type TipoRota = keyof typeof TIPOS_ROTA;

export const FAIXAS_MIL = [30, 50, 80, 100, 150];

export { slug } from "@/lib/nomesVeiculo";

const faixaDoSlug = (s: string) => {
  const m = /^ate-(\d+)-mil$/.exec(s);
  const n = m ? Number(m[1]) : NaN;
  return FAIXAS_MIL.includes(n) ? n : null;
};

type Resumo = { tipo: string | null; marca: string | null; modelo: string | null; preco: number | null; abaixo_fipe: boolean | null; carroceria: string | null };

// Anúncios ativos (só as colunas para montar menus/sitemap). O RLS já esconde lojas inativas.
export async function resumoDosAnuncios(): Promise<Resumo[]> {
  const { data } = await criarClienteAnonimo().from("veiculos").select("tipo, marca, modelo, preco, abaixo_fipe, carroceria").eq("ativo", true).limit(5000);
  return (data ?? []) as Resumo[];
}

const doTipo = (r: Resumo, tipo: TipoVeiculo) => (tipo === "carro" ? r.tipo === "carro" || r.tipo === null : r.tipo === tipo);

// Nome "oficial" (como está nos anúncios) a partir do slug; o mais comum ganha.
function nomePorSlug(valores: (string | null)[], alvo: string): string | null {
  const contagem = new Map<string, number>();
  for (const v of valores) if (v && slug(v) === alvo) contagem.set(v.trim(), (contagem.get(v.trim()) ?? 0) + 1);
  return [...contagem.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function contarPor(valores: (string | null)[]): { nome: string; qtd: number }[] {
  const mapa = new Map<string, { nome: string; qtd: number }>();
  for (const v of valores) {
    if (!v?.trim()) continue;
    const k = slug(v);
    const atual = mapa.get(k);
    if (atual) atual.qtd++; else mapa.set(k, { nome: v.trim(), qtd: 1 });
  }
  return [...mapa.values()].sort((a, b) => b.qtd - a.qtd || a.nome.localeCompare(b.nome, "pt-BR"));
}

export type Vitrine = {
  rota: string;                       // "/carros/chevrolet"
  titulo: string;                     // "Chevrolet à venda"
  h1: string;
  descricao: string;
  filtros: Filtros;
  caminho: { nome: string; href: string }[];
  atalhos: { titulo: string; links: { nome: string; href: string; qtd?: number }[] }[];
};

// Traduz o endereço em filtros. null = endereço que não existe (404).
export async function montarVitrine(tipoRota: TipoRota, segmentos: string[]): Promise<Vitrine | null> {
  const t = TIPOS_ROTA[tipoRota];
  const base = `/${tipoRota}`;
  const todos = (await resumoDosAnuncios()).filter(r => doTipo(r, t.tipo));
  const caminho = [{ nome: "Início", href: "/" }, { nome: t.nome, href: base }];
  const filtros: Filtros = { tipo: t.tipo };
  const plural = t.nome.toLowerCase();

  const atalhoFaixas = {
    titulo: "Por preço",
    links: FAIXAS_MIL.map(n => ({ nome: `Até R$ ${n} mil`, href: `${base}/ate-${n}-mil`, qtd: todos.filter(r => r.preco && r.preco <= n * 1000).length }))
      .filter(l => l.qtd > 0),
  };
  const qtdAbaixo = todos.filter(r => r.abaixo_fipe).length;
  const atalhoOportunidades = {
    titulo: "Oportunidades",
    links: qtdAbaixo ? [{ nome: "Abaixo da FIPE", href: `${base}/abaixo-da-fipe`, qtd: qtdAbaixo }] : [],
  };
  const atalhoCarrocerias = {
    titulo: "Por carroceria",
    links: contarPor(todos.map(r => r.carroceria)).map(c => ({ nome: c.nome, href: `${base}/${slugCarroceria(c.nome)}`, qtd: c.qtd })),
  };
  const atalhoMarcas = {
    titulo: "Por marca",
    links: contarPor(todos.map(r => r.marca)).map(m => ({ nome: m.nome, href: `${base}/${slug(m.nome)}`, qtd: m.qtd })),
  };

  if (segmentos.length === 0) {
    return {
      rota: base, titulo: `${t.nome} à venda`, h1: `${t.nome} à venda`,
      descricao: `${t.nome} novos e seminovos à venda em lojas e com particulares da região. Veja fotos, preços e fale direto com o vendedor pelo WhatsApp.`,
      filtros, caminho, atalhos: [atalhoOportunidades, atalhoCarrocerias, atalhoMarcas, atalhoFaixas],
    };
  }

  const carroceria = segmentos.length === 1 && t.tipo !== "moto" ? carroceriaDoSlug(segmentos[0]) : null;
  if (carroceria) {
    filtros.carroceria = carroceria;
    const plural = pluralCarroceria(carroceria);
    return {
      rota: `${base}/${segmentos[0]}`, titulo: `${plural} à venda`, h1: `${plural} à venda`,
      descricao: `${plural} novos e seminovos à venda em lojas e com particulares da região. Compare preços, veja as fotos e fale direto com o vendedor pelo WhatsApp.`,
      filtros, caminho: [...caminho, { nome: plural, href: `${base}/${segmentos[0]}` }], atalhos: [atalhoCarrocerias, atalhoMarcas, atalhoFaixas],
    };
  }

  if (segmentos.length === 1 && segmentos[0] === "abaixo-da-fipe") {
    filtros.abaixo_fipe = true;
    return {
      rota: `${base}/abaixo-da-fipe`, titulo: `${t.nome} abaixo da FIPE`, h1: `${t.nome} abaixo da Tabela FIPE`,
      descricao: `${t.nome} anunciados por menos que o valor da Tabela FIPE do mês, na região. Oportunidades para comprar bem: veja as fotos e fale direto com o vendedor pelo WhatsApp.`,
      filtros, caminho: [...caminho, { nome: "Abaixo da FIPE", href: `${base}/abaixo-da-fipe` }], atalhos: [atalhoMarcas, atalhoFaixas],
    };
  }

  const faixa = segmentos.length === 1 ? faixaDoSlug(segmentos[0]) : null;
  if (faixa) {
    filtros.preco_max = faixa * 1000;
    return {
      rota: `${base}/ate-${faixa}-mil`, titulo: `${t.nome} até R$ ${faixa} mil`, h1: `${t.nome} até R$ ${faixa} mil`,
      descricao: `${t.nome} à venda por até R$ ${faixa}.000 na região. Compare preços, veja as fotos e fale direto com o vendedor pelo WhatsApp.`,
      filtros, caminho: [...caminho, { nome: `Até R$ ${faixa} mil`, href: `${base}/ate-${faixa}-mil` }], atalhos: [atalhoFaixas, atalhoMarcas],
    };
  }

  if (segmentos.length > 2) return null;
  const marca = nomePorSlug(todos.map(r => r.marca), segmentos[0]);
  if (!marca) return null;
  filtros.marca = marca;
  const daMarca = todos.filter(r => r.marca && slug(r.marca) === segmentos[0]);
  const rotaMarca = `${base}/${segmentos[0]}`;
  const atalhoModelos = {
    titulo: `Modelos ${marca}`,
    links: contarPor(daMarca.map(r => r.modelo)).map(m => ({ nome: m.nome, href: `${rotaMarca}/${slug(m.nome)}`, qtd: m.qtd })),
  };
  caminho.push({ nome: marca, href: rotaMarca });

  if (segmentos.length === 1) {
    return {
      rota: rotaMarca, titulo: `${marca} à venda`, h1: `${t.nome} ${marca} à venda`,
      descricao: `${t.nome} ${marca} novos e seminovos à venda na região. Veja fotos, preços e fale direto com o vendedor pelo WhatsApp.`,
      filtros, caminho, atalhos: [atalhoModelos, atalhoMarcas],
    };
  }

  const modelo = nomePorSlug(daMarca.map(r => r.modelo), segmentos[1]);
  if (!modelo) return null;
  filtros.q = modelo;
  const rotaModelo = `${rotaMarca}/${segmentos[1]}`;
  return {
    rota: rotaModelo, titulo: `${marca} ${modelo} à venda`, h1: `${marca} ${modelo} à venda`,
    descricao: `${marca} ${modelo} à venda na região, novos e seminovos. Compare preços e versões e fale direto com o vendedor pelo WhatsApp.`,
    filtros, caminho: [...caminho, { nome: modelo, href: rotaModelo }], atalhos: [atalhoModelos],
  };
}

export async function veiculosDaVitrine(filtros: Filtros) {
  const consulta = aplicarFiltros(
    criarClienteAnonimo().from("veiculos").select("*, lojas(nome, cidade)", { count: "exact" }).eq("ativo", true),
    filtros,
  );
  const { data, count } = await consulta.order("destaque", { ascending: false }).order("criado_em", { ascending: false }).limit(60);
  return { veiculos: (data ?? []) as VeiculoComLoja[], total: count ?? 0 };
}

// Endereços de vitrine que têm anúncio (para o sitemap).
export async function rotasDeVitrine(): Promise<string[]> {
  const todos = await resumoDosAnuncios();
  const rotas = new Set<string>();
  for (const [rota, t] of Object.entries(TIPOS_ROTA)) {
    const doT = todos.filter(r => doTipo(r, t.tipo));
    if (!doT.length) continue;
    rotas.add(`/${rota}`);
    if (doT.some(r => r.abaixo_fipe)) rotas.add(`/${rota}/abaixo-da-fipe`);
    if (t.tipo !== "moto") for (const r of doT) if (r.carroceria) rotas.add(`/${rota}/${slugCarroceria(r.carroceria)}`);
    for (const n of FAIXAS_MIL) if (doT.some(r => r.preco && r.preco <= n * 1000)) rotas.add(`/${rota}/ate-${n}-mil`);
    for (const r of doT) {
      if (!r.marca?.trim()) continue;
      rotas.add(`/${rota}/${slug(r.marca)}`);
      if (r.modelo?.trim()) rotas.add(`/${rota}/${slug(r.marca)}/${slug(r.modelo)}`);
    }
  }
  return [...rotas];
}

// Título/descrição da vitrine para o Google. Vitrine sem anúncio não é indexada.
export async function metadadosDaVitrine(tipoRota: TipoRota, segmentos: string[]) {
  const vitrine = await montarVitrine(tipoRota, segmentos);
  if (!vitrine) return { title: "Página não encontrada — AutoRegião", robots: { index: false } };
  const { total } = await veiculosDaVitrine(vitrine.filtros);
  return {
    title: `${vitrine.titulo}${total ? ` (${total})` : ""} | AutoRegião`,
    description: vitrine.descricao,
    alternates: { canonical: vitrine.rota },
    openGraph: { title: vitrine.titulo, description: vitrine.descricao, url: vitrine.rota },
    ...(total === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}
