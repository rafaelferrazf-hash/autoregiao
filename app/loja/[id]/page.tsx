import Link from "next/link";
import Logo from "@/components/Logo";
import CartaoVeiculo from "@/components/CartaoVeiculo";
import MapaLoja from "@/components/MapaLoja";
import LogoLoja from "@/components/LogoLoja";
import Rodape from "@/components/Rodape";
import { notFound } from "next/navigation";
import { criarClienteAnonimo } from "@/lib/supabase-servidor";
import type { Loja, Veiculo } from "@/lib/tipos";
import type { Metadata } from "next";

// Título, descrição e foto de capa para o link da loja no WhatsApp/Google.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { title: "Loja não encontrada — AutoRegião" };
  const supabase = criarClienteAnonimo();
  const { data: loja } = await supabase.from("lojas").select("nome, cidade, estado, descricao, ativo").eq("id", id).maybeSingle();
  if (!loja || loja.ativo === false) return { title: "Loja não encontrada — AutoRegião" };

  const { data: carros, count } = await supabase
    .from("veiculos")
    .select("fotos", { count: "exact" })
    .eq("loja_id", id)
    .eq("ativo", true)
    .order("criado_em", { ascending: false })
    .limit(5);
  const foto = (carros ?? []).map(c => (c.fotos as string[] | null)?.[0]).find(Boolean);
  const local = [loja.cidade, loja.estado].filter(Boolean).join("/");
  const qtd = count ?? 0;
  const descricao = loja.descricao?.slice(0, 160)
    || `${qtd} ${qtd === 1 ? "veículo à venda" : "veículos à venda"}${local ? ` em ${local}` : ""}. Fale direto com a loja pelo WhatsApp.`;

  return {
    title: `${loja.nome}${local ? ` — ${local}` : ""} | AutoRegião`,
    description: descricao,
    alternates: { canonical: `/loja/${id}` },
    openGraph: {
      title: loja.nome,
      description: descricao,
      url: `/loja/${id}`,
      ...(foto ? { images: [{ url: foto, alt: loja.nome }] } : {}),
    },
  };
}

// Página pública da loja. Roda no servidor e lê só dados públicos (RLS: lojas e veículos ativos).
// No Next 16, `params` é uma Promise.
export default async function PerfilLoja({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = criarClienteAnonimo();
  const { data: loja } = await supabase.from("lojas").select("*").eq("id", id).maybeSingle<Loja>();
  // Loja desativada pelo admin some do site (os anúncios já somem pelo RLS).
  if (!loja || loja.ativo === false) notFound();

  const { data } = await supabase
    .from("veiculos")
    .select("id, nome, ano, km, combustivel, preco, fotos, destaque, fipe_valor")
    .eq("loja_id", id)
    .eq("ativo", true)
    .order("criado_em", { ascending: false });
  const veiculos = (data ?? []) as Pick<Veiculo, "id" | "nome" | "ano" | "km" | "combustivel" | "preco" | "fotos" | "destaque" | "fipe_valor">[];

  const telefone = (loja.telefone || "").replace(/\D/g, "");
  const whatsapp = (loja.whatsapp || loja.telefone || "").replace(/\D/g, "");
  const desde = loja.criado_em ? new Date(loja.criado_em).getFullYear() : null;
  const local = [loja.cidade, loja.estado].filter(Boolean).join(", ");
  const informacoes = [
    ["📍", "Endereço", loja.endereco],
    ["🕐", "Horário", loja.horario],
    ["📞", "Telefone", loja.telefone],
  ].filter(([, , valor]) => valor) as [string, string, string][];

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>

      <style>{`
        .loja-grid { display: grid; grid-template-columns: 1fr 280px; gap: 20px; }
        .loja-carros { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        @media (max-width: 768px) {
          .loja-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .loja-carros { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo />
        </Link>
        <Link href="/veiculos" style={{ fontSize: 13, color: "#7A7670", textDecoration: "none" }}>← Ver todos os veículos</Link>
      </nav>

      <div style={{ paddingTop: 60 }}>

        {/* HEADER DA LOJA */}
        <div style={{ background: "#1A1917", padding: "32px 16px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
            <LogoLoja url={loja.logo_url} tamanho={80} raio={16} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{loja.nome}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>
                {local && <>📍 {local}</>}{local && desde && " · "}{desde && <>Na plataforma desde {desde}</>}
              </div>
              <div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>🚗 {veiculos.length}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>{veiculos.length === 1 ? "veículo à venda" : "veículos à venda"}</span>
              </div>
            </div>
            {(telefone || whatsapp) && (
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {telefone && (
                  <a href={`tel:${telefone}`} style={{ padding: "8px 16px", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
                    📞 Ligar
                  </a>
                )}
                {whatsapp && (
                  <a href={`https://wa.me/55${whatsapp}`} target="_blank" rel="noopener noreferrer"
                    style={{ padding: "8px 16px", background: "#25D366", border: "none", borderRadius: 8, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                    💬 WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="loja-grid" style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>

          {/* VEÍCULOS */}
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#1A1917", marginBottom: 14 }}>
              Veículos à venda <span style={{ fontSize: 13, color: "#7A7670", fontWeight: 400 }}>({veiculos.length} {veiculos.length === 1 ? "anúncio" : "anúncios"})</span>
            </div>
            {veiculos.length === 0 ? (
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 32, textAlign: "center", fontSize: 13, color: "#7A7670" }}>
                Esta loja ainda não tem veículos anunciados.
              </div>
            ) : (
              <div className="loja-carros">
                {veiculos.map(car => (
                  <CartaoVeiculo key={car.id} car={car} mostrarLoja={false} />
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {loja.descricao && (
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "16px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 10 }}>Sobre a loja</div>
                <p style={{ fontSize: 13, color: "#7A7670", lineHeight: 1.6, margin: 0 }}>{loja.descricao}</p>
              </div>
            )}

            {informacoes.length > 0 && (
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "16px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 12 }}>Informações</div>
                {informacoes.map(([icon, label, value]) => (
                  <div key={label} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
                      <div style={{ fontSize: 13, color: "#1A1917", marginTop: 1 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loja.endereco && <MapaLoja endereco={loja.endereco} cidade={loja.cidade} estado={loja.estado} nome={loja.nome} />}

            {whatsapp && (
              <a href={`https://wa.me/55${whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", background: "#25D366", borderRadius: 12, padding: "16px", textAlign: "center", textDecoration: "none" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>💬</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Falar com a loja</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>Responde pelo WhatsApp</div>
              </a>
            )}
          </div>
        </div>
      </div>
      <Rodape />
    </main>
  );
}
