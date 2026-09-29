"use client";
import Image from "next/image";
import Link from "next/link";
import BotoesConta from "@/components/BotoesConta";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { buscarSemelhantes, buscarVeiculo as buscarVeiculoPorId } from "@/lib/dados/veiculos";
import BotaoFavorito from "@/components/BotaoFavorito";
import CartaoVeiculo from "@/components/CartaoVeiculo";
import Rodape from "@/components/Rodape";
import { formatarPreco, formatarKm } from "@/lib/formatar";
import { registrarEvento } from "@/lib/dados/eventos";
import type { VeiculoComLoja } from "@/lib/tipos";
import { EMAIL_CONTATO, URL_SITE } from "@/lib/site";

export default function Veiculo() {
  const { id } = useParams<{ id: string }>();
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [entrada, setEntrada] = useState("");
  const [prazo, setPrazo] = useState("60");
  const [menuAberto, setMenuAberto] = useState(false);
  const [veiculo, setVeiculo] = useState<VeiculoComLoja | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [semelhantes, setSemelhantes] = useState<VeiculoComLoja[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    buscarVeiculoPorId(id).then(({ veiculo, error }) => {
      if (cancelado) return;
      if (!error && veiculo) {
        setVeiculo(veiculo);
        setEntrada(Math.round((veiculo.preco ?? 0) * 0.2).toString());
        registrarEvento(veiculo.id, "visualizacao");
        buscarSemelhantes(veiculo).then(lista => { if (!cancelado) setSemelhantes(lista); });
      }
      setCarregando(false);
    });
    return () => { cancelado = true; };
  }, [id]);

  const fotos = veiculo?.fotos?.length ? veiculo.fotos : ["/sem-foto.png"];

  // Fechar lightbox com ESC e navegar com setas
  useEffect(() => {
    if (!lightbox) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setFotoAtiva(f => Math.min(fotos.length - 1, f + 1));
      if (e.key === "ArrowLeft") setFotoAtiva(f => Math.max(0, f - 1));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, fotos.length]);

  function formatarTelefone(tel: string | null) {
    return tel?.replace(/\D/g, "") || "";
  }

  function abrirWhatsApp(mensagem?: string) {
    if (!veiculo) return;
    const tel = formatarTelefone(veiculo.telefone);
    const msg = encodeURIComponent(mensagem ?? `Olá! Vi o anúncio do ${veiculo.nome} por ${formatarPreco(veiculo.preco)} no AutoRegião e tenho interesse.`);
    registrarEvento(veiculo.id, "whatsapp");
    window.open(`https://wa.me/55${tel}?text=${msg}`, "_blank");
  }

  // Compartilhar: no celular usa o menu nativo (WhatsApp, Instagram...); no computador,
  // oferece WhatsApp Web e copiar link. O link já sai com foto e título (og:tags no servidor).
  const [avisoCompartilhar, setAvisoCompartilhar] = useState("");
  async function compartilhar() {
    if (!veiculo) return;
    const url = `${window.location.origin}/veiculo/${veiculo.id}`;
    const texto = `${veiculo.nome} por ${formatarPreco(veiculo.preco)} no AutoRegião`;
    if (navigator.share) {
      try { await navigator.share({ title: texto, text: texto, url }); } catch { /* cancelado */ }
      return;
    }
    setAvisoCompartilhar("escolher");
  }
  function compartilharWhatsApp() {
    if (!veiculo) return;
    const url = `${window.location.origin}/veiculo/${veiculo.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${veiculo.nome} por ${formatarPreco(veiculo.preco)} no AutoRegião: ${url}`)}`, "_blank");
    setAvisoCompartilhar("");
  }
  async function copiarLink() {
    if (!veiculo) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/veiculo/${veiculo.id}`);
      setAvisoCompartilhar("copiado");
    } catch {
      setAvisoCompartilhar("erro");
    }
  }

  function ligar() {
    if (!veiculo) return;
    registrarEvento(veiculo.id, "ligacao");
    window.open(`tel:${formatarTelefone(veiculo.telefone)}`);
  }

  // Endereço da loja no Google Maps (só quando a loja cadastrou o endereço).
  const linkMapa = veiculo?.lojas?.endereco
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([veiculo.lojas.endereco, veiculo.lojas.cidade, veiculo.lojas.estado].filter(Boolean).join(", "))}`
    : null;
  const anuncianteDesde = veiculo?.lojas?.criado_em
    ? new Date(veiculo.lojas.criado_em).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : null;
  // Denúncia vai por e-mail para o contato@ (chega no Gmail do dono), já com o link do anúncio.
  const linkDenuncia = veiculo
    ? `mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent(`Denúncia de anúncio: ${veiculo.nome}`)}&body=${encodeURIComponent(`Anúncio: ${typeof window !== "undefined" ? window.location.origin : URL_SITE}/veiculo/${veiculo.id}

Motivo da denúncia:
`)}`
    : "";
  const caixaSeguranca = veiculo && (
    <div style={{ background: "rgba(22,163,74,0.08)", border: "1.5px solid rgba(22,163,74,0.15)", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#16A34A", marginBottom: 10 }}>🛡️ Compre com segurança</div>
      {["Veja o veículo pessoalmente antes de pagar", "Confira documentos e débitos no Detran", "Desconfie de sinal ou depósito antecipado", "Solicite laudo cautelar", "A AutoRegião nunca pede código, senha ou pagamento"].map(item => (
        <div key={item} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#1A1917", marginBottom: 6 }}>
          <span style={{ color: "#16A34A" }}>✔</span> {item}
        </div>
      ))}
      <a href={linkDenuncia} style={{ display: "inline-block", marginTop: 6, fontSize: 12, color: "#7A7670", textDecoration: "underline" }}>🚩 Denunciar este anúncio</a>
    </div>
  );

  const parcela = entrada && prazo
    ? Math.round(((veiculo?.preco || 0) - Number(entrada)) * (0.0149 / (1 - Math.pow(1.0149, -Number(prazo)))))
    : 0;

  if (carregando) return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚗</div>
        <div style={{ fontSize: 14, color: "#7A7670" }}>Carregando anúncio...</div>
      </div>
    </main>
  );

  if (!veiculo) return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1917", marginBottom: 8 }}>Anúncio não encontrado</div>
        <Link href="/veiculos" style={{ color: "#E85D26", fontSize: 14 }}>← Ver outros veículos</Link>
      </div>
    </main>
  );

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile-btn { display: none !important; }
        .veiculo-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
        .contato-fixo-espaco { display: none; }
        .so-celular { display: none; }
        .semelhantes-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        @media (max-width: 900px) { .semelhantes-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .semelhantes-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
        .contato-sticky { position: sticky; top: 76px; }
        .contato-fixo-mobile { display: none !important; }
        .thumbnails-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
        .caracteristicas-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .breadcrumb { display: flex !important; }
        .foto-principal:hover { cursor: zoom-in; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .veiculo-grid { grid-template-columns: 1fr !important; }
          .contato-sticky { display: none !important; }
          .contato-fixo-mobile { display: flex !important; }
          .contato-fixo-espaco { display: block !important; height: 76px; }
          .so-celular { display: flex !important; }
          .thumbnails-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .caracteristicas-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .breadcrumb { display: none !important; }
        }
      `}</style>

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {/* Botão fechar */}
          <button
            onClick={() => setLightbox(false)}
            style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, color: "#fff", fontSize: 20, cursor: "pointer", zIndex: 10 }}
          >✕</button>

          {/* Contador */}
          <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            {fotoAtiva + 1} / {fotos.length}
          </div>

          {/* Seta esquerda */}
          {fotoAtiva > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setFotoAtiva(f => f - 1); }}
              style={{ position: "absolute", left: 16, width: 44, height: 44, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, color: "#fff", fontSize: 24, cursor: "pointer" }}
            >‹</button>
          )}

          {/* Foto */}
          <img
            src={fotos[fotoAtiva]}
            alt="Foto ampliada"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 8 }}
          />

          {/* Seta direita */}
          {fotoAtiva < fotos.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setFotoAtiva(f => f + 1); }}
              style={{ position: "absolute", right: 16, width: 44, height: 44, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, color: "#fff", fontSize: 24, cursor: "pointer" }}
            >›</button>
          )}

          {/* Thumbnails no lightbox */}
          {fotos.length > 1 && (
            <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
              {fotos.map((foto, i) => (
                <div
                  key={i}
                  onClick={e => { e.stopPropagation(); setFotoAtiva(i); }}
                  style={{ width: 48, height: 36, borderRadius: 5, overflow: "hidden", border: fotoAtiva === i ? "2px solid #E85D26" : "2px solid transparent", cursor: "pointer", opacity: fotoAtiva === i ? 1 : 0.5 }}
                >
                  <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E8E6E1" }}>
        <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo.png" alt="AutoRegião" width={32} height={32} style={{ objectFit: "contain" }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: "#1A1917" }}>
              <span style={{ color: "#E85D26" }}>Auto</span>Região
            </span>
          </Link>
          <div className="breadcrumb" style={{ alignItems: "center", gap: 6, fontSize: 13, color: "#7A7670" }}>
            <Link href="/" style={{ color: "#7A7670", textDecoration: "none" }}>Início</Link>
            <span>›</span>
            <Link href="/veiculos" style={{ color: "#7A7670", textDecoration: "none" }}>{veiculo.marca}</Link>
            <span>›</span>
            <span style={{ color: "#1A1917", fontWeight: 500 }}>{veiculo.nome}</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }} className="nav-desktop">
            <Link href="/favoritos" style={{ textDecoration: "none", color: "#7A7670", fontSize: 13.5, fontWeight: 500, marginRight: 8 }}>★ Favoritos</Link>
            <BotoesConta />
          </div>
          <button className="nav-mobile-btn" onClick={() => setMenuAberto(!menuAberto)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, flexDirection: "column", gap: 5 }}>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, transition: "all 0.2s", transform: menuAberto ? "rotate(45deg) translate(5px, 5px)" : "none" }}></span>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, opacity: menuAberto ? 0 : 1 }}></span>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, transition: "all 0.2s", transform: menuAberto ? "rotate(-45deg) translate(5px, -5px)" : "none" }}></span>
          </button>
        </div>
        {menuAberto && (
          <div style={{ borderTop: "1px solid #E8E6E1", background: "#fff", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
            {[["Buscar veículos", "/veiculos"], ["★ Favoritos", "/favoritos"], ["Anunciar", "/anunciar"]].map(([item, href]) => (
              <Link key={item} href={href} style={{ textDecoration: "none", color: "#1A1917", fontSize: 15, fontWeight: 500 }}>{item}</Link>
            ))}
            <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #E8E6E1" }}>
              <BotoesConta celular />
            </div>
          </div>
        )}
      </nav>

      {/* CONTEÚDO */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "76px 16px 100px" }}>
        <div className="veiculo-grid">

          {/* COLUNA ESQUERDA */}
          <div>
            {/* GALERIA */}
            <div style={{ marginBottom: 20 }}>
              <div
                className="foto-principal"
                onClick={() => setLightbox(true)}
                style={{ position: "relative", height: 300, borderRadius: 12, overflow: "hidden", marginBottom: 10, border: "1.5px solid #E8E6E1", background: "#F7F6F3" }}
              >
                {fotos[fotoAtiva] === "/sem-foto.png" ? (
                  <Image src="/sem-foto.png" alt="Foto do veículo" fill style={{ objectFit: "cover" }} sizes="100vw" />
                ) : (
                  <img src={fotos[fotoAtiva]} alt="Foto do veículo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
                {veiculo.destaque && <span style={{ position: "absolute", top: 12, left: 12, background: "#E85D26", color: "#fff", fontSize: 11, fontWeight: 500, padding: "4px 12px", borderRadius: 20 }}>⭐ Em Destaque</span>}
                <span style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, padding: "4px 10px", borderRadius: 6 }}>📷 {fotoAtiva + 1} / {fotos.length}</span>
                {/* Ícone de zoom */}
                <BotaoFavorito id={veiculo.id} />
                {fotos.length > 1 && <>
                  <button onClick={e => { e.stopPropagation(); setFotoAtiva(Math.max(0, fotoAtiva - 1)); }} style={{ position: "absolute", top: "50%", left: 10, transform: "translateY(-50%)", width: 36, height: 36, background: "rgba(255,255,255,0.85)", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}>‹</button>
                  <button onClick={e => { e.stopPropagation(); setFotoAtiva(Math.min(fotos.length - 1, fotoAtiva + 1)); }} style={{ position: "absolute", top: "50%", right: 10, transform: "translateY(-50%)", width: 36, height: 36, background: "rgba(255,255,255,0.85)", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}>›</button>
                </>}
              </div>
              {fotos.length > 1 && (
                <div className="thumbnails-grid">
                  {fotos.slice(0, 6).map((foto, i) => (
                    <div key={i} onClick={() => setFotoAtiva(i)} style={{ position: "relative", height: 56, borderRadius: 7, overflow: "hidden", border: fotoAtiva === i ? "2px solid #E85D26" : "1.5px solid #E8E6E1", cursor: "pointer", background: "#F7F6F3" }}>
                      <img src={foto} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TÍTULO E PREÇO */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                {veiculo.destaque && <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 4, background: "rgba(232,93,38,0.08)", color: "#E85D26" }}>⭐ Destaque</span>}
                <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 4, background: "#F7F6F3", color: "#7A7670", border: "1px solid #E8E6E1" }}>📍 {veiculo.cidade}</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 6 }}>{veiculo.nome}</h1>
              <p style={{ fontSize: 14, color: "#7A7670", marginBottom: 14 }}>
                {[veiculo.ano, formatarKm(veiculo.km), veiculo.combustivel, veiculo.cambio, veiculo.cor].filter(Boolean).join(" · ")}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: 16, background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#1A1917", lineHeight: 1 }}>{formatarPreco(veiculo.preco)}</div>
                  {veiculo.aceita_troca && <div style={{ fontSize: 12, color: "#16A34A", marginTop: 6, fontWeight: 500 }}>✅ Aceita troca</div>}
                </div>
              </div>
            </div>

            {/* CARACTERÍSTICAS */}
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Características</div>
              <div className="caracteristicas-grid">
                {[
                  ["📅", "Ano", veiculo.ano],
                  ["📍", "Quilometragem", formatarKm(veiculo.km)],
                  ["⛽", "Combustível", veiculo.combustivel],
                  ["⚙️", "Câmbio", veiculo.cambio],
                  ["🎨", "Cor", veiculo.cor],
                  ["🚪", "Portas", veiculo.portas],
                ].filter(([,, v]) => v).map(([icon, label, value], i) => (
                  <div key={label as string} style={{ padding: "12px 14px", borderRight: (i + 1) % 3 !== 0 ? "1px solid #E8E6E1" : "none", borderBottom: i < 3 ? "1px solid #E8E6E1" : "none" }}>
                    <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 10, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>{label as string}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1917" }}>{value as string}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DESCRIÇÃO */}
            {veiculo.descricao && (
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Descrição</div>
                <div style={{ padding: "16px 18px", fontSize: 14, lineHeight: 1.7, color: "#1A1917", whiteSpace: "pre-wrap" }}>{veiculo.descricao}</div>
              </div>
            )}

            {/* OPCIONAIS */}
            {veiculo.opcionais && veiculo.opcionais.length > 0 && (
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Opcionais</div>
                <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {veiculo.opcionais.map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1A1917" }}>
                      <span style={{ fontSize: 13, color: "#16A34A" }}>✅</span> {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SIMULADOR */}
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>💰 Simular financiamento</div>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 500, color: "#7A7670", textTransform: "uppercase", marginBottom: 5 }}>Valor de entrada</div>
                    <input type="number" value={entrada} onChange={e => setEntrada(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 500, color: "#7A7670", textTransform: "uppercase", marginBottom: 5 }}>Prazo</div>
                    <select value={prazo} onChange={e => setPrazo(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }}>
                      <option value="60">60 meses</option>
                      <option value="48">48 meses</option>
                      <option value="36">36 meses</option>
                      <option value="24">24 meses</option>
                    </select>
                  </div>
                </div>
                <div style={{ background: "#F7F6F3", border: "1.5px solid #E8E6E1", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#7A7670" }}>Parcela estimada</div>
                    <div style={{ fontSize: 10.5, color: "#7A7670", marginTop: 2 }}>Taxa aprox. 1,49% a.m. · {prazo}x</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#E85D26" }}>
                    {parcela > 0 ? `R$ ${parcela.toLocaleString("pt-BR")}` : "---"}
                  </div>
                </div>
                <button onClick={() => abrirWhatsApp(`Olá! Vi o anúncio do ${veiculo.nome} por ${formatarPreco(veiculo.preco)} no AutoRegião e gostaria de uma simulação de financiamento.`)} style={{ width: "100%", marginTop: 12, padding: 10, background: "#1A1917", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Solicitar financiamento →</button>
              </div>
            </div>
            {/* No celular a coluna da direita some: mapa e segurança aparecem aqui. */}
            <div className="so-celular" style={{ flexDirection: "column", gap: 12, marginTop: 16 }}>
              {linkMapa && (
                <a href={linkMapa} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", padding: 11, background: "#fff", color: "#1A1917", border: "1.5px solid #E8E6E1", borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                  🗺️ Ver endereço da loja no mapa
                </a>
              )}
              {caixaSeguranca}
            </div>
          </div>

          {/* COLUNA DIREITA — desktop */}
          <div className="contato-sticky" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: "#1A1917", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, background: "#E85D26", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏪</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{veiculo.lojas?.nome || veiculo.nome_contato}</div>
                  <div style={{ fontSize: 11.5, color: "#7A7670", marginTop: 2 }}>📍 {veiculo.lojas?.cidade || veiculo.cidade}</div>
                  {anuncianteDesde && <div style={{ fontSize: 11.5, color: "#A8A49D", marginTop: 2 }}>✔ Anunciante desde {anuncianteDesde}</div>}
                  {veiculo.loja_id && (
                    <Link href={`/loja/${veiculo.loja_id}`} style={{ display: "inline-block", fontSize: 11.5, color: "#E85D26", fontWeight: 600, textDecoration: "none", marginTop: 4 }}>Ver loja e outros anúncios →</Link>
                  )}
                </div>
              </div>
              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => abrirWhatsApp()} style={{ width: "100%", padding: 13, background: "#25D366", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  📱 Chamar no WhatsApp
                </button>
                {linkMapa && (
                  <a href={linkMapa} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", width: "100%", boxSizing: "border-box", padding: 11, background: "#fff", color: "#1A1917", border: "1.5px solid #E8E6E1", borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                    🗺️ Ver endereço no mapa
                  </a>
                )}
                <button onClick={ligar} style={{ width: "100%", padding: 11, background: "#F7F6F3", color: "#1A1917", border: "1.5px solid #E8E6E1", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  📞 Ligar: {veiculo.telefone}
                </button>
              </div>
            </div>
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <BotaoFavorito id={veiculo.id} tipo="grande" />
              {avisoCompartilhar === "" && (
                <button onClick={compartilhar} style={{ width: "100%", padding: "10px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#F7F6F3", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#1A1917" }}>
                  📤 Compartilhar anúncio
                </button>
              )}
              {avisoCompartilhar !== "" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={compartilharWhatsApp} style={{ flex: 1, padding: "10px 6px", border: "none", borderRadius: 8, background: "#25D366", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>💬 Enviar no WhatsApp</button>
                    <button onClick={copiarLink} style={{ flex: 1, padding: "10px 6px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#F7F6F3", color: "#1A1917", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🔗 Copiar link</button>
                  </div>
                  {avisoCompartilhar === "copiado" && <div style={{ fontSize: 12, color: "#16A34A", textAlign: "center" }}>✅ Link copiado! É só colar onde quiser.</div>}
                  {avisoCompartilhar === "erro" && <div style={{ fontSize: 12, color: "#991B1B", textAlign: "center" }}>Não deu para copiar. Copie o endereço lá em cima no navegador.</div>}
                </div>
              )}
            </div>
            {caixaSeguranca}
          </div>
        </div>

        {/* VEÍCULOS PARECIDOS */}
        {semelhantes.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1A1917" }}>Veículos parecidos</h2>
              {veiculo.marca && (
                <Link href={`/veiculos?marca=${encodeURIComponent(veiculo.marca)}`} style={{ fontSize: 13, color: "#E85D26", fontWeight: 600, textDecoration: "none" }}>Ver todos {veiculo.marca} →</Link>
              )}
            </div>
            <div className="semelhantes-grid">
              {semelhantes.map(car => <CartaoVeiculo key={car.id} car={car} />)}
            </div>
          </section>
        )}
      </div>

      {/* BOTÕES FIXOS MOBILE */}
      <div className="contato-fixo-mobile" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #E8E6E1", padding: "12px 16px", gap: 10, zIndex: 50 }}>
        <button onClick={() => abrirWhatsApp()} style={{ flex: 1, padding: "13px", background: "#25D366", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📱 WhatsApp</button>
        <button onClick={ligar} style={{ flex: 1, padding: "13px", background: "#E85D26", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📞 Ligar</button>
        <button onClick={() => (typeof navigator.share === "function" ? compartilhar() : compartilharWhatsApp())} aria-label="Compartilhar anúncio"
          style={{ width: 50, padding: "13px 0", background: "#F7F6F3", color: "#1A1917", border: "1.5px solid #E8E6E1", borderRadius: 9, fontSize: 16, cursor: "pointer" }}>📤</button>
      </div>

      <Rodape />
      <div className="contato-fixo-espaco" />
    </main>
  );
}