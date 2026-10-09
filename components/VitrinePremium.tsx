"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import CartaoVeiculo from "@/components/CartaoVeiculo";
import Icone from "@/components/Icone";
import { listarVitrinePremium } from "@/lib/dados/veiculos";
import type { VeiculoComLoja } from "@/lib/tipos";

const LARGURA_CARD = 270;
const ESPACO = 12;

// Faixa "Ofertas em destaque" no topo da página inicial: só anúncios de lojas Premium, em carrossel
// (setas semitransparentes no computador e no celular; também arrasta com o dedo). Some quando não há nenhum.
export default function VitrinePremium() {
  const [carros, setCarros] = useState<VeiculoComLoja[]>([]);
  const faixa = useRef<HTMLDivElement>(null);
  const [setas, setSetas] = useState({ voltar: false, avancar: false });

  useEffect(() => { listarVitrinePremium().then(setCarros); }, []);

  // Mostra cada seta só quando há para onde ir.
  const atualizarSetas = useCallback(() => {
    const el = faixa.current;
    if (!el) return;
    setSetas({ voltar: el.scrollLeft > 4, avancar: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = faixa.current;
    if (!el) return;
    const medir = () => atualizarSetas();
    // Observa a faixa e cada card (as fotos carregam depois e mudam a largura total).
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    Array.from(el.children).forEach(c => observador.observe(c));
    const tempo = window.setTimeout(medir, 400);
    return () => { observador.disconnect(); window.clearTimeout(tempo); };
  }, [carros, atualizarSetas]);

  function mover(direcao: 1 | -1) {
    const el = faixa.current;
    if (!el) return;
    // Avança o que cabe na tela (no mínimo 1 card).
    const passo = Math.max(LARGURA_CARD + ESPACO, Math.floor(el.clientWidth / (LARGURA_CARD + ESPACO)) * (LARGURA_CARD + ESPACO));
    el.scrollBy({ left: direcao * passo, behavior: "smooth" });
  }

  if (!carros.length) return null;

  const seta = (direcao: 1 | -1) => (
    <button type="button" onClick={() => mover(direcao)} aria-label={direcao === 1 ? "Próximas ofertas" : "Ofertas anteriores"} className="vitrine-seta"
      style={{ position: "absolute", top: "50%", [direcao === 1 ? "right" : "left"]: 6, transform: "translateY(-50%)", zIndex: 6, width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.35)", background: "rgba(26,25,23,0.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", color: "#fff", fontSize: 26, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.35)", padding: 0 }}>
      {direcao === 1 ? "›" : "‹"}
    </button>
  );

  return (
    <section style={{ background: "linear-gradient(180deg, #1A1917 0%, #2A2622 100%)", padding: "4px 0 22px" }}>
      <style>{`
        .vitrine-faixa { scrollbar-width: none; }
        .vitrine-faixa::-webkit-scrollbar { display: none; }
        .vitrine-seta:hover { background: rgba(255,102,0,0.85) !important; }
      `}</style>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 6, margin: 0 }}><Icone nome="coroa" cor="#FF6600" tamanho={20} /> Ofertas em destaque</h2>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>Selecionadas das lojas Premium da região</div>
          </div>
          <Link href="/veiculos" style={{ fontSize: 12.5, color: "#FF8A3D", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>Ver todas →</Link>
        </div>
        <div style={{ position: "relative" }}>
          <div ref={faixa} onScroll={atualizarSetas} className="vitrine-faixa" style={{ display: "flex", gap: ESPACO, overflowX: "auto", paddingBottom: 2, scrollSnapType: "x mandatory" }}>
            {carros.map(car => (
              <div key={car.id} style={{ scrollSnapAlign: "start", flexShrink: 0, display: "flex" }}>
                <CartaoVeiculo car={car} largura={LARGURA_CARD} />
              </div>
            ))}
          </div>
          {setas.voltar && seta(-1)}
          {setas.avancar && seta(1)}
        </div>
      </div>
    </section>
  );
}
