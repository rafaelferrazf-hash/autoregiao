import { notFound } from "next/navigation";
import PaginaVitrine from "@/components/PaginaVitrine";
import { metadadosDaVitrine, montarVitrine, veiculosDaVitrine } from "@/lib/vitrines";

// Vitrine /utilitarios, /utilitarios/<marca>, /utilitarios/<marca>/<modelo>, /utilitarios/ate-50-mil (ver lib/vitrines.ts).
type Props = { params: Promise<{ filtro?: string[] }> };

export async function generateMetadata({ params }: Props) {
  return metadadosDaVitrine("utilitarios", (await params).filtro ?? []);
}

export default async function Pagina({ params }: Props) {
  const vitrine = await montarVitrine("utilitarios", (await params).filtro ?? []);
  if (!vitrine) notFound();
  const { veiculos, total } = await veiculosDaVitrine(vitrine.filtros);
  return <PaginaVitrine vitrine={vitrine} veiculos={veiculos} total={total} />;
}
