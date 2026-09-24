import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { criarClienteAnonimo } from "@/lib/supabase-servidor";
import { formatarPreco, formatarKm } from "@/lib/formatar";
import type { Loja, Veiculo } from "@/lib/tipos";

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
    .select("id, nome, ano, km, preco, fotos, destaque")
    .eq("loja_id", id)
    .eq("ativo", true)
    .order("criado_em", { ascending: false });
  const veiculos = (data ?? []) as Pick<Veiculo, "id" | "nome" | "ano" | "km" | "preco" | "fotos" | "destaque">[];

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
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh" }}>

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
          <Image src="/logo.png" alt="AutoRegião" width={36} height={36} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 800, color: "#1A1917" }}>
            <span style={{ color: "#E85D26" }}>Auto</span>Região
          </span>
        </Link>
        <Link href="/veiculos" style={{ fontSize: 13, color: "#7A7670", textDecoration: "none" }}>← Ver todos os veículos</Link>
      </nav>

      <div style={{ paddingTop: 60 }}>

        {/* HEADER DA LOJA */}
        <div style={{ background: "#1A1917", padding: "32px 16px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
            <div style={{ width: 80, height: 80, borderRadius: 16, background: "#E85D26", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>
              🏪
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{loja.nome}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>
                {local && <>📍 {local}</>}{local && desde && " · "}{desde && <>Na plataforma desde {desde}</>}
              </div>
              <div>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>🚗 {veiculos.length}</span>
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
            <div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 800, color: "#1A1917", marginBottom: 14 }}>
              Veículos à venda <span style={{ fontSize: 13, color: "#7A7670", fontFamily: "DM Sans, sans-serif", fontWeight: 400 }}>({veiculos.length} {veiculos.length === 1 ? "anúncio" : "anúncios"})</span>
            </div>
            {veiculos.length === 0 ? (
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 32, textAlign: "center", fontSize: 13, color: "#7A7670" }}>
                Esta loja ainda não tem veículos anunciados.
              </div>
            ) : (
              <div className="loja-carros">
                {veiculos.map(car => (
                  <Link key={car.id} href={`/veiculo/${car.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: car.destaque ? "1.5px solid #E85D26" : "1.5px solid #E8E6E1", position: "relative" }}>
                      {car.destaque && <span style={{ position: "absolute", top: 8, left: 8, background: "#E85D26", color: "#fff", fontSize: 10, padding: "2px 7px", borderRadius: 20, zIndex: 2 }}>⭐ Destaque</span>}
                      <div style={{ position: "relative", height: 150, background: "#F7F6F3" }}>
                        {car.fotos && car.fotos.length > 0
                          ? <img src={car.fotos[0]} alt={car.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <Image src="/sem-foto.png" alt={car.nome} fill style={{ objectFit: "cover" }} sizes="50vw" />
                        }
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917", marginBottom: 3 }}>{car.nome}</div>
                        <div style={{ fontSize: 11, color: "#7A7670", marginBottom: 6 }}>{[car.ano, formatarKm(car.km)].filter(Boolean).join(" · ")}</div>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 800, color: "#1A1917" }}>{formatarPreco(car.preco)}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {loja.descricao && (
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "16px" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 10 }}>Sobre a loja</div>
                <p style={{ fontSize: 13, color: "#7A7670", lineHeight: 1.6, margin: 0 }}>{loja.descricao}</p>
              </div>
            )}

            {informacoes.length > 0 && (
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "16px" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 12 }}>Informações</div>
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

            {whatsapp && (
              <a href={`https://wa.me/55${whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", background: "#25D366", borderRadius: 12, padding: "16px", textAlign: "center", textDecoration: "none" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>💬</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Falar com a loja</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>Responde pelo WhatsApp</div>
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
