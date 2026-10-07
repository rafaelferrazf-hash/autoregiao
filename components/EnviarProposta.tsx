"use client";
import { useEffect, useRef, useState } from "react";
import Icone from "@/components/Icone";
import { formatarPreco, lerPreco } from "@/lib/formatar";

// "Enviar proposta": para quem não quer (ou não pode) chamar no WhatsApp agora.
// O vendedor recebe por e-mail (rota /api/propostas) e responde pelo WhatsApp/telefone do comprador.
export default function EnviarProposta({ veiculoId, nomeVeiculo, preco }: { veiculoId: string; nomeVeiculo: string; preco: number | null }) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const abertoEm = useRef(0);
  const [f, setF] = useState({ nome: "", telefone: "", email: "", valor: "", troca: "", mensagem: `Olá! Tenho interesse no ${nomeVeiculo}.`, site: "" });
  const muda = (campo: keyof typeof f, v: string) => { setF(x => ({ ...x, [campo]: v })); setErro(""); };
  const caixa = useRef<HTMLDivElement>(null);

  // Botão "Enviar proposta" do cartão da direita (computador): abre o formulário e rola até ele.
  useEffect(() => {
    const abrir = () => {
      if (!abertoEm.current) abertoEm.current = Date.now();
      setAberto(true);
      setTimeout(() => caixa.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    };
    window.addEventListener("abrir-proposta", abrir);
    return () => window.removeEventListener("abrir-proposta", abrir);
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    try {
      const r = await fetch("/api/propostas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, valor: lerPreco(f.valor) ?? undefined, veiculo: veiculoId, abertoHaMs: Date.now() - abertoEm.current }),
      });
      const j = await r.json();
      if (j.ok) setEnviado(true); else setErro(j.erro || "Não foi possível enviar. Tente de novo.");
    } catch {
      setErro("Sem conexão. Tente de novo.");
    }
    setEnviando(false);
  }

  const campo = { width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none" } as const;
  const rotulo = { display: "block", fontSize: 11.5, fontWeight: 600, color: "#7A7670", marginBottom: 4 } as const;

  return <div ref={caixa} style={{ scrollMarginTop: 76 }}>{conteudo()}</div>;

  function conteudo() {
  if (!aberto) {
    return (
      <button type="button" className="toque-facil" onClick={() => { abertoEm.current = Date.now(); setAberto(true); }}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: 11, background: "#fff", color: "#1A1917", border: "1.5px solid #1A1917", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        <Icone nome="real" /> Enviar proposta
      </button>
    );
  }

  if (enviado) {
    return (
      <div style={{ background: "#D1FAE5", border: "1.5px solid #6EE7B7", borderRadius: 9, padding: "12px 14px", fontSize: 13, color: "#065F46", lineHeight: 1.5 }}>
        <Icone nome="ok" /> <strong>Proposta enviada!</strong> O vendedor recebe por e-mail e vai responder pelo seu WhatsApp ou telefone.
      </div>
    );
  }

  return (
    <form onSubmit={enviar} style={{ position: "relative", border: "1.5px solid #E8E6E1", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 10, background: "#fff" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917" }}><Icone nome="real" cor="#FF6600" /> Enviar proposta</div>
      {/* Campo escondido contra robôs (pessoas não veem). */}
      <input name="site" value={f.site} onChange={e => muda("site", e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
      <div>
        <label style={rotulo} htmlFor="prop-nome">Seu nome *</label>
        <input id="prop-nome" value={f.nome} onChange={e => muda("nome", e.target.value)} maxLength={80} autoComplete="name" style={campo} required />
      </div>
      <div>
        <label style={rotulo} htmlFor="prop-tel">WhatsApp ou telefone (com DDD) *</label>
        <input id="prop-tel" value={f.telefone} onChange={e => muda("telefone", e.target.value)} inputMode="tel" autoComplete="tel" placeholder="(73) 99999-9999" style={campo} required />
      </div>
      <div>
        <label style={rotulo} htmlFor="prop-email">E-mail (opcional)</label>
        <input id="prop-email" type="email" value={f.email} onChange={e => muda("email", e.target.value)} autoComplete="email" placeholder="seu@email.com" style={campo} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={rotulo} htmlFor="prop-valor">Valor oferecido</label>
          <input id="prop-valor" value={f.valor} onChange={e => muda("valor", e.target.value)} inputMode="numeric" placeholder={preco ? formatarPreco(preco) : "R$"} style={campo} />
        </div>
        <div>
          <label style={rotulo} htmlFor="prop-troca">Carro na troca</label>
          <input id="prop-troca" value={f.troca} onChange={e => muda("troca", e.target.value)} maxLength={120} placeholder="Ex.: Gol 2015" style={campo} />
        </div>
      </div>
      <div>
        <label style={rotulo} htmlFor="prop-msg">Mensagem</label>
        <textarea id="prop-msg" value={f.mensagem} onChange={e => muda("mensagem", e.target.value)} maxLength={1500} rows={3} style={{ ...campo, resize: "vertical", fontFamily: "inherit" }} />
      </div>
      {erro && <div style={{ fontSize: 12.5, color: "#B91C1C" }}><Icone nome="atencao" /> {erro}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={enviando} className="toque-facil"
          style={{ flex: 1, padding: 11, background: "#FF6600", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: enviando ? 0.7 : 1 }}>
          {enviando ? "Enviando..." : "Enviar proposta"}
        </button>
        <button type="button" onClick={() => setAberto(false)} disabled={enviando}
          style={{ padding: "11px 14px", background: "#fff", color: "#7A7670", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
          Cancelar
        </button>
      </div>
      <div style={{ fontSize: 11, color: "#A8A49D", lineHeight: 1.4 }}>Seus dados vão só para o vendedor deste anúncio.</div>
    </form>
  );
  }
}
