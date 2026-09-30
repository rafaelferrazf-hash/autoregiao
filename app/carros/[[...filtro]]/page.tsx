import { notFound } from "next/navigation";
import PaginaVitrine from "@/components/PaginaVitrine";
import { metadadosDaVitrine, montarVitrine, veiculosDaVitrine } from "@/lib/vitrines";

// Vitrine /carros, /carros/<marca>, /carros/<marca>/<modelo>, /carros/ate-50-mil (ver lib/vitrines.ts).
type Props = { params: Promise<{ filtro?: string[] }> };

export async function generateMetadata({ params }: Props) {
  return metadadosDaVitrine("carros", (await params).filtro ?? []);
}

export default async function Pagina({ params }: Props) {
  const vitrine = await montarVitrine("carros", (await params).filtro ?? []);
  if (!vitrine) notFound();
  const { veiculos, total } = await veiculosDaVitrine(vitrine.filtros);
  return <PaginaVitrine vitrine={vitrine} veiculos={veiculos} total={total} />;
}
