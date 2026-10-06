import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VeiculoCliente from "./VeiculoCliente";
import { criarClienteServidor } from "@/lib/supabase-servidor";
import { formatarPreco, formatarKm } from "@/lib/formatar";
import { NOME_SITE, URL_SITE } from "@/lib/site";
import type { VeiculoComLoja } from "@/lib/tipos";
import { caminhoDoVeiculo } from "@/lib/caminhoVeiculo";

const ID = /^[0-9a-f-]{36}$/i;
const COLUNAS = "*, lojas(nome, cidade, estado, endereco, criado_em, whatsapp, telefone, logo_url)";

// "Lençóis Paulista-SP"
function localDoAnuncio(v: Pick<VeiculoComLoja, "cidade" | "lojas">) {
  const cidade = v.lojas?.cidade || v.cidade;
  const uf = v.lojas?.estado;
  return cidade ? (uf && !cidade.toUpperCase().endsWith(uf.toUpperCase()) ? `${cidade}-${uf}` : cidade) : "";
}

// Título, descrição e foto: o que o Google e o WhatsApp mostram do link.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!ID.test(id)) return { title: "Anúncio não encontrado — AutoRegião" };

  const { data } = await (await criarClienteServidor()).from("veiculos").select(COLUNAS).eq("id", id).maybeSingle();
  const v = data as VeiculoComLoja | null;
  if (!v) return { title: "Anúncio não encontrado — AutoRegião", robots: { index: false } };
  const naoIndexar = v.demonstracao ? { robots: { index: false, follow: false } } : {};

  const local = localDoAnuncio(v);
  // "Chevrolet Onix Plus Premier 2024 à venda em Lençóis Paulista-SP — R$ 89.300"
  const titulo = `${v.nome}${local ? ` à venda em ${local}` : ""} — ${formatarPreco(v.preco)}`;
  const detalhes = [v.ano, v.km ? formatarKm(v.km) : null, v.combustivel, v.cambio].filter(Boolean).join(" · ");
  const descricao = `${v.nome} por ${formatarPreco(v.preco)}${local ? ` em ${local}` : ""}. ${detalhes}. ${v.lojas?.nome ? `Anunciado por ${v.lojas.nome}. ` : ""}Veja as fotos e fale direto com o vendedor pelo WhatsApp.`;
  const foto = v.fotos?.[0];

  return {
    title: `${titulo} | ${NOME_SITE}`,
    description: descricao,
    alternates: { canonical: `/veiculo/${id}` },
    ...naoIndexar,
    openGraph: {
      title: titulo,
      description: descricao,
      url: `/veiculo/${id}`,
      ...(foto ? { images: [{ url: foto, alt: v.nome }] } : {}),
    },
    twitter: { card: foto ? "summary_large_image" : "summary", title: titulo, description: descricao, ...(foto ? { images: [foto] } : {}) },
  };
}

// A página chega pronta do servidor (bom para o Google, que lê o conteúdo sem esperar o navegador).
// Usa a sessão do visitante: o dono ainda consegue ver o próprio anúncio pausado.
export default async function PaginaVeiculo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID.test(id)) notFound();
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("veiculos").select(COLUNAS).eq("id", id).maybeSingle();
  const v = data as VeiculoComLoja | null;
  if (!v) notFound();

  // Dados estruturados (schema.org): ajudam o Google a mostrar preço, ano e km no resultado.
  const dadosEstruturados = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: v.nome,
    url: `${URL_SITE}/veiculo/${v.id}`,
    ...(v.fotos?.length ? { image: v.fotos.slice(0, 5) } : {}),
    ...(v.marca ? { brand: { "@type": "Brand", name: v.marca } } : {}),
    ...(v.modelo ? { model: v.modelo } : {}),
    ...(v.ano ? { vehicleModelDate: v.ano } : {}),
    ...(v.km ? { mileageFromOdometer: { "@type": "QuantitativeValue", value: Number(v.km), unitCode: "KMT" } } : {}),
    ...(v.combustivel ? { fuelType: v.combustivel } : {}),
    ...(v.cambio ? { vehicleTransmission: v.cambio } : {}),
    ...(v.cor ? { color: v.cor } : {}),
    ...(v.descricao ? { description: v.descricao.slice(0, 500) } : {}),
    ...(v.preco ? {
      offers: {
        "@type": "Offer",
        price: v.preco,
        priceCurrency: "BRL",
        availability: v.ativo ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
        url: `${URL_SITE}/veiculo/${v.id}`,
        ...(v.lojas?.nome || v.nome_contato ? { seller: { "@type": v.lojas ? "AutoDealer" : "Person", name: v.lojas?.nome || v.nome_contato } } : {}),
      },
    } : {}),
  };

  const caminho = caminhoDoVeiculo(v);
  const dadosCaminho = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [...caminho, { nome: v.nome ?? "Anúncio", href: `/veiculo/${v.id}` }].map((c, i) => ({
      "@type": "ListItem", position: i + 1, name: c.nome, item: `${URL_SITE}${c.href}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosCaminho).replace(/</g, "\\u003c") }} />
      <VeiculoCliente inicial={v} />
    </>
  );
}
