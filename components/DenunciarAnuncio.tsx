"use client";
import { useState } from "react";
import Icone from "@/components/Icone";

// "Denunciar este anúncio": formulário dentro do site/app (não depende de app de e-mail no aparelho).
const MOTIVOS = ["Golpe ou fraude", "Veículo não existe ou já foi vendido", "Informações falsas", "Fotos de outro veículo", "Conteúdo ofensivo", "Outro"];
const campo = { width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, background: "#F7F6F3", color: "#1A1917", outline: "none" } as const;

export default function DenunciarAnuncio({ veiculoId }: { veiculoId: string }) {
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"" | "enviando" | "ok">("");
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!motivo) { setErro("Escolha o motivo."); return; }
    setEstado("enviando");
    const r = await fetch("/api/denuncias", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ veiculo: veiculoId, motivo, detalhes, email }) })
      .then(x => x.json()).catch(() => ({ erro: "Falha de conexão. Tente de novo." }));
    if (r.ok) setEstado("ok");
    else { setEstado(""); setErro(r.erro || "Não foi possível enviar."); }
  }

  if (!aberto) {
    return (
      <button type="button" onClick={() => setAberto(true)} className="toque-facil"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, padding: 0, background: "none", border: "none", fontSize: 12, color: "#7A7670", textDecoration: "underline", cursor: "pointer" }}>
        <Icone nome="bandeira" /> Denunciar este anúncio
      </button>
    );
  }
  if (estado === "ok") {
    return <div style={{ marginTop: 10, fontSize: 13, color: "#15803D", fontWeight: 600 }}><Icone nome="ok" /> Denúncia enviada. Obrigado! Vamos analisar o anúncio.</div>;
  }
  return (
    <form onSubmit={enviar} style={{ marginTop: 10, background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1917" }}>Denunciar este anúncio</div>
      <select value={motivo} onChange={e => setMotivo(e.target.value)} style={campo} aria-label="Motivo">
        <option value="">Qual o problema?</option>
        {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <textarea value={detalhes} onChange={e => setDetalhes(e.target.value)} maxLength={1000} rows={3} placeholder="Conte o que aconteceu (opcional)" style={{ ...campo, resize: "vertical", fontFamily: "inherit" }} />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Seu e-mail, se quiser resposta (opcional)" style={campo} />
      {erro && <div style={{ fontSize: 12.5, color: "#B91C1C" }}>{erro}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={estado === "enviando"} style={{ flex: 1, padding: 10, background: "#B91C1C", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
          {estado === "enviando" ? "Enviando..." : "Enviar denúncia"}
        </button>
        <button type="button" onClick={() => setAberto(false)} style={{ padding: "10px 14px", background: "none", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 13.5, cursor: "pointer", color: "#1A1917" }}>Cancelar</button>
      </div>
    </form>
  );
}
