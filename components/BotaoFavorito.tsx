"use client";
import { alternarFavorito, useFavoritos } from "@/lib/favoritos";

// Estrela de favorito. "cartao": bolinha sobre a foto do card (dentro de um <Link>);
// "grande": botão com texto na página do anúncio.
export default function BotaoFavorito({ id, tipo = "cartao" }: { id: string; tipo?: "cartao" | "grande" }) {
  const salvo = useFavoritos().includes(id);
  const rotulo = salvo ? "Remover dos favoritos" : "Salvar nos favoritos";

  function clicar(e: React.MouseEvent) {
    e.preventDefault();       // não abrir o anúncio quando a estrela está dentro do card
    e.stopPropagation();
    alternarFavorito(id);
  }

  if (tipo === "grande") {
    return (
      <button onClick={clicar} aria-pressed={salvo} title={rotulo}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px", border: `1.5px solid ${salvo ? "#E85D26" : "#E8E6E1"}`, borderRadius: 8, background: salvo ? "#FFF5F1" : "#F7F6F3", cursor: "pointer", fontSize: 13, fontWeight: 600, color: salvo ? "#E85D26" : "#1A1917" }}>
        <span style={{ fontSize: 16 }}>{salvo ? "★" : "☆"}</span> {salvo ? "Salvo nos favoritos" : "Salvar nos favoritos"}
      </button>
    );
  }

  return (
    <button onClick={clicar} aria-pressed={salvo} aria-label={rotulo} title={rotulo}
      style={{ position: "absolute", top: 8, right: 8, zIndex: 3, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.92)", color: salvo ? "#E85D26" : "#1A1917", fontSize: 18, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
      {salvo ? "★" : "☆"}
    </button>
  );
}
