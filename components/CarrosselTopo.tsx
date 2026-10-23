"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useEmAppDaLoja } from "@/lib/appLoja";
import { APP_ANDROID, APP_IPHONE, SLIDE_APP_LIGADO } from "@/lib/site";
import LogoLoja from "@/components/LogoLoja";
import { supabase } from "@/lib/supabase";
import type { BannerPublico } from "@/lib/banners";

// Banner grande no topo da página inicial (estilo Mobiauto): troca sozinho a cada 6 s, setas
// semitransparentes, bolinhas e arrastar no celular. Fotos: Pexels (licença livre), em public/banners/.
// Os banners pagos (até 4 vagas, vendidos pelo Rafael para lojas e negócios do ramo) entram depois do 1º slide.
type Slide = {
  chave: string; foto?: string | null; logo?: string | null;
  largura?: string; // fotos em pé (pessoas) ocupam menos largura, para não cortar o rosto e o celular
  titulo: React.ReactNode; texto: string;
  botao?: { rotulo: string; href: string };
  lojasDeApps?: boolean; // botões Google Play / App Store no lugar do botão
  banner?: string;       // id do banner pago (conta visualização e clique)
};

const destaque = (t: string) => <span style={{ color: "#FF7A1F" }}>{t}</span>;
const TEMPO = 6000;
const estiloBotao = { alignSelf: "flex-start", marginTop: 6, padding: "12px 22px", background: "#FF6600", color: "#fff", borderRadius: 9, fontWeight: 700, fontSize: 15, textDecoration: "none" } as const;

