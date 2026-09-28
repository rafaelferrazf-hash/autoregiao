import type { Metadata } from "next";
import VeiculoCliente from "./VeiculoCliente";
import { criarClienteAnonimo } from "@/lib/supabase-servidor";
import { formatarPreco, formatarKm } from "@/lib/formatar";

// A página em si roda no navegador (VeiculoCliente). Esta parte roda no servidor só para
// gerar título, descrição e foto — é o que o WhatsApp e o Google leem ao abrir o link.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { title: "Anúncio não encontrado — AutoRegião" };

  const { data: v } = await criarClienteAnonimo()
    .from("veiculos")
    .select("nome, preco, ano, km, combustivel, cambio, cidade, fotos, lojas(nome, cidade)")
    .eq("id", id)
    .maybeSingle();
  if (!v) return { title: "Anúncio não encontrado — AutoRegião" };

  const loja = v.lojas as unknown as { nome: string; cidade: string } | null;
  const titulo = `${v.nome} — ${formatarPreco(v.preco)}`;
  const detalhes = [v.ano, v.km ? formatarKm(v.km) : null, v.combustivel, v.cambio, loja?.cidade || v.cidade].filter(Boolean).join(" · ");
  const descricao = `${detalhes}. ${loja?.nome ? `Anunciado por ${loja.nome}. ` : ""}Veja as fotos e fale direto com o vendedor pelo WhatsApp.`;
  const foto = (v.fotos as string[] | null)?.[0];

  return {
    title: `${titulo} | AutoRegião`,
    description: descricao,
    alternates: { canonical: `/veiculo/${id}` },
    openGraph: {
      title: titulo,
      description: descricao,
      url: `/veiculo/${id}`,
      ...(foto ? { images: [{ url: foto, alt: v.nome }] } : {}),
    },
    twitter: { card: foto ? "summary_large_image" : "summary", title: titulo, description: descricao, ...(foto ? { images: [foto] } : {}) },
  };
}

export default function PaginaVeiculo() {
  return <VeiculoCliente />;
}
