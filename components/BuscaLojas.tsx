"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LogoLoja from "@/components/LogoLoja";
import Icone from "@/components/Icone";

// Campo "Procurar loja pelo nome" da página /lojas: ao digitar, mostra as lojas encontradas logo abaixo.
type Item = { id: string; nome: string; local: string; logo_url: string | null; veiculos: number };

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function BuscaLojas({ lojas }: { lojas: Item[] }) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [aberto, setAberto] = useState(false);
  const [marcado, setMarcado] = useState(0);
  const caixa = useRef<HTMLDivElement>(null);

  const achadas = useMemo(() => {
    const t = semAcento(texto.trim());
    if (!t) return [];
    return lojas.filter(l => semAcento(l.nome).includes(t)).slice(0, 8);
  }, [texto, lojas]);

  const ir = (id: string) => { setAberto(false); router.push(`/loja/${id}`); };

  function teclas(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") { e.preventDefault(); setMarcado(m => Math.min(m + 1, achadas.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setMarcado(m => Math.max(m - 1, 0)); }
    else if (e.key === "Enter" && achadas[marcado]) { e.preventDefault(); ir(achadas[marcado].id); }
    else if (e.key === "Escape") setAberto(false);
  }

  const mostrar = aberto && texto.trim().length > 0;

  return (
    <div ref={caixa} style={{ position: "relative", maxWidth: 480, marginBottom: 14 }}
      onBlur={e => { if (!caixa.current?.contains(e.relatedTarget as Node)) setAberto(false); }}>
      <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#7A7670", display: "flex" }}>
        <Icone nome="buscar" tamanho={18} />
      </div>
      <input
        type="search"
        value={texto}
        onChange={e => { setTexto(e.target.value); setAberto(true); setMarcado(0); }}
        onFocus={() => setAberto(true)}
        onKeyDown={teclas}
        placeholder="Procurar loja pelo nome"
        aria-label="Procurar loja pelo nome"
        autoComplete="off"
        style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px 12px 40px", border: "1.5px solid #E8E6E1", borderRadius: 10, fontSize: 15, background: "#fff", color: "#1A1917", outline: "none" }}
      />
      {mostrar && (
        <div role="listbox" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 30, background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, boxShadow: "0 10px 28px rgba(0,0,0,0.12)", overflow: "hidden" }}>
          {achadas.length === 0 ? (
            <div style={{ padding: "14px 16px", fontSize: 13.5, color: "#7A7670" }}>Nenhuma loja com esse nome.</div>
          ) : achadas.map((l, i) => (
            <button key={l.id} type="button" role="option" aria-selected={i === marcado}
              onMouseEnter={() => setMarcado(i)} onClick={() => ir(l.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", borderTop: i ? "1px solid #F0EEEA" : "none", background: i === marcado ? "#FFF5F1" : "#fff", cursor: "pointer", textAlign: "left" }}>
              <LogoLoja url={l.logo_url} tamanho={36} raio={8} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#1A1917", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.nome}</span>
                <span style={{ display: "block", fontSize: 12, color: "#7A7670" }}>{[l.local, `${l.veiculos} ${l.veiculos === 1 ? "veículo" : "veículos"}`].filter(Boolean).join(" · ")}</span>
              </span>
              <span style={{ color: "#FF6600", fontSize: 13, fontWeight: 700 }}>→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
