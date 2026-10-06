"use client";
import Image from "next/image";
import { compartilharNativo } from "@/lib/nativo";
import Link from "next/link";
import Logo from "@/components/Logo";
import BotoesConta from "@/components/BotoesConta";
import { useState, useEffect, useRef } from "react";
import { buscarSemelhantes } from "@/lib/dados/veiculos";
import BotaoFavorito from "@/components/BotaoFavorito";
import CartaoVeiculo, { abaixoDaFipe } from "@/components/CartaoVeiculo";
import Rodape from "@/components/Rodape";
import MapaLoja from "@/components/MapaLoja";
import LogoLoja from "@/components/LogoLoja";
import { formatarPreco, formatarKm } from "@/lib/formatar";
import { registrarEvento } from "@/lib/dados/eventos";
import type { VeiculoComLoja } from "@/lib/tipos";
import { EMAIL_CONTATO, URL_SITE } from "@/lib/site";
import Icone, { type NomeIcone } from "@/components/Icone";
import { caminhoDoVeiculo, linkMesmoModelo } from "@/lib/caminhoVeiculo";

// O anúncio vem pronto do servidor (page.tsx); aqui ficam as partes interativas.
export default function Veiculo({ inicial }: { inicial: VeiculoComLoja }) {
  const veiculo = inicial;
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [entrada, setEntrada] = useState(() => Math.round((inicial.preco ?? 0) * 0.2).toString());
  const [prazo, setPrazo] = useState("60");
  const [menuAberto, setMenuAberto] = useState(false);
  const [semelhantes, setSemelhantes] = useState<VeiculoComLoja[]>([]);

  useEffect(() => {
    let cancelado = false;
    registrarEvento(inicial.id, "visualizacao");
    buscarSemelhantes(inicial).then(lista => { if (!cancelado) setSemelhantes(lista); });
    return () => { cancelado = true; };
  }, [inicial]);

  const fotos = veiculo?.fotos?.length ? veiculo.fotos : ["/sem-foto.png"];

  // Galeria em faixa larga (várias fotos lado a lado no computador; uma por vez no celular, deslizando).
  const faixa = useRef<HTMLDivElement>(null);
  const [fotoNaFaixa, setFotoNaFaixa] = useState(0);
  function aoRolarFaixa() {
    const el = faixa.current;
    if (!el || !el.children.length) return;
    const largura = el.scrollWidth / el.children.length; // foto + espaço entre elas
    setFotoNaFaixa(Math.min(fotos.length - 1, Math.round(el.scrollLeft / largura)));
  }
  function moverFaixa(direcao: 1 | -1) {
    const el = faixa.current;
    if (!el || !el.children.length) return;
    const largura = el.scrollWidth / el.children.length;
    el.scrollBy({ left: direcao * largura, behavior: "smooth" });
  }
  const caminho = caminhoDoVeiculo(veiculo);
  const mesmoModelo = linkMesmoModelo(veiculo);

  // Celular: arrastar o dedo para o lado troca a foto (na foto principal e na ampliada).
  const toque = useRef<{ x: number; y: number } | null>(null);
  const arrastou = useRef(false); // o "clique" que vem logo depois de um arrasto é ignorado
  function aoTocar(e: React.TouchEvent) {
    toque.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    arrastou.current = false;
  }
  function aoSoltar(e: React.TouchEvent) {
    if (!toque.current || fotos.length < 2) return;
    const dx = e.changedTouches[0].clientX - toque.current.x;
    const dy = e.changedTouches[0].clientY - toque.current.y;
    toque.current = null;
    // Só conta como troca de foto se foi um arrasto mais para o lado do que para cima/baixo.
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    arrastou.current = true;
    setFotoAtiva(f => (dx < 0 ? Math.min(fotos.length - 1, f + 1) : Math.max(0, f - 1)));
  }
  function ignorarSeArrastou() {
    if (!arrastou.current) return false;
    arrastou.current = false;
    return true;
  }

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
    const tel = formatarTelefone(telefoneContato);
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
    if (await compartilharNativo({ title: texto, text: texto, url })) return; // app de iPhone
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
    window.open(`tel:${formatarTelefone(telefoneContato)}`);
  }

  // Anúncio sem telefone próprio usa o WhatsApp/telefone do Perfil da Loja.
  const telefoneContato = veiculo?.telefone || veiculo?.lojas?.whatsapp || veiculo?.lojas?.telefone || null;

  // Endereço da loja no Google Maps (só quando a loja cadastrou o endereço).
  const mapaLoja = veiculo?.lojas?.endereco
    ? <MapaLoja endereco={veiculo.lojas.endereco} cidade={veiculo.lojas.cidade} estado={veiculo.lojas.estado} nome={veiculo.lojas.nome} />
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
      <div style={{ fontSize: 13, fontWeight: 700, color: "#16A34A", marginBottom: 10 }}><Icone nome="escudo" /> Compre com segurança</div>
      {["Veja o veículo pessoalmente antes de pagar", "Confira documentos e débitos no Detran", "Desconfie de sinal ou depósito antecipado", "Solicite laudo cautelar", "A AutoRegião nunca pede código, senha ou pagamento"].map(item => (
        <div key={item} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#1A1917", marginBottom: 6 }}>
          <span style={{ color: "#16A34A", display: "flex" }}><Icone nome="check" tamanho={14} traco={2.2} /></span> {item}
        </div>
      ))}
      <a href={linkDenuncia} className="toque-facil" style={{ display: "inline-block", marginTop: 6, fontSize: 12, color: "#7A7670", textDecoration: "underline" }}><Icone nome="bandeira" /> Denunciar este anúncio</a>
    </div>
  );

  const parcela = entrada && prazo
    ? Math.round(((veiculo?.preco || 0) - Number(entrada)) * (0.0149 / (1 - Math.pow(1.0149, -Number(prazo)))))
    : 0;

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
        .galeria-faixa { display: flex; gap: 8px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; background: #1A1A1A; }
        .galeria-faixa::-webkit-scrollbar { display: none; }
        .galeria-item { flex: 0 0 auto; height: 420px; aspect-ratio: 4 / 3; scroll-snap-align: start; position: relative; cursor: zoom-in; background: #2A2A2A; }
        .galeria-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .caminho-anuncio { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; font-size: 12.5px; color: #7A7670; margin-bottom: 12px; }
        .caminho-anuncio a { color: #7A7670; text-decoration: none; }
        .caminho-anuncio a:hover { color: #FF6600; }
        .caracteristicas-grid { display: grid; grid-template-columns: repeat(3, 1fr); margin: 0 -1px -1px 0; }
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
          .galeria-item { width: 100vw; height: 75vw; aspect-ratio: auto; }
          .galeria-faixa { gap: 0; }
          .caminho-anuncio { flex-wrap: nowrap; overflow-x: auto; white-space: nowrap; scrollbar-width: none; }
          .caracteristicas-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .breadcrumb { display: none !important; }
        }
      `}</style>

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          onClick={() => { if (!ignorarSeArrastou()) setLightbox(false); }}
          onTouchStart={aoTocar}
          onTouchEnd={aoSoltar}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", touchAction: "pan-y" }}
        >
          {/* Botão fechar */}
          <button
            onClick={() => setLightbox(false)}
            style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, color: "#fff", fontSize: 20, cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
          ><Icone nome="fechar" tamanho={22} /></button>

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
                  style={{ width: 48, height: 36, borderRadius: 5, overflow: "hidden", border: fotoAtiva === i ? "2px solid #FF6600" : "2px solid transparent", cursor: "pointer", opacity: fotoAtiva === i ? 1 : 0.5 }}
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
            <Logo />
          </Link>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }} className="nav-desktop">
            <Link href="/favoritos" style={{ textDecoration: "none", color: "#7A7670", fontSize: 13.5, fontWeight: 500, marginRight: 8 }}><Icone nome="estrela" /> Favoritos</Link>
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
            {[["Buscar veículos", "/veiculos"], ["Favoritos", "/favoritos"], ["Anunciar", "/anunciar"]].map(([item, href]) => (
              <Link key={item} href={href} style={{ textDecoration: "none", color: "#1A1917", fontSize: 15, fontWeight: 500 }}>{item === "Favoritos" && <Icone nome="estrela" style={{ marginRight: 4 }} />}{item}</Link>
            ))}
            <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #E8E6E1" }}>
              <BotoesConta celular />
            </div>
          </div>
        )}
      </nav>

      {/* GALERIA EM FAIXA LARGA */}
      <div style={{ position: "relative", marginTop: 60 }}>
        <div ref={faixa} className="galeria-faixa" onScroll={aoRolarFaixa}>
          {fotos.map((foto, i) => (
            <div key={i} className="galeria-item" onClick={() => { setFotoAtiva(i); setLightbox(true); }}>
              {foto === "/sem-foto.png"
                ? <Image src="/sem-foto.png" alt="Foto do veículo" fill style={{ objectFit: "cover" }} sizes="100vw" />
                // eslint-disable-next-line @next/next/no-img-element
                : <img src={foto} alt={`${veiculo.nome} — foto ${i + 1}`} loading={i < 3 ? "eager" : "lazy"} />}
            </div>
          ))}
        </div>
        {veiculo.destaque && <span style={{ position: "absolute", top: 12, left: 12, background: "#FF6600", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4, pointerEvents: "none" }}><Icone nome="estrelaCheia" tamanho={12} /> Em Destaque</span>}
        <span style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 12, padding: "5px 10px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4, pointerEvents: "none" }}><Icone nome="camera" tamanho={14} /> {fotoNaFaixa + 1} / {fotos.length}</span>
        <BotaoFavorito id={veiculo.id} />
        {fotos.length > 1 && <>
          <button onClick={() => moverFaixa(-1)} aria-label="Foto anterior" style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", width: 42, height: 42, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", fontSize: 22, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>‹</button>
          <button onClick={() => moverFaixa(1)} aria-label="Próxima foto" style={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", width: 42, height: 42, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", fontSize: 22, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>›</button>
        </>}
      </div>

      {/* CONTEÚDO */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 16px 100px" }}>
        <div className="veiculo-grid">

          {/* COLUNA ESQUERDA */}
          <div>
            {/* CAMINHO CLICÁVEL */}
            <nav className="caminho-anuncio" aria-label="Você está em">
              {caminho.map((c, k) => (
                <span key={c.href} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {k > 0 && <span aria-hidden="true">›</span>}
                  <Link href={c.href}>{c.nome}</Link>
                </span>
              ))}
            </nav>

            {/* TÍTULO E PREÇO */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                {veiculo.destaque && <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 4, background: "rgba(255,102,0,0.08)", color: "#FF6600", display: "inline-flex", alignItems: "center", gap: 3 }}><Icone nome="estrelaCheia" tamanho={12} /> Destaque</span>}
                <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 4, background: "#F7F6F3", color: "#7A7670", border: "1px solid #E8E6E1", display: "inline-flex", alignItems: "center", gap: 3 }}><Icone nome="local" tamanho={12} /> {veiculo.cidade}</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 6 }}>{veiculo.nome}</h1>
              <p style={{ fontSize: 14, color: "#7A7670", marginBottom: 14 }}>
                {[veiculo.ano, formatarKm(veiculo.km), veiculo.carroceria, veiculo.combustivel, veiculo.cambio, veiculo.cor].filter(Boolean).join(" · ")}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: 16, background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#1A1917", lineHeight: 1 }}>{formatarPreco(veiculo.preco)}</div>
                  {abaixoDaFipe(veiculo) && (
                    <div style={{ display: "inline-block", fontSize: 12.5, fontWeight: 700, color: "#15803D", background: "#DCFCE7", padding: "4px 10px", borderRadius: 20, marginTop: 8 }}>
                      <Icone nome="abaixo" /> {formatarPreco(veiculo.fipe_valor! - veiculo.preco!)} abaixo da FIPE
                      {veiculo.fipe_mes && <span style={{ fontWeight: 500, color: "#166534" }}> · ref. {veiculo.fipe_mes}</span>}
                    </div>
                  )}
                  {veiculo.aceita_troca && <div style={{ fontSize: 12, color: "#16A34A", marginTop: 6, fontWeight: 500 }}><Icone nome="ok" /> Aceita troca</div>}
                </div>
                {mesmoModelo && (
                  <Link href={mesmoModelo} style={{ fontSize: 12.5, color: "#FF6600", fontWeight: 600, textDecoration: "none" }}>
                    Ver todas as opções do mesmo modelo →
                  </Link>
                )}
              </div>
            </div>

            {/* CARACTERÍSTICAS */}
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Características</div>
              <div className="caracteristicas-grid">
                {[
                  ["carro", "Carroceria", veiculo.carroceria],
                  ["calendario", "Ano", veiculo.ano],
                  ["km", "Quilometragem", formatarKm(veiculo.km)],
                  ["combustivel", "Combustível", veiculo.combustivel],
                  ["cambio", "Câmbio", veiculo.cambio],
                  ["cor", "Cor", veiculo.cor],
                  ["porta", "Portas", veiculo.portas],
                ].filter(([,, v]) => v).map(([icon, label, value]) => (
                  <div key={label as string} style={{ padding: "12px 14px", boxShadow: "inset -1px -1px 0 #E8E6E1" }}>
                    <div style={{ marginBottom: 4, color: "#FF6600" }}><Icone nome={icon as NomeIcone} tamanho={20} /></div>
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
                      <span style={{ color: "#16A34A", display: "flex" }}><Icone nome="check" tamanho={15} traco={2.2} /></span> {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SIMULADOR */}
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", fontSize: 14, fontWeight: 700, color: "#1A1917" }}><Icone nome="real" cor="#FF6600" /> Simular financiamento</div>
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
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#FF6600" }}>
                    {parcela > 0 ? `R$ ${parcela.toLocaleString("pt-BR")}` : "---"}
                  </div>
                </div>
                <button onClick={() => abrirWhatsApp(`Olá! Vi o anúncio do ${veiculo.nome} por ${formatarPreco(veiculo.preco)} no AutoRegião e gostaria de uma simulação de financiamento.`)} style={{ width: "100%", marginTop: 12, padding: 10, background: "#1A1917", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Solicitar financiamento →</button>
              </div>
            </div>
            {/* No celular a coluna da direita some: mapa e segurança aparecem aqui. */}
            <div className="so-celular" style={{ flexDirection: "column", gap: 12, marginTop: 16 }}>
              {veiculo.loja_id && veiculo.lojas && (
                <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <LogoLoja url={veiculo.lojas.logo_url} tamanho={44} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917" }}>{veiculo.lojas.nome}</div>
                      <div style={{ fontSize: 12, color: "#7A7670", marginTop: 2 }}><Icone nome="local" /> {veiculo.lojas.cidade || veiculo.cidade}</div>
                    </div>
                  </div>
                  <Link href={`/loja/${veiculo.loja_id}`} className="toque-facil" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, background: "#FFF5F0", color: "#FF6600", border: "1.5px solid #FF6600", borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                    <Icone nome="loja" /> Ver revenda <span style={{ fontWeight: 500, color: "#C2570F" }}>· todos os veículos</span>
                  </Link>
                </div>
              )}
              {mapaLoja}
              {caixaSeguranca}
            </div>
          </div>

          {/* COLUNA DIREITA — desktop */}
          <div className="contato-sticky" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "16px 18px", borderBottom: "1px solid #E8E6E1" }}>
                <div style={{ fontSize: 11, color: "#7A7670", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Preço</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#FF6600", lineHeight: 1.05 }}>{formatarPreco(veiculo.preco)}</div>
                {abaixoDaFipe(veiculo) && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#15803D", background: "#DCFCE7", padding: "3px 9px", borderRadius: 20, marginTop: 8 }}>
                    <Icone nome="abaixo" /> {formatarPreco(veiculo.fipe_valor! - veiculo.preco!)} abaixo da FIPE
                  </div>
                )}
                <div style={{ fontSize: 12.5, color: "#7A7670", marginTop: 8 }}>
                  {[veiculo.ano, formatarKm(veiculo.km), veiculo.cambio].filter(Boolean).join(" · ")}
                  {veiculo.aceita_troca && <span style={{ color: "#16A34A", fontWeight: 600 }}> · Aceita troca</span>}
                </div>
              </div>
              <div style={{ background: "#1A1917", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <LogoLoja url={veiculo.lojas?.logo_url} tamanho={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{veiculo.lojas?.nome || veiculo.nome_contato}</div>
                  <div style={{ fontSize: 11.5, color: "#7A7670", marginTop: 2 }}><Icone nome="local" /> {veiculo.lojas?.cidade || veiculo.cidade}</div>
                  {anuncianteDesde && <div style={{ fontSize: 11.5, color: "#A8A49D", marginTop: 2 }}><Icone nome="check" /> Anunciante desde {anuncianteDesde}</div>}
                </div>
              </div>
              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => abrirWhatsApp()} style={{ width: "100%", padding: 13, background: "#25D366", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  <Icone nome="whatsapp" /> Chamar no WhatsApp
                </button>
                <button onClick={ligar} style={{ width: "100%", padding: 11, background: "#F7F6F3", color: "#1A1917", border: "1.5px solid #E8E6E1", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  <Icone nome="telefone" /> Ligar: {telefoneContato}
                </button>
                {veiculo.loja_id && (
                  <Link href={`/loja/${veiculo.loja_id}`} className="toque-facil" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: 11, background: "#FFF5F0", color: "#FF6600", border: "1.5px solid #FF6600", borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: "none", boxSizing: "border-box" }}>
                    <Icone nome="loja" /> Ver revenda <span style={{ fontWeight: 500, color: "#C2570F" }}>· todos os veículos</span>
                  </Link>
                )}
              </div>
            </div>
            {mapaLoja}
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <BotaoFavorito id={veiculo.id} tipo="grande" />
              {avisoCompartilhar === "" && (
                <button onClick={compartilhar} style={{ width: "100%", padding: "10px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#F7F6F3", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#1A1917" }}>
                  <Icone nome="compartilhar" /> Compartilhar anúncio
                </button>
              )}
              {avisoCompartilhar !== "" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={compartilharWhatsApp} style={{ flex: 1, padding: "10px 6px", border: "none", borderRadius: 8, background: "#25D366", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}><Icone nome="whatsapp" /> Enviar no WhatsApp</button>
                    <button onClick={copiarLink} style={{ flex: 1, padding: "10px 6px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#F7F6F3", color: "#1A1917", cursor: "pointer", fontSize: 12, fontWeight: 600 }}><Icone nome="link" /> Copiar link</button>
                  </div>
                  {avisoCompartilhar === "copiado" && <div style={{ fontSize: 12, color: "#16A34A", textAlign: "center" }}><Icone nome="ok" /> Link copiado! É só colar onde quiser.</div>}
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
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1A1917" }}>Mais veículos para comprar na região</h2>
              {mesmoModelo && (
                <Link href={mesmoModelo} style={{ fontSize: 13, color: "#FF6600", fontWeight: 600, textDecoration: "none" }}>
                  Ver todas as opções de {veiculo.modelo ? `${veiculo.marca} ${veiculo.modelo}` : veiculo.marca} →
                </Link>
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
        <button onClick={() => abrirWhatsApp()} style={{ flex: 1, padding: "13px", background: "#25D366", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer" }}><Icone nome="whatsapp" /> WhatsApp</button>
        <button onClick={ligar} style={{ flex: 1, padding: "13px", background: "#FF6600", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer" }}><Icone nome="telefone" /> Ligar</button>
        <button onClick={() => (typeof navigator.share === "function" ? compartilhar() : compartilharWhatsApp())} aria-label="Compartilhar anúncio"
          style={{ width: 50, padding: "13px 0", background: "#F7F6F3", color: "#1A1917", border: "1.5px solid #E8E6E1", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icone nome="compartilhar" tamanho={20} /></button>
      </div>

      <Rodape />
      <div className="contato-fixo-espaco" />
    </main>
  );
}