import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PaginaSimples from "@/components/PaginaSimples";
import { listarMarcas, listarModelos, type TipoFipe } from "@/lib/fipe";
import { limparMarca, limparVersao, modeloBase, slug } from "@/lib/nomesVeiculo";

// /tabela-fipe/carros/chevrolet, /tabela-fipe/motos/honda: lista os modelos da marca (para o Google).
// Cada versão abre a consulta já preenchida. Listas em cache por 7 dias (lib/fipe.ts) — poucas
// consultas à API da FIPE, que tem limite diário.
const TIPOS: Record<string, { fipe: TipoFipe; nome: string }> = { carros: { fipe: "cars", nome: "carros" }, motos: { fipe: "motorcycles", nome: "motos" } };

async function dados(tipoRota: string, marcaSlug: string) {
  const t = TIPOS[tipoRota];
  if (!t) return null;
  const marcas = await listarMarcas(t.fipe).catch(() => []);
  const marca = marcas.find(m => slug(limparMarca(m.nome)) === marcaSlug);
  if (!marca) return null;
  const modelos = await listarModelos(t.fipe, marca.codigo).catch(() => []);
  // Agrupa as versões pelo modelo "curto" (Onix, HB20, Hilux...).
  const grupos = new Map<string, { codigo: string; nome: string }[]>();
  for (const m of modelos) {
    const base = modeloBase(m.nome);
    grupos.set(base, [...(grupos.get(base) ?? []), { codigo: m.codigo, nome: limparVersao(m.nome) }]);
  }
  return { t, marca: { codigo: marca.codigo, nome: limparMarca(marca.nome) }, grupos: [...grupos.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR")) };
}

export async function generateMetadata({ params }: { params: Promise<{ tipo: string; marca: string }> }): Promise<Metadata> {
  const { tipo, marca } = await params;
  const d = await dados(tipo, marca);
  if (!d) return { title: "Tabela FIPE — AutoRegião", robots: { index: false } };
  return {
    title: `Tabela FIPE ${d.marca.nome}: preço de todos os modelos | AutoRegião`,
    description: `Consulte grátis a Tabela FIPE de ${d.t.nome} ${d.marca.nome} atualizada: ${d.grupos.slice(0, 6).map(g => g[0]).join(", ")} e outros modelos, por ano.`,
    alternates: { canonical: `/tabela-fipe/${tipo}/${marca}` },
  };
}

export default async function TabelaFipeMarca({ params }: { params: Promise<{ tipo: string; marca: string }> }) {
  const { tipo, marca } = await params;
  const d = await dados(tipo, marca);
  if (!d) notFound();
  const link = (modelo: string) => `/tabela-fipe?${new URLSearchParams({ tipo: d.t.fipe, marca: d.marca.codigo, modelo })}`;

  return (
    <PaginaSimples>
      <nav aria-label="Caminho" style={{ fontSize: 12, color: "#7A7670", marginBottom: 12 }}>
        <Link href="/" style={{ color: "#7A7670", textDecoration: "none" }}>Início</Link>
        {" › "}
        <Link href="/tabela-fipe" style={{ color: "#7A7670", textDecoration: "none" }}>Tabela FIPE</Link>
        {" › "}
        <span style={{ color: "#1A1917" }}>{d.marca.nome}</span>
      </nav>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1A1917", margin: "0 0 6px" }}>Tabela FIPE {d.marca.nome}</h1>
      <p style={{ fontSize: 14, color: "#7A7670", margin: "0 0 18px", lineHeight: 1.6 }}>
        Escolha a versão para ver o preço da Tabela FIPE de cada ano. São {d.grupos.length} modelos de {d.t.nome} {d.marca.nome}.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {d.grupos.map(([base, versoes]) => (
          <div key={base} style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "12px 14px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#1A1917", margin: "0 0 8px" }}>{d.marca.nome} {base}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {versoes.map(v => (
                <Link key={v.codigo} href={link(v.codigo)} style={{ fontSize: 12.5, color: "#1A1917", padding: "5px 10px", background: "#F7F6F3", border: "1px solid #E8E6E1", borderRadius: 8, textDecoration: "none" }}>{v.nome}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PaginaSimples>
  );
}