export default function CarrosselTopo() {
  const emApp = useEmAppDaLoja();
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const toque = useRef<number | null>(null);
  const [banners, setBanners] = useState<BannerPublico[]>([]);
  const vistos = useRef(new Set<string>());

  // Banners pagos no ar hoje (o banco só devolve os que estão no período).
  useEffect(() => {
    let ativo = true;
    supabase.from("banners").select("id, titulo, destaque, texto, botao, link, imagem_url").order("inicio").limit(4)
      .then(({ data }) => { if (ativo && data) setBanners(data as BannerPublico[]); });
    return () => { ativo = false; };
  }, []);

  const temApp = SLIDE_APP_LIGADO && !emApp && (APP_ANDROID.publicado || APP_IPHONE.publicado);
  const slides: Slide[] = [
    { chave: "carro", foto: "/banners/comprar-casal.jpg", titulo: <>Encontre o carro ideal {destaque("na sua região")}</>, texto: "Carros, motos e utilitários de Teixeira de Freitas e região.", botao: { rotulo: "Buscar veículos", href: "/veiculos" } },
    ...banners.map(b => ({
      chave: `banner-${b.id}`, banner: b.id, foto: b.imagem_url,
      titulo: b.destaque && b.titulo.includes(b.destaque)
        ? <>{b.titulo.split(b.destaque)[0]}{destaque(b.destaque)}{b.titulo.split(b.destaque).slice(1).join(b.destaque)}</>
        : <>{b.titulo}</>,
      texto: b.texto ?? "",
      botao: { rotulo: b.botao, href: b.link },
    })),
    ...(temApp ? [{ chave: "app", foto: "/banners/app.jpg", largura: "36%", titulo: <>O seu próximo carro {destaque("na palma da mão")}</>, texto: "Baixe o app AutoRegião e receba aviso de carro novo no celular.", lojasDeApps: true }] : []),
    { chave: "fipe", foto: "/banners/fipe-em-casa.jpg", titulo: <>Consulte a {destaque("Tabela FIPE")} de graça</>, texto: "Saiba o preço justo antes de comprar ou vender.", botao: { rotulo: "Consultar FIPE", href: "/tabela-fipe" } },
    ...(!emApp ? [{ chave: "anuncie", foto: "/banners/anuncie-revendedor.jpg", titulo: <>Anuncie sua revenda: {destaque("60 dias grátis")}</>, texto: "Seus carros na vitrine de quem compra na região.", botao: { rotulo: "Quero anunciar", href: "/anunciar" } }] : []),
  ];
  const total = slides.length;
  const indice = total ? atual % total : 0;

  // Conta 1 visualização por banner por visita, quando ele aparece na tela.
  const bannerAtual = slides[indice]?.banner;
  useEffect(() => {
    if (!bannerAtual || vistos.current.has(bannerAtual)) return;
    vistos.current.add(bannerAtual);
    supabase.rpc("contar_banner", { p_id: bannerAtual, p_tipo: "visualizacao" }).then(() => {});
  }, [bannerAtual]);
  const contarClique = (id?: string) => { if (id) supabase.rpc("contar_banner", { p_id: id, p_tipo: "clique" }).then(() => {}); };

  const ir = useCallback((n: number) => setAtual(a => ((((a % total) + n) % total) + total) % total), [total]);
  useEffect(() => {
    if (pausado || total < 2) return;
    const t = setInterval(() => ir(1), TEMPO);
    return () => clearInterval(t);
  }, [pausado, total, ir]);

  const seta = (direcao: 1 | -1) => (
    <button type="button" aria-label={direcao === 1 ? "Próximo destaque" : "Destaque anterior"} onClick={() => ir(direcao)} className="carrossel-seta"
      style={{ position: "absolute", top: "50%", [direcao === 1 ? "right" : "left"]: 14, transform: "translateY(-50%)", zIndex: 5, width: 46, height: 46, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.25)", color: "#fff", fontSize: 26, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }}>
      {direcao === 1 ? "›" : "‹"}
    </button>
  );

  return (
    <section aria-roledescription="carrossel" aria-label="Destaques" onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)}
      onTouchStart={e => { toque.current = e.touches[0].clientX; setPausado(true); }}
      onTouchEnd={e => {
        const ini = toque.current;
        toque.current = null;
        setPausado(false);
        if (ini === null) return;
        const dx = e.changedTouches[0].clientX - ini;
        if (Math.abs(dx) > 40) ir(dx < 0 ? 1 : -1);
      }}
      className="carrossel-topo" style={{ position: "relative", marginTop: 60, background: "#1A1917", overflow: "hidden" }}>
      <style>{`
        .carrossel-topo { height: 340px; }
        .carrossel-titulo { font-size: 44px; }
        .carrossel-texto { font-size: 17px; }
        @media (min-width: 769px) { .carrossel-conteudo { padding-left: 76px !important; padding-right: 76px !important; } }
        .carrossel-seta:hover { background: rgba(255,102,0,0.85) !important; border-color: #FF6600 !important; }
        @media (max-width: 768px) {
          .carrossel-titulo { font-size: 28px; }
          .carrossel-texto { font-size: 14px; }
          .carrossel-seta { display: none !important; }
          .carrossel-foto { width: 100% !important; }
          .carrossel-degrade { display: block !important; background: linear-gradient(0deg, rgba(26,25,23,0.97) 30%, rgba(26,25,23,0.55) 55%, rgba(26,25,23,0) 80%); }
          .carrossel-esfuma { display: none; }
          .carrossel-conteudo { justify-content: flex-end !important; padding: 0 16px 34px !important; gap: 8px !important; }
          .carrossel-topo { height: 360px; }
        }
      `}</style>
      {slides.map((s, i) => (
        <div key={s.chave} aria-hidden={i !== indice} style={{ position: "absolute", inset: 0, opacity: i === indice ? 1 : 0, transition: "opacity 0.6s ease", pointerEvents: i === indice ? "auto" : "none" }}>
          {/* Foto à direita (no celular ocupa tudo, escurecida embaixo) */}
          <div className="carrossel-foto" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: s.largura ?? "62%", background: "#2A2622" }}>
            {s.foto
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={s.foto} alt="" loading={i === 0 ? "eager" : "lazy"} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%", display: "block" }} />
              : s.logo && <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><LogoLoja url={s.logo} tamanho={180} raio={90} /></div>}
            {/* Esfuma a borda esquerda da foto no fundo grafite (computador) */}
            <div className="carrossel-esfuma" style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #1A1917 0%, rgba(26,25,23,0.7) 15%, rgba(26,25,23,0) 45%)" }} />
          </div>
          <div className="carrossel-degrade" style={{ position: "absolute", inset: 0, display: "none" }} />
          {/* Texto */}
          <div className="carrossel-conteudo" style={{ position: "relative", zIndex: 2, maxWidth: 1180, height: "100%", margin: "0 auto", padding: "0 24px 26px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
            {s.logo && s.foto && <LogoLoja url={s.logo} tamanho={56} raio={28} />}
            {s.banner && <span style={{ alignSelf: "flex-start", fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.35)", padding: "2px 8px", borderRadius: 4 }}>Patrocinado</span>}
            <h2 className="carrossel-titulo" style={{ margin: 0, color: "#fff", fontWeight: 800, lineHeight: 1.1, maxWidth: 560 }}>{s.titulo}</h2>
            <p className="carrossel-texto" style={{ margin: 0, color: "rgba(255,255,255,0.85)", maxWidth: 480, lineHeight: 1.45 }}>{s.texto}</p>
            {s.botao && (
              s.botao.href.startsWith("/")
                ? <Link href={s.botao.href} onClick={() => contarClique(s.banner)} style={estiloBotao}>{s.botao.rotulo} →</Link>
                : <a href={s.botao.href} target="_blank" rel="noopener noreferrer sponsored" onClick={() => contarClique(s.banner)} style={estiloBotao}>{s.botao.rotulo} →</a>
            )}
            {s.lojasDeApps && (
              <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                {APP_ANDROID.publicado && (
                  <a href={APP_ANDROID.link} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/banners/google-play.png" alt="Disponível no Google Play" style={{ height: 58, display: "block", margin: "-9px -8px" }} />
                  </a>
                )}
                {APP_IPHONE.publicado && (
                  <a href={APP_IPHONE.link} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/banners/app-store.svg" alt="Baixar na App Store" style={{ height: 40, display: "block" }} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      {total > 1 && seta(-1)}
      {total > 1 && seta(1)}
      {total > 1 && (
        <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 7, zIndex: 5 }}>
          {slides.map((s, i) => (
            <button key={s.chave} type="button" aria-label={`Ir para o destaque ${i + 1}`} onClick={() => setAtual(i)}
              style={{ width: i === indice ? 22 : 8, height: 8, borderRadius: 4, border: "none", padding: 0, cursor: "pointer", background: i === indice ? "#FF6600" : "rgba(255,255,255,0.5)", transition: "width 0.3s" }} />
          ))}
        </div>
      )}
    </section>
  );
}
