"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEmAppDaLoja } from "@/lib/appLoja";
import { AVULSOS, DIAS_GRATIS_PARTICULAR, formatarReais, type IdAvulso } from "@/lib/planos";
import Icone from "@/components/Icone";

// Antes do cadastro de um anúncio de PESSOA FÍSICA (supabase/fase24):
//  - ainda não usou o grátis → pede CPF + WhatsApp e libera 1 anúncio grátis de 60 dias;
//  - já usou → anúncio avulso pago (30 ou 60 dias) ou planos de loja.
// Loja, quem já tem uma liberação sobrando, ou edição de anúncio: passa direto (children).
type Situacao = "carregando" | "livre" | "gratis" | "pago";

const cartao = { background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 14, padding: 22 } as const;
const campo = { width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 15, background: "#F7F6F3", color: "#1A1917", outline: "none" } as const;

function mascaraCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function mascaraTel(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

export default function PortaoParticular({ ativo, onLiberado, children }: { ativo: boolean; onLiberado: (telefone: string) => void; children: React.ReactNode }) {
  const emApp = useEmAppDaLoja();
  const [situacao, setSituacao] = useState<Situacao>(ativo ? "carregando" : "livre");
  const [cpf, setCpf] = useState("");
  const [tel, setTel] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [pagando, setPagando] = useState<IdAvulso | null>(null);

  useEffect(() => {
    if (!ativo) return;
    let vivo = true;
    (async () => {
      // Editar um anúncio que já existe não passa pelo portão.
      if (new URLSearchParams(window.location.search).get("editar")) { if (vivo) setSituacao("livre"); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (vivo) setSituacao("livre"); return; }
      const [{ data: loja }, { data: libs, error }] = await Promise.all([
        supabase.from("lojas").select("id").eq("usuario_id", user.id).maybeSingle(),
        supabase.from("liberacoes_particular").select("tipo, usada_em").eq("usuario_id", user.id),
      ]);
      if (!vivo) return;
      if (loja || error) { setSituacao("livre"); return; }
      const lista = libs ?? [];
      if (lista.some(l => !l.usada_em)) setSituacao("livre");
      else setSituacao(lista.some(l => l.tipo === "gratis") ? "pago" : "gratis");
    })();
    return () => { vivo = false; };
  }, [ativo]);

  async function pedirGratis(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    const r = await fetch("/api/particular/gratis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cpf, telefone: tel }) })
      .then(x => x.json()).catch(() => ({ erro: "Falha de conexão. Tente de novo." }));
    setEnviando(false);
    if (r.ok) { onLiberado(mascaraTel(r.telefone)); setSituacao("livre"); return; }
    if (r.erro === "ja_usado") { setSituacao("pago"); setErro(r.mensagem); return; }
    setErro(r.erro || "Não foi possível liberar agora.");
  }

  async function pagar(id: IdAvulso) {
    setErro("");
    setPagando(id);
    const r = await fetch("/api/pagamentos/criar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ avulso: id }) })
      .then(x => x.json()).catch(() => ({ erro: "Falha de conexão." }));
    if (r.link) { window.location.assign(r.link); return; }
    setPagando(null);
    setErro(r.erro || "Não foi possível abrir o pagamento.");
  }

  if (situacao === "livre") return <>{children}</>;
  if (situacao === "carregando") return <div style={{ padding: 40, textAlign: "center", fontSize: 14, color: "#7A7670" }}>Carregando...</div>;

  if (situacao === "gratis") {
    return (
      <form onSubmit={pedirGratis} style={cartao}>
        <div style={{ color: "#16A34A", marginBottom: 8 }}><Icone nome="presente" tamanho={34} traco={1.6} /></div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1A1917", margin: "0 0 6px" }}>Anuncie grátis por {DIAS_GRATIS_PARTICULAR} dias</h1>
        <p style={{ fontSize: 14, color: "#4A4843", lineHeight: 1.55, margin: "0 0 18px" }}>
          Pessoa física tem <strong>1 anúncio grátis</strong>. Para isso pedimos seu CPF e WhatsApp, só para conferir que é um anúncio por pessoa.
        </p>
        <label style={{ display: "block", marginBottom: 12 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1A1917", display: "block", marginBottom: 5 }}>CPF</span>
          <input style={campo} inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(mascaraCpf(e.target.value))} />
        </label>
        <label style={{ display: "block", marginBottom: 14 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1A1917", display: "block", marginBottom: 5 }}>WhatsApp (com DDD)</span>
          <input style={campo} inputMode="tel" autoComplete="tel" placeholder="(73) 99999-8888" value={tel} onChange={e => setTel(mascaraTel(e.target.value))} />
        </label>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#7A7670", lineHeight: 1.5, marginBottom: 16 }}>
          <Icone nome="escudo" tamanho={16} /> <span>Seu CPF <strong>não aparece</strong> no site e não é guardado: o sistema guarda só um código embaralhado para saber que ele já foi usado.</span>
        </div>
        {erro && <div style={{ fontSize: 13, color: "#B91C1C", marginBottom: 12 }}>{erro}</div>}
        <button type="submit" disabled={enviando} style={{ width: "100%", padding: 13, background: "#FF6600", color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          {enviando ? "Conferindo..." : "Liberar meu anúncio grátis"}
        </button>
        <div style={{ fontSize: 12.5, color: "#7A7670", marginTop: 14, textAlign: "center" }}>
          É revenda? <Link href="/anunciar" style={{ color: "#FF6600", fontWeight: 600 }}>Conheça os planos para lojas</Link>
        </div>
      </form>
    );
  }

  // Já usou o grátis.
  return (
    <div style={cartao}>
      <div style={{ color: "#FF6600", marginBottom: 8 }}><Icone nome="carro" tamanho={34} traco={1.6} /></div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1A1917", margin: "0 0 6px" }}>Você já usou seu anúncio grátis</h1>
      {erro && <div style={{ fontSize: 13, color: "#B45309", margin: "0 0 10px" }}>{erro}</div>}
      {emApp ? (
        <p style={{ fontSize: 14, color: "#4A4843", lineHeight: 1.55, margin: 0 }}>
          Para anunciar outro veículo, acesse <strong>www.autoregiao.com.br</strong> pelo navegador.
        </p>
      ) : (
        <>
          <p style={{ fontSize: 14, color: "#4A4843", lineHeight: 1.55, margin: "0 0 16px" }}>Para anunciar outro veículo, escolha um <strong>anúncio avulso</strong>. Paga uma vez só, por Pix ou cartão.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 18 }}>
            {AVULSOS.map(a => (
              <button key={a.id} type="button" disabled={!!pagando} onClick={() => pagar(a.id)}
                style={{ textAlign: "left", padding: 16, borderRadius: 12, cursor: "pointer", border: a.dias === 60 ? "2px solid #FF6600" : "1.5px solid #E8E6E1", background: a.dias === 60 ? "#FFF7ED" : "#fff" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#7A7670" }}>{a.dias} dias no ar{a.dias === 60 ? " · melhor custo" : ""}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#1A1917", margin: "4px 0" }}>{formatarReais(a.preco)}</div>
                <div style={{ fontSize: 13, color: "#FF6600", fontWeight: 700 }}>{pagando === a.id ? "Abrindo o pagamento..." : "Anunciar →"}</div>
              </button>
            ))}
          </div>
          <div style={{ padding: 14, borderRadius: 10, background: "#F7F6F3", fontSize: 13.5, color: "#4A4843", lineHeight: 1.5 }}>
            <strong style={{ color: "#1A1917" }}>Vende carros com frequência?</strong> Conheça os planos para revendas, a partir de R$ 69/mês com até 15 anúncios.{" "}
            <Link href="/anunciar" style={{ color: "#FF6600", fontWeight: 700 }}>Ver planos</Link>
          </div>
        </>
      )}
    </div>
  );
}
