"use client";
import { useState } from "react";
import { sair } from "@/lib/dados/usuario";

// "Excluir minha conta" dentro do site e dos apps (a App Store exige que dê para excluir pelo próprio app).
export default function ExcluirConta() {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function excluir() {
    setEnviando(true);
    setErro("");
    try {
      const r = await fetch("/api/conta/excluir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmacao: texto }),
      });
      const dados = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErro(dados.erro || "Não foi possível excluir sua conta agora.");
        setEnviando(false);
        return;
      }
      await sair().catch(() => {});
      window.location.href = "/?conta=excluida";
    } catch {
      setErro("Sem conexão. Tente de novo.");
      setEnviando(false);
    }
  }

  return (
    <div style={{ background: "#fff", border: "1.5px solid #FCA5A5", borderRadius: 12, padding: 16, marginTop: 24, maxWidth: 720 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#B91C1C", marginBottom: 4 }}>Excluir minha conta</div>
      <p style={{ fontSize: 13, color: "#57534E", lineHeight: 1.6, margin: 0 }}>
        Apaga de vez seu login, seus anúncios com as fotos, os dados e o logo da loja e os alertas do seu e-mail.
        Não dá para desfazer. Registros de pagamentos de planos são guardados pelo prazo da lei fiscal.
      </p>
      {!aberto ? (
        <button onClick={() => setAberto(true)} className="toque-facil"
          style={{ marginTop: 12, padding: "9px 14px", border: "1.5px solid #DC2626", borderRadius: 8, background: "#fff", color: "#DC2626", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Excluir minha conta
        </button>
      ) : (
        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontSize: 13, color: "#1A1917", marginBottom: 6 }}>
            Para confirmar, digite <strong>EXCLUIR</strong>:
          </label>
          <input value={texto} onChange={e => setTexto(e.target.value)} autoCapitalize="characters" autoComplete="off"
            style={{ width: "100%", maxWidth: 260, padding: "9px 12px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14 }} />
          {erro && <div style={{ fontSize: 12.5, color: "#DC2626", marginTop: 8 }}>{erro}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={excluir} disabled={enviando || texto.trim().toUpperCase() !== "EXCLUIR"} className="toque-facil"
              style={{ padding: "9px 14px", border: "none", borderRadius: 8, background: "#DC2626", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: enviando || texto.trim().toUpperCase() !== "EXCLUIR" ? 0.5 : 1 }}>
              {enviando ? "Excluindo..." : "Excluir definitivamente"}
            </button>
            <button onClick={() => { setAberto(false); setTexto(""); setErro(""); }} disabled={enviando} className="toque-facil"
              style={{ padding: "9px 14px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#fff", color: "#1A1917", fontSize: 13, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
