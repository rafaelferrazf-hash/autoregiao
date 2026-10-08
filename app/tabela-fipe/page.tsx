import type { Metadata } from "next";
import Link from "next/link";
import PaginaSimples from "@/components/PaginaSimples";
import ConsultaFipe from "@/components/ConsultaFipe";
import { listarMarcas } from "@/lib/fipe";
import { limparMarca, slug } from "@/lib/nomesVeiculo";

export const metadata: Metadata = {
  title: "Tabela FIPE: consulte o preço de carros e motos | AutoRegião",
  description: "Consulte grátis a Tabela FIPE atualizada do mês: valor de carros, utilitários e motos por marca, modelo e ano. Veja também os anúncios da região.",
  alternates: { canonical: "/tabela-fipe" },
};

// Marcas que aparecem primeiro na lista de atalhos.
const POPULARES = ["Chevrolet", "Fiat", "Volkswagen", "Toyota", "Hyundai", "Honda", "Jeep", "Renault", "Ford", "Nissan", "Peugeot", "Citroën"];

type Busca = { tipo?: string; marca?: string; modelo?: string; ano?: string };

export default async function TabelaFipe({ searchParams }: { searchParams: Promise<Busca> }) {
  const p = await searchParams;
  const tipo = p.tipo === "motorcycles" ? "motorcycles" : "cars";
  const so = (v?: string) => (v && /^[0-9-]{1,10}$/.test(v) ? v : undefined);
  const [carros, motos] = await Promise.all([listarMarcas("cars").catch(() => []), listarMarcas("motorcycles").catch(() => [])]);
  // Sem repetir (marcas diferentes na FIPE podem virar o mesmo nome, ex.: "Caoa Chery" e "Chery").
  const ordenar = (lista: { nome: string; href: string }[]) =>
    [...new Map(lista.map(a => [a.href, a])).values()].sort((a, b) => (POPULARES.indexOf(a.nome) + 1 || 99) - (POPULARES.indexOf(b.nome) + 1 || 99) || a.nome.localeCompare(b.nome, "pt-BR"));
  const atalhosCarros = ordenar(carros.map(m => ({ nome: limparMarca(m.nome), href: `/tabela-fipe/carros/${slug(limparMarca(m.nome))}` })));
  const atalhosMotos = ordenar(motos.map(m => ({ nome: limparMarca(m.nome), href: `/tabela-fipe/motos/${slug(limparMarca(m.nome))}` })));
  const chip = { display: "inline-block", padding: "6px 12px", background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 20, fontSize: 12.5, color: "#1A1917", textDecoration: "none" } as const;

  return (
    <PaginaSimples>
      <nav aria-label="Caminho" style={{ fontSize: 12, color: "#7A7670", marginBottom: 12 }}>
        <Link href="/" style={{ color: "#7A7670", textDecoration: "none" }}>Início</Link> › <span style={{ color: "#1A1917" }}>Tabela FIPE</span>
      </nav>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1A1917", margin: "0 0 6px" }}>Tabela FIPE</h1>
      <p style={{ fontSize: 14, color: "#7A7670", margin: "0 0 18px", lineHeight: 1.6 }}>
        Consulte grátis o preço médio de mercado de carros, utilitários e motos, atualizado todo mês. Escolha a marca, o modelo e o ano.
      </p>
      <ConsultaFipe inicial={{ tipo, marca: so(p.marca), modelo: so(p.modelo), ano: so(p.ano) }} />

      <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1A1917", margin: "28px 0 12px" }}>Tabela FIPE de carros por marca</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {atalhosCarros.map(a => <Link key={a.href} href={a.href} style={chip}>{a.nome}</Link>)}
      </div>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1A1917", margin: "24px 0 12px" }}>Tabela FIPE de motos por marca</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {atalhosMotos.map(a => <Link key={a.href} href={a.href} style={chip}>{a.nome}</Link>)}
      </div>
    </PaginaSimples>
  );
}
