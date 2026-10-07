import type { MetadataRoute } from "next";
import { criarClienteAnonimo } from "@/lib/supabase-servidor";
import { URL_SITE } from "@/lib/site";
import { rotasDeVitrine } from "@/lib/vitrines";
import { linkDoVeiculo } from "@/lib/linkVeiculo";

// Lista de páginas para o Google (www.autoregiao.com.br/sitemap.xml): páginas fixas + todos os
// anúncios e lojas ativos. Refeita no máximo 1x por hora.
export const revalidate = 3600;

// criado_em vem sem fuso horário (horário UTC do banco); o Google espera a data com fuso.
const comFuso = (data: string) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(data) ? data : `${data}Z`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = criarClienteAnonimo();
  const [{ data: veiculos }, { data: lojas }, vitrines] = await Promise.all([
    supabase.from("veiculos").select("id, nome, criado_em").eq("ativo", true).eq("demonstracao", false).order("criado_em", { ascending: false }).limit(5000),
    supabase.from("lojas").select("id").eq("ativo", true).limit(5000),
    rotasDeVitrine(),
  ]);

  const fixas: MetadataRoute.Sitemap = [
    { url: URL_SITE, changeFrequency: "daily", priority: 1 },
    { url: `${URL_SITE}/veiculos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${URL_SITE}/anunciar`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${URL_SITE}/termos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${URL_SITE}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${URL_SITE}/excluir-conta`, changeFrequency: "yearly", priority: 0.1 },
  ];

  return [
    ...fixas,
    // Páginas prontas de busca (/carros, /carros/chevrolet, /carros/ate-50-mil...).
    ...vitrines.map(rota => ({ url: `${URL_SITE}${rota}`, changeFrequency: "daily" as const, priority: rota.split("/").length === 2 ? 0.9 : 0.7 })),
    ...(veiculos ?? []).map(v => ({ url: `${URL_SITE}${linkDoVeiculo(v)}`, lastModified: comFuso(v.criado_em), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...(lojas ?? []).map(l => ({ url: `${URL_SITE}/loja/${l.id}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
