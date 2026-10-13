"use client";
import Icone from "@/components/Icone";

// Ano "De" / "Até" (todos os anos, do próximo até 1980). Usado na barra de busca (escuro) e nos filtros.
const ANO_MAIS_NOVO = new Date().getFullYear() + 1;
export const LISTA_ANOS = Array.from({ length: ANO_MAIS_NOVO - 1980 + 1 }, (_, i) => ANO_MAIS_NOVO - i);

export default function CampoAnos({ de, ate, onMudar, escuro = false }: {
  de?: number; ate?: number;
  onMudar: (campo: "ano_min" | "ano_max", valor: string) => void;
  escuro?: boolean;
}) {
  const caixa = (campo: "ano_min" | "ano_max", valor: number | undefined, rotulo: string) => (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <select aria-label={`Ano ${rotulo.toLowerCase()}`} value={valor ?? ""} onChange={e => onMudar(campo, e.target.value)}
        style={{
          width: "100%", boxSizing: "border-box", appearance: "none", WebkitAppearance: "none", cursor: "pointer", outline: "none",
          padding: escuro ? "10px 22px 10px 9px" : "8px 28px 8px 10px", borderRadius: 7, fontSize: escuro ? 14 : 13,
          border: escuro ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid #E8E6E1",
          background: escuro ? "rgba(255,255,255,0.08)" : "#F7F6F3",
          color: valor ? (escuro ? "#fff" : "#1A1917") : (escuro ? "rgba(255,255,255,0.6)" : "#7A7670"),
        }}>
        <option value="" style={{ color: "#1A1917" }}>{rotulo}</option>
        {LISTA_ANOS.map(a => <option key={a} value={a} style={{ color: "#1A1917" }}>{a}</option>)}
      </select>
      <span aria-hidden="true" style={{ position: "absolute", right: escuro ? 6 : 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex", color: escuro ? "rgba(255,255,255,0.55)" : "#7A7670" }}>
        <Icone nome="calendario" tamanho={escuro ? 13 : 15} />
      </span>
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {caixa("ano_min", de, "De")}
      {caixa("ano_max", ate, "Até")}
    </div>
  );
}
