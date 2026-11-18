"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Icone from "@/components/Icone";
import { PortaoRepasse, TopoRepasse, useAcessoRepasse } from "@/components/Repasse";
import { supabase } from "@/lib/supabase";
import { formatarKm, formatarPreco } from "@/lib/formatar";
import { abaixoDaFipe, linkWhatsRepasse, ROTULO_CONDICAO, type RepasseComLoja } from "@/lib/repasse";

// Um carro do Repasse: fotos, preço x FIPE, o que precisa de reparo e contato da loja.
export default function DetalheRepasse() {
  const { id } = useParams<{ id: string }>();
  const acesso = useAcessoRepasse();
  const [r, setR] = useState<RepasseComLoja | null | undefined>(undefined);
  const [foto, setFoto] = useState(0);

  useEffect(() => {
    if (!acesso?.pode) return;
    let vivo = true;
    supabase.from("repasses").select("*, lojas(nome, cidade, estado, whatsapp, telefone, logo_url, verificada)").eq("id", id).maybeSingle()
      .then(({ data }) => { if (vivo) setR((data as RepasseComLoja | null) ?? null); });
    return () => { vivo = false; };
  }, [acesso, id]);

  const abaixo = r ? abaixoDaFipe(r) : null;
  const whats = r ? linkWhatsRepasse(r, r.lojas) : null;
  const tel = (r?.lojas?.telefone || r?.lojas?.whatsapp || "").replace(/\D/g, "");
  const fotos = r?.fotos ?? [];

  const ficha: [string, string | null][] = r ? [
    ["Ano", r.ano], ["KM", r.km ? formatarKm(r.km) : null], ["Câmbio", r.cambio], ["Combustível", r.combustivel], ["Cor", r.cor], ["Cidade", r.cidade],
  ] : [];

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>
      <style>{`
        .rp-det { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 20px; align-items: start; }
        @media (max-width: 860px) { .rp-det { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
      <TopoRepasse voltar="/repasse" rotuloVoltar="Repasse" />

      {!acesso ? (
        <div style={{ padding: "60px 16px", textAlign: "center", color: "#7A7670", fontSize: 14 }}>Carregando...</div>
      ) : !acesso.pode ? (
        <PortaoRepasse acesso={acesso} />
      ) : r === undefined ? (
        <div style={{ padding: "60px 16px", textAlign: "center", color: "#7A7670", fontSize: 14 }}>Carregando...</div>
      ) : r === null ? (
        <div style={{ maxWidth: 520, margin: "48px auto", padding: "0 16px", textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1A1917", marginBottom: 8 }}>Carro não encontrado</h1>
          <p style={{ fontSize: 14, color: "#7A7670", marginBottom: 18 }}>Ele pode já ter sido repassado ou retirado pela loja.</p>
          <Link href="/repasse" style={{ color: "#FF6600", fontWeight: 700, fontSize: 14 }}>Ver os carros no repasse</Link>
        </div>
      ) : (
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "22px 16px 60px" }} className="rp-det">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ position: "relative", aspectRatio: "4 / 3", background: "#EFEDE8" }}>
                {fotos.length ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotos[foto]} alt={r.nome} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#1A1A1A" }} />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#C9C5BD" }}><Icone nome="carro" tamanho={64} traco={1.2} /></div>
                )}
                {fotos.length > 1 && (
                  <>
                    <button aria-label="Foto anterior" onClick={() => setFoto(f => (f - 1 + fotos.length) % fotos.length)} style={setaFoto("left")}>‹</button>
                    <button aria-label="Próxima foto" onClick={() => setFoto(f => (f + 1) % fotos.length)} style={setaFoto("right")}>›</button>
                    <span style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 12, padding: "3px 8px", borderRadius: 6 }}>{foto + 1}/{fotos.length}</span>
                  </>
                )}
              </div>
              {fotos.length > 1 && (
                <div style={{ display: "flex", gap: 6, padding: 8, overflowX: "auto" }}>
                  {fotos.map((f, i) => (
                    <button key={f} onClick={() => setFoto(i)} style={{ flex: "0 0 auto", width: 76, height: 57, padding: 0, border: i === foto ? "2px solid #FF6600" : "2px solid transparent", borderRadius: 6, overflow: "hidden", cursor: "pointer", background: "#EFEDE8" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {r.condicao === "reparo" && r.reparos && (
              <div style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#92400E", marginBottom: 6 }}><Icone nome="ferramenta" /> O que precisa de reparo</div>
                <div style={{ fontSize: 14, color: "#1A1917", lineHeight: 1.6, whiteSpace: "pre-line" }}>{r.reparos}</div>
              </div>
            )}

            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 10 }}>Ficha do carro</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                {ficha.filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}><div style={{ fontSize: 11.5, color: "#A8A49D" }}>{k}</div><div style={{ fontSize: 14, fontWeight: 600, color: "#1A1917" }}>{v}</div></div>
                ))}
              </div>
              {r.descricao && <div style={{ fontSize: 14, color: "#4A4740", lineHeight: 1.6, marginTop: 14, whiteSpace: "pre-line" }}>{r.descricao}</div>}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 76 }}>
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "16px 18px" }}>
              <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 700, marginBottom: 8,
                background: r.condicao === "reparo" ? "#FEF3C7" : "#DCFCE7", color: r.condicao === "reparo" ? "#92400E" : "#166534" }}>
                {ROTULO_CONDICAO[r.condicao]}
              </span>
              {r.status !== "ativo" && <span style={{ marginLeft: 6, padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 700, background: "#1A1A1A", color: "#fff" }}>{r.status === "pausado" ? "Pausado" : "Repassado"}</span>}
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1A1917", lineHeight: 1.3, marginBottom: 10 }}>{r.nome}</h1>
              <div style={{ fontSize: 12, color: "#7A7670" }}>Preço de repasse</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#1A1917" }}>{formatarPreco(r.preco)}</div>
              {r.fipe_valor && (
                <div style={{ marginTop: 10, padding: "10px 12px", background: "#F7F6F3", borderRadius: 8, fontSize: 13, color: "#4A4740", lineHeight: 1.5 }}>
                  FIPE{r.fipe_mes ? ` (${r.fipe_mes})` : ""}: <b>{formatarPreco(r.fipe_valor)}</b>
                  {abaixo
                    ? <div style={{ color: "#15803D", fontWeight: 700 }}><Icone nome="abaixo" /> {formatarPreco(abaixo.valor)} abaixo da FIPE ({abaixo.pct}%)</div>
                    : <div style={{ color: "#7A7670" }}>Preço igual ou acima da FIPE.</div>}
                </div>
              )}
              {r.status === "ativo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                  {whats && (
                    <a href={whats} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", background: "#16A34A", color: "#fff", borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
                      <Icone nome="whatsapp" /> Chamar a loja no WhatsApp
                    </a>
                  )}
                  {tel.length >= 10 && (
                    <a href={`tel:+55${tel.replace(/^55(?=\d{10,11}$)/, "")}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", border: "1.5px solid #E8E6E1", color: "#1A1917", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                      <Icone nome="telefone" /> Ligar
                    </a>
                  )}
                </div>
              )}
            </div>

            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              {r.lojas?.logo_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={r.lojas.logo_url} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", border: "1px solid #E8E6E1" }} />
                : <div style={{ width: 48, height: 48, borderRadius: 10, background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", color: "#A8A49D" }}><Icone nome="loja" tamanho={24} /></div>}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "#1A1917" }}>{r.lojas?.nome} {r.lojas?.verificada && <Icone nome="escudo" cor="#2563EB" />}</div>
                <div style={{ fontSize: 12.5, color: "#7A7670" }}>{[r.lojas?.cidade, r.lojas?.estado].filter(Boolean).join(" - ")}</div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#A8A49D", lineHeight: 1.5, padding: "0 4px" }}>
              O AutoRegião só aproxima as lojas. Confira o carro e a documentação pessoalmente antes de fechar negócio.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function setaFoto(lado: "left" | "right") {
  return { position: "absolute" as const, top: "50%", [lado]: 8, transform: "translateY(-50%)", width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 24, lineHeight: "36px", cursor: "pointer" };
}
