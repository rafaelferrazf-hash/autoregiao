"use client";
import { useState } from "react";
import { alternarComparar, MAXIMO_COMPARAR, useComparar } from "@/lib/comparar";
import Icone from "@/components/Icone";

// Botão de comparar sobre a foto do card (dentro do <Link> do anúncio: não pode abrir o anúncio).
export default function BotaoComparar({ id }: { id: string }) {
  const marcado = useComparar().includes(id);
  const [cheio, setCheio] = useState(false);

  function clicar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ok = alternarComparar(id);
    setCheio(!ok);
    if (!ok) setTimeout(() => setCheio(false), 2500);
  }

  // Quadradinho no canto de cima da foto; marcado fica laranja. "Máximo 3" aparece por 2,5 s.
  return (
    <button type="button" onClick={clicar} aria-pressed={marcado} aria-label={marcado ? "Tirar da comparação" : "Comparar com outros"} title={marcado ? "Tirar da comparação" : "Comparar com outros"}
      style={{ position: "absolute", top: 8, left: 8, zIndex: 3, height: 32, minWidth: 32, padding: cheio ? "0 10px" : 0, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, background: marcado ? "#FF6600" : "rgba(255,255,255,0.92)", color: marcado ? "#fff" : "#1A1917", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
      <Icone nome={marcado ? "check" : "comparar"} tamanho={17} traco={2.1} />
      {cheio && `Máximo ${MAXIMO_COMPARAR}`}
    </button>
  );
}
