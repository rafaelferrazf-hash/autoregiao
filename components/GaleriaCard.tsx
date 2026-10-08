"use client";
import { useRef, useState } from "react";
import FotoCard from "@/components/FotoCard";

// Fotos do card deslizáveis (dedo no celular, setas no computador), sem abrir o anúncio.
// Mostra até 6 fotos (versão pequena "-card"); a contagem usa o total de fotos do anúncio.
const MAXIMO = 6;

export default function GaleriaCard({ fotos, alt }: { fotos: string[]; alt: string }) {
  const faixa = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const lista = fotos.slice(0, MAXIMO);

  function aoRolar() {
    const el = faixa.current;
    if (el && el.clientWidth) setAtual(Math.round(el.scrollLeft / el.clientWidth));
  }
  function mover(e: React.MouseEvent, direcao: 1 | -1) {
    // O card inteiro é um link para o anúncio: as setas não podem abrir o anúncio.
    e.preventDefault();
    e.stopPropagation();
    const el = faixa.current;
    if (el) el.scrollBy({ left: direcao * el.clientWidth, behavior: "smooth" });
  }

  if (lista.length < 2) return <FotoCard src={fotos[0]} alt={alt} />;

  return (
    <div className="galeria-card" style={{ position: "absolute", inset: 0 }}>
      <div ref={faixa} onScroll={aoRolar} className="galeria-card-faixa">
        {lista.map((foto, i) => (
          <div key={i} className="galeria-card-item"><FotoCard src={foto} alt={`${alt} — foto ${i + 1}`} /></div>
        ))}
      </div>
      {atual > 0 && <button type="button" aria-label="Foto anterior" className="galeria-card-seta" style={{ left: 6 }} onClick={e => mover(e, -1)}>‹</button>}
      {atual < lista.length - 1 && <button type="button" aria-label="Próxima foto" className="galeria-card-seta" style={{ right: 6 }} onClick={e => mover(e, 1)}>›</button>}
      <span style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10.5, fontWeight: 600, padding: "2px 7px", borderRadius: 10, pointerEvents: "none" }}>
        {atual + 1} / {fotos.length}
      </span>
    </div>
  );
}
