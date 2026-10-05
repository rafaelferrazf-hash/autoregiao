"use client";
import { useState } from "react";
import { descreverFiltros, type Filtros } from "@/lib/busca";
import { pedirTokenPush, useAppNativo } from "@/lib/nativo";

// "Criar alerta" da busca de veículos: e-mail + a busca atual. O alerta só vale depois de
// confirmado pelo link enviado por e-mail (ver lib/alertas.ts).
// No app de iPhone, o principal é "Avisar neste celular" (notificação, sem e-mail).
// Usar com key={busca} para voltar ao formulário quando a busca mudar.
export default function CriarAlerta({ filtros, busca }: { filtros: Filtros; busca: string }) {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviadoPara, setEnviadoPara] = useState("");
  const appNativo = useAppNativo();
  const [pushToken, setPushToken] = useState("");
  const [alertasCelular, setAlertasCelular] = useState<{ id: string; descricao: string }[] | null>(null);

  async function avisarNoCelular() {
    setErro("");
    setEnviando(true);
    try {
      const token = await pedirTokenPush();
      if (!token) {
        setErro("Os avisos estão desligados. Para ligar: Ajustes do iPhone → Notificações → AutoRegião. Ou use o e-mail abaixo.");
      } else {
        const r = await fetch("/api/alertas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pushToken: token, busca }),
        });
        const j = await r.json();
        if (j.ok || /já tem um alerta/.test(j.erro || "")) {
          setPushToken(token);
          await alertasDoCelular(token);
        } else setErro(j.erro || "Não foi possível criar o alerta.");
      }
    } catch {
      setErro("Erro de conexão. Tente de novo.");
    }
    setEnviando(false);
  }

  async function alertasDoCelular(token: string, cancelar?: string) {
    try {
      const r = await fetch("/api/alertas/celular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pushToken: token, cancelar }),
      });
      const j = await r.json();
      if (j.ok) setAlertasCelular(j.alertas);
    } catch { /* fica a lista anterior */ }
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return setErro("Digite seu e-mail.");
    setErro("");
    setEnviando(true);
    try {
      const r = await fetch("/api/alertas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), busca }),
      });
      const j = await r.json();
      if (j.ok) setEnviadoPara(email.trim());
      else setErro(j.erro || "Não foi possível criar o alerta.");
    } catch {
      setErro("Erro de conexão. Tente de novo.");
    }
    setEnviando(false);
  }

  return (
    <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 4 }}>🔔 Criar alerta</div>
      <div style={{ fontSize: 12.5, color: "#7A7670", lineHeight: 1.5, marginBottom: 10 }}>
        {appNativo ? "Receba um aviso" : "Receba por e-mail"} os anúncios novos desta busca:
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1A1917", background: "#F7F6F3", borderRadius: 7, padding: "8px 10px", marginBottom: 12, lineHeight: 1.4 }}>
        {descreverFiltros(filtros)}
      </div>

      {appNativo && !enviadoPara && (pushToken ? (
        <div style={{ marginBottom: 12 }}>
          <div style={{ background: "#D1FAE5", border: "1.5px solid #6EE7B7", borderRadius: 8, padding: "10px 12px", fontSize: 12.5, color: "#065F46", lineHeight: 1.5 }}>
            ✅ Pronto! Você recebe um aviso neste celular quando aparecer anúncio novo (no máximo 1 por dia).
          </div>
          {alertasCelular && alertasCelular.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1917", marginBottom: 6 }}>Alertas neste celular</div>
              {alertasCelular.map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 12, color: "#4A4843", padding: "6px 0", borderTop: "1px solid #F0EEE9" }}>
                  <span style={{ lineHeight: 1.4 }}>{a.descricao}</span>
                  <button onClick={() => alertasDoCelular(pushToken, a.id)} style={{ background: "none", border: "none", color: "#B91C1C", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>Cancelar</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <button onClick={avisarNoCelular} disabled={enviando}
            style={{ width: "100%", padding: "11px", background: "#FF6600", color: "#fff", border: "none", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: enviando ? 0.7 : 1 }}>
            {enviando ? "Ativando..." : "🔔 Avisar neste celular"}
          </button>
          <div style={{ fontSize: 11.5, color: "#A8A49D", margin: "10px 0 0", textAlign: "center" }}>ou receba por e-mail:</div>
        </div>
      ))}

      {enviadoPara ? (
        <div style={{ background: "#D1FAE5", border: "1.5px solid #6EE7B7", borderRadius: 8, padding: "10px 12px", fontSize: 12.5, color: "#065F46", lineHeight: 1.5 }}>
          ✅ Quase lá! Enviamos um link de confirmação para <strong>{enviadoPara}</strong>. Confira também o lixo eletrônico.
        </div>
      ) : (
        <form onSubmit={criar}>
          <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErro(""); }} placeholder="seu@email.com" autoComplete="email"
            style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 13, color: "#1A1917", outline: "none", marginBottom: 8 }} />
          {erro && <div style={{ fontSize: 12, color: "#B91C1C", marginBottom: 8, lineHeight: 1.4 }}>{erro}</div>}
          <button type="submit" disabled={enviando}
            style={{ width: "100%", padding: "10px", background: "#FF6600", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: enviando ? 0.7 : 1 }}>
            {enviando ? "Enviando..." : "Criar alerta"}
          </button>
          <div style={{ fontSize: 11, color: "#A8A49D", marginTop: 8, lineHeight: 1.4 }}>No máximo 1 e-mail por dia. Cancele quando quiser.</div>
        </form>
      )}
    </div>
  );
}
