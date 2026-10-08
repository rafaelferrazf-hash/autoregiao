import Link from "next/link";
import Logo from "@/components/Logo";
import CartaoVeiculo from "@/components/CartaoVeiculo";
import MapaLoja from "@/components/MapaLoja";
import LogoLoja from "@/components/LogoLoja";
import Rodape from "@/components/Rodape";
import { notFound } from "next/navigation";
import { criarClienteAnonimo, criarClienteServidor } from "@/lib/supabase-servidor";
import type { Loja, Veiculo } from "@/lib/tipos";
import type { Metadata } from "next";
import Icone, { type NomeIcone } from "@/components/Icone";

// Título, descrição e foto de capa para o link da loja no WhatsApp/Google.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { title: "Loja não encontrada — AutoRegião" };
  const supabase = criarClienteAnonimo();
  const { data: loja } = await supabase.from("lojas").select("*").eq("id", id).maybeSingle();
  if (!loja || loja.ativo === false) return { title: "Loja não encontrada — AutoRegião" };

  const { data: carros, count } = await supabase
    .from("veiculos")
    .select("fotos", { count: "exact" })
    .eq("loja_id", id)
    .eq("ativo", true)
    .order("criado_em", { ascending: false })
    .limit(5);
  const foto = (loja as Loja).capa_url || (carros ?? []).map(c => (c.fotos as string[] | null)?.[0]).find(Boolean);
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

  // Com a sessão de quem visita: o dono também vê os próprios anúncios de demonstração (fase14).
  const { data } = await (await criarClienteServidor())
    .from("veiculos")
    .select("id, nome, ano, km, combustivel, preco, fotos, destaque, fipe_valor, condicoes")
    .eq("loja_id", id)
    .eq("ativo", true)
    .order("criado_em", { ascending: false });
  const veiculos = (data ?? []) as Pick<Veiculo, "id" | "nome" | "ano" | "km" | "combustivel" | "preco" | "fotos" | "destaque" | "fipe_valor" | "condicoes">[];

  const telefone = (loja.telefone || "").replace(/\D/g, "");
  const whatsapp = (loja.whatsapp || loja.telefone || "").replace(/\D/g, "");
  const desde = loja.criado_em ? new Date(loja.criado_em).getFullYear() : null;
  const local = [loja.cidade, loja.estado].filter(Boolean).join(", ");
  const informacoes = [
    ["relogio", "Horário", loja.horario],
    ["telefone", "Telefone", loja.telefone],
  ].filter(([, , valor]) => valor) as [NomeIcone, string, string][];

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>

      <style>{`
        .loja-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        .loja-topo { display: grid; grid-template-columns: minmax(0, 2.2fr) minmax(300px, 1fr); gap: 18px; align-items: stretch; }
        .loja-capa { background: #1A1A1A; border-radius: 14px; overflow: hidden; aspect-ratio: 16 / 9; max-width: 100%; }
        .loja-carros { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
        @media (max-width: 768px) {
          .loja-grid { grid-template-columns: 1fr !important; }
          .loja-topo { grid-template-columns: 1fr !important; }
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
        <Link href="/veiculos" style={{ fontSize: 13, color: "#7A7670", textDecoration: "none", whiteSpace: "nowrap" }}>← Buscar veículos</Link>
      </nav>

      <div style={{ paddingTop: 60 }}>

        {/* TOPO DA LOJA: foto de capa em destaque + cartão com contato */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E8E6E1" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px 24px" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1A1917", margin: "0 0 14px", lineHeight: 1.25 }}>
              {loja.nome}{local && <span style={{ color: "#7A7670", fontWeight: 600 }}> · {local}</span>}
            </h1>
            <div className="loja-topo">
              <div className="loja-capa">
                {loja.capa_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={loja.capa_url} alt={`Fachada da ${loja.nome}`} fetchPriority="high" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : loja.logo_url
                    // Sem capa: o logo/foto ocupa o quadro inteiro (sem cortar), com a própria imagem desfocada no fundo.
                    ? <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
                        <div aria-hidden="true" style={{ position: "absolute", inset: -30, backgroundImage: `url(${loja.logo_url})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(28px) brightness(0.55)" }} />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={loja.logo_url} alt={loja.nome} fetchPriority="high" style={{ position: "relative", width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                      </div>
                    : <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                        <LogoLoja url={null} tamanho={96} raio={20} />
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", textAlign: "center", padding: "0 16px" }}>{loja.nome}</div>
                      </div>}
              </div>

              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <LogoLoja url={loja.logo_url} tamanho={52} raio={12} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1A1917", lineHeight: 1.25 }}>{loja.nome}</div>
                    <div style={{ fontSize: 12.5, color: "#7A7670", marginTop: 2 }}>
                      <Icone nome="carro" /> {veiculos.length} {veiculos.length === 1 ? "veículo à venda" : "veículos à venda"}
                    </div>
                  </div>
                </div>
                {(loja.endereco || local) && (
                  <div style={{ display: "flex", gap: 8, fontSize: 13, color: "#1A1917", lineHeight: 1.45 }}>
                    <span style={{ color: "#FF6600", display: "flex", paddingTop: 1 }}><Icone nome="local" tamanho={18} /></span>
                    <span>{loja.endereco}{loja.endereco && local && <br />}{local}</span>
                  </div>
                )}
                {desde && (
                  <div style={{ display: "flex", gap: 8, fontSize: 13, color: "#1A1917" }}>
                    <span style={{ color: "#FF6600", display: "flex" }}><Icone nome="calendario" tamanho={18} /></span>
                    Na AutoRegião desde {desde}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
                  {whatsapp && (
                    <a href={`https://wa.me/55${whatsapp}`} target="_blank" rel="noopener noreferrer" className="toque-facil"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: 12, background: "#25D366", borderRadius: 9, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
                      <Icone nome="whatsapp" tamanho={19} /> Falar com a loja
                    </a>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    {telefone && (
                      <a href={`tel:${telefone}`} className="toque-facil"
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 11, border: "1.5px solid #E8E6E1", borderRadius: 9, color: "#1A1917", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                        <Icone nome="telefone" /> Ligar
                      </a>
                    )}
                    {loja.endereco && (
                      <a href="#mapa" className="toque-facil"
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 11, border: "1.5px solid #E8E6E1", borderRadius: 9, color: "#1A1917", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                        <Icone nome="local" /> Ver mapa
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="loja-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>

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
                    <span style={{ color: "#FF6600", display: "flex", paddingTop: 2 }}><Icone nome={icon} tamanho={18} /></span>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
                      <div style={{ fontSize: 13, color: "#1A1917", marginTop: 1 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loja.endereco && <div id="mapa" style={{ scrollMarginTop: 76 }}><MapaLoja endereco={loja.endereco} cidade={loja.cidade} estado={loja.estado} nome={loja.nome} /></div>}

            {whatsapp && (
              <a href={`https://wa.me/55${whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", background: "#25D366", borderRadius: 12, padding: "16px", textAlign: "center", textDecoration: "none" }}>
                <div style={{ marginBottom: 6, color: "#fff" }}><Icone nome="whatsapp" tamanho={28} /></div>
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
