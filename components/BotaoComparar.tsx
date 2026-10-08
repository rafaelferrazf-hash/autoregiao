"use client";
import { useState } from "react";
import { alternarComparar, MAXIMO_COMPARAR, useComparar } from "@/lib/comparar";
import Icone from "@/components/Icone";

// "Comparar" sobre a foto do card (dentro do <Link> do anúncio: não pode abrir o anúncio).
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

  return (
    <button type="button" onClick={clicar} aria-pressed={marcado} title={marcado ? "Tirar da comparação" : "Comparar com outros"}
      style={{ position: "absolute", bottom: 8, left: 8, zIndex: 3, display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: marcado ? "#FF6600" : "rgba(255,255,255,0.92)", color: marcado ? "#fff" : "#1A1917", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
      <Icone nome={marcado ? "check" : "comparar"} tamanho={13} traco={2.2} />
      {cheio ? `Máximo ${MAXIMO_COMPARAR}` : marcado ? "Comparando" : "Comparar"}
    </button>
  );
}
