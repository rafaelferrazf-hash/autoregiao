"use client";
import { useState } from "react";
import { paraNumero, type Filtros, type TipoVeiculo } from "@/lib/busca";

export const ANOS: [string, string][] = [["", "Qualquer ano"], ["2024", "2024 ou mais novo"], ["2021", "2021 ou mais novo"], ["2018", "2018 ou mais novo"], ["2015", "2015 ou mais novo"], ["2010", "2010 ou mais novo"]];
const ABAS: [TipoVeiculo | undefined, string][] = [[undefined, "Todos"], ["carro", "🚗 Carros"], ["moto", "🏍️ Motos"], ["utilitario", "🚐 Utilitários"]];

// Barra escura de busca (página inicial e /veiculos).
// `onBuscar` recebe os filtros do formulário; as abas de tipo buscam na hora.
export default function BarraBusca({ filtros, cidades, onBuscar }: {
  filtros: Filtros;
  cidades: string[];
  onBuscar: (f: Filtros) => void;
}) {
  const [rascunho, setRascunho] = useState<Filtros>(filtros);
  // Quando a URL muda (voltar do navegador, limpar filtros), o formulário acompanha.
  const chave = JSON.stringify(filtros);
  const [chaveAnterior, setChaveAnterior] = useState(chave);
  if (chave !== chaveAnterior) {
    setChaveAnterior(chave);
    setRascunho(filtros);
  }

  const muda = (campo: keyof Filtros, valor: string) => setRascunho(r => ({ ...r, [campo]: valor || undefined }));
  const mudaNumero = (campo: keyof Filtros, valor: string) => setRascunho(r => ({ ...r, [campo]: paraNumero(valor) }));

  const rotulo = (t: string) => <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 5 }}>{t}</div>;
  const campo = { width: "100%", padding: "10px 12px", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 7, fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.08)", outline: "none", boxSizing: "border-box" } as const;
  const opcao = { color: "#1A1917" };

  return (
    <section style={{ marginTop: 60, background: "#1A1917", padding: "20px 16px" }}>
      <style>{`
        .barra-busca-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto; gap: 10px; align-items: end; }
        @media (max-width: 768px) { .barra-busca-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
          {ABAS.map(([tipo, texto]) => {
            const ativa = filtros.tipo === tipo;
            return (
              <button key={texto} type="button" onClick={() => onBuscar({ ...filtros, tipo })} style={{ padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", background: ativa ? "#E85D26" : "rgba(255,255,255,0.1)", color: ativa ? "#fff" : "rgba(255,255,255,0.6)", whiteSpace: "nowrap", flexShrink: 0 }}>{texto}</button>
            );
          })}
        </div>
        <form className="barra-busca-grid" onSubmit={e => { e.preventDefault(); onBuscar(rascunho); }}>
          <div>{rotulo("Marca / Modelo")}<input placeholder="Ex: Onix, HB20..." value={rascunho.q ?? ""} onChange={e => muda("q", e.target.value)} style={campo} /></div>
          <div>{rotulo("Cidade")}
            <select value={rascunho.cidade ?? ""} onChange={e => muda("cidade", e.target.value)} style={{ ...campo, color: rascunho.cidade ? "#fff" : "rgba(255,255,255,0.6)" }}>
              <option value="" style={opcao}>Todas as cidades</option>
              {cidades.map(c => <option key={c} value={c} style={opcao}>{c}</option>)}
            </select>
          </div>
          <div>{rotulo("Ano")}
            <select value={rascunho.ano_min ?? ""} onChange={e => mudaNumero("ano_min", e.target.value)} style={{ ...campo, color: rascunho.ano_min ? "#fff" : "rgba(255,255,255,0.6)" }}>
              {ANOS.map(([v, r]) => <option key={v} value={v} style={opcao}>{r}</option>)}
            </select>
          </div>
          <div>{rotulo("Preço até")}<input inputMode="numeric" placeholder="Qualquer valor" value={rascunho.preco_max ? rascunho.preco_max.toLocaleString("pt-BR") : ""} onChange={e => mudaNumero("preco_max", e.target.value)} style={campo} /></div>
          <div>{rotulo("KM até")}<input inputMode="numeric" placeholder="Qualquer km" value={rascunho.km_max ? rascunho.km_max.toLocaleString("pt-BR") : ""} onChange={e => mudaNumero("km_max", e.target.value)} style={campo} /></div>
          <button type="submit" style={{ padding: "10px 22px", background: "#E85D26", color: "#fff", border: "none", borderRadius: 7, fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>🔍 Buscar</button>
        </form>
      </div>
    </section>
  );
}
