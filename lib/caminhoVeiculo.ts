import { slug } from "@/lib/nomesVeiculo";
import type { VeiculoComLoja } from "@/lib/tipos";

// Caminho clicável do anúncio (Início › Carros › Cidade › Marca › Modelo), usado na página
// e nos dados estruturados para o Google (BreadcrumbList). Cada nível leva a uma busca ou vitrine.
export function caminhoDoVeiculo(v: Pick<VeiculoComLoja, "tipo" | "marca" | "modelo" | "cidade" | "lojas">) {
  const rota = v.tipo === "moto" ? "motos" : v.tipo === "utilitario" ? "utilitarios" : "carros";
  const nomeTipo = rota === "motos" ? "Motos" : rota === "utilitarios" ? "Utilitários" : "Carros";
  const cidade = (v.lojas?.cidade || v.cidade || "").trim();
  const itens: { nome: string; href: string }[] = [
    { nome: "Início", href: "/" },
    { nome: nomeTipo, href: `/${rota}` },
  ];
  if (cidade) itens.push({ nome: cidade, href: `/veiculos?${new URLSearchParams({ tipo: rota === "carros" ? "carro" : rota === "motos" ? "moto" : "utilitario", cidade })}` });
  if (v.marca) itens.push({ nome: v.marca.trim(), href: `/${rota}/${slug(v.marca)}` });
  if (v.marca && v.modelo) itens.push({ nome: v.modelo.trim(), href: `/${rota}/${slug(v.marca)}/${slug(v.modelo)}` });
  return itens;
}

// "Ver todas as opções do mesmo modelo": vitrine do modelo (ou da marca, se não tiver modelo).
export function linkMesmoModelo(v: Pick<VeiculoComLoja, "tipo" | "marca" | "modelo">) {
  if (!v.marca) return null;
  const rota = v.tipo === "moto" ? "motos" : v.tipo === "utilitario" ? "utilitarios" : "carros";
  return v.modelo ? `/${rota}/${slug(v.marca)}/${slug(v.modelo)}` : `/${rota}/${slug(v.marca)}`;
}
