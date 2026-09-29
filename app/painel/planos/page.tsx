"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usuarioAtual } from "@/lib/dados/usuario";
import { buscarLojaDoUsuario } from "@/lib/dados/lojas";
import { iniciarPagamento, listarMeusPagamentos, rotuloMetodo, rotuloStatusPagamento, type PagamentoHistorico } from "@/lib/dados/pagamentos";
import { ehVitalicio, formatarReais, nomeDoPlano, PERIODOS, PLANOS, situacaoDoPlano, valorDoPeriodo, type IdPlanoPago, type MesesPeriodo } from "@/lib/planos";
import type { Loja } from "@/lib/tipos";

// Escolher plano + período e pagar pelo Mercado Pago (Pix, cartão ou boleto).
export default function Planos() {
  const [loja, setLoja] = useState<Loja | null>(null);
  const [carregado, setCarregado] = useState(false);
  const [meses, setMeses] = useState<MesesPeriodo>(1);
  const [historico, setHistorico] = useState<PagamentoHistorico[]>([]);
  const [pagando, setPagando] = useState<IdPlanoPago | null>(null);
  const [erro, setErro] = useState("");
  const [agora] = useState(() => Date.now());

  useEffect(() => {
    (async () => {
      const user = await usuarioAtual();
      if (user) {
        // Rede de segurança: ativa pagamentos já aprovados cujo aviso ainda não chegou.
        await fetch("/api/pagamentos/sincronizar", { method: "POST" }).catch(() => {});
        const { loja } = await buscarLojaDoUsuario(user.id);
        setLoja(loja);
        setHistorico(await listarMeusPagamentos());
      }
      setCarregado(true);
    })();
  }, []);

  async function pagar(plano: IdPlanoPago) {
    setErro("");
    setPagando(plano);
    const { link, erro } = await iniciarPagamento(plano, meses);
    if (link) {
      window.location.assign(link);
      return;
    }
    setPagando(null);
    setErro(erro || "Não foi possível iniciar o pagamento.");
  }

  const situacao = situacaoDoPlano(loja?.plano, loja?.expira_em, agora);
  const dataFim = loja?.expira_em ? new Date(loja.expira_em).toLocaleDateString("pt-BR") : "";

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>
      <style>{`
        .planos-painel { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 860px) { .planos-painel { grid-template-columns: 1fr !important; } }
      `}</style>

      <nav style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/logo.png" alt="AutoRegião" width={32} height={32} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: "#1A1917" }}><span style={{ color: "#E85D26" }}>Auto</span>Região</span>
        </Link>
        <Link href="/painel" style={{ fontSize: 13, color: "#7A7670", textDecoration: "none" }}>← Voltar ao painel</Link>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 16px 56px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1A1917", marginBottom: 6 }}>Planos</h1>

        {!carregado ? (
          <p style={{ fontSize: 14, color: "#7A7670" }}>Carregando...</p>
        ) : !loja ? (
          <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 20, fontSize: 14, color: "#7A7670" }}>
            Os planos são para lojas. Sua conta não tem uma loja cadastrada — como particular, você anuncia 1 veículo grátis.
          </div>
        ) : ehVitalicio(loja.plano) ? (
          <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 20, fontSize: 14, color: "#1A1917" }}>
            👑 Sua loja tem <strong>acesso vitalício</strong>: sem vencimento e sem limite de anúncios. Não é preciso pagar.
          </div>
        ) : (
          <>
            {/* SITUAÇÃO ATUAL */}
            <div style={{ fontSize: 14, color: "#7A7670", marginBottom: 20, lineHeight: 1.6 }}>
              Plano atual: <strong style={{ color: "#1A1917" }}>{nomeDoPlano(loja.plano)}</strong>
              {situacao.tipo === "em_dia" && <> · válido até <strong style={{ color: "#1A1917" }}>{dataFim}</strong> ({situacao.diasRestantes} {situacao.diasRestantes === 1 ? "dia" : "dias"})</>}
              {situacao.tipo === "carencia" && <> · <strong style={{ color: "#DC2626" }}>venceu em {dataFim}</strong> — seus anúncios saem do site em {situacao.diasAteSairDoAr} {situacao.diasAteSairDoAr === 1 ? "dia" : "dias"}</>}
              {situacao.tipo === "vencido" && <> · <strong style={{ color: "#DC2626" }}>vencido desde {dataFim}</strong> — seus anúncios estão fora do site</>}
              <br />Ao pagar, os dias são <strong style={{ color: "#1A1917" }}>somados</strong> ao que você ainda tem. Se já venceu, contam a partir de hoje.
            </div>

            {/* PERÍODO */}
            <div style={{ display: "inline-flex", background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 10, padding: 4, marginBottom: 20, gap: 4, flexWrap: "wrap" }}>
              {PERIODOS.map(p => (
                <button key={p.meses} onClick={() => setMeses(p.meses)}
                  style={{ padding: "8px 16px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: meses === p.meses ? "#E85D26" : "transparent", color: meses === p.meses ? "#fff" : "#1A1917" }}>
                  {p.rotulo}{p.desconto > 0 && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: meses === p.meses ? "#fff" : "#16A34A" }}>−{Math.round(p.desconto * 100)}%</span>}
                </button>
              ))}
            </div>

            {erro && <div style={{ background: "#FEE2E2", border: "1.5px solid #FCA5A5", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#991B1B", marginBottom: 16 }}>⚠️ {erro}</div>}

            {/* PLANOS */}
            <div className="planos-painel">
              {PLANOS.map(p => {
                const total = valorDoPeriodo(p, meses);
                const cheio = p.precoMensal * meses;
                const atual = loja.plano === p.id;
                return (
                  <div key={p.id} style={{ background: "#fff", borderRadius: 14, border: p.id === "profissional" ? "2px solid #E85D26" : "1.5px solid #E8E6E1", padding: 20, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontSize: 19, fontWeight: 800, color: "#1A1917" }}>{p.nome}</div>
                      {atual && <span style={{ fontSize: 10, fontWeight: 700, background: "#1A1917", color: "#fff", padding: "2px 8px", borderRadius: 20 }}>SEU PLANO</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#7A7670", marginBottom: 14 }}>{p.limite === null ? "Anúncios ilimitados" : `Até ${p.limite} anúncios ativos`}</div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: "#1A1917", lineHeight: 1 }}>{formatarReais(total)}</div>
                    <div style={{ fontSize: 12, color: "#7A7670", marginTop: 4, marginBottom: 14, minHeight: 32 }}>
                      {meses === 1 ? "por mês" : <>por {meses} meses · <s>{formatarReais(cheio)}</s> <span style={{ color: "#16A34A", fontWeight: 600 }}>economize {formatarReais(cheio - total)}</span></>}
                    </div>
                    {p.recursos.map(r => (
                      <div key={r} style={{ fontSize: 12.5, color: "#1A1917", marginBottom: 7, display: "flex", gap: 6 }}><span style={{ color: "#16A34A" }}>✔</span>{r}</div>
                    ))}
                    <button onClick={() => pagar(p.id)} disabled={pagando !== null}
                      style={{ marginTop: "auto", paddingTop: 12, paddingBottom: 12, background: p.id === "profissional" ? "#E85D26" : "#1A1917", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: pagando ? "default" : "pointer", opacity: pagando && pagando !== p.id ? 0.5 : 1 }}>
                      {pagando === p.id ? "Abrindo o Mercado Pago..." : atual ? "Renovar" : "Assinar"} {pagando !== p.id && `— ${formatarReais(total)}`}
                    </button>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: "#7A7670", marginTop: 14, lineHeight: 1.6 }}>
              Pagamento pelo Mercado Pago: Pix (aprovação na hora), cartão de crédito ou boleto (até 3 dias úteis). A renovação não é automática — avisamos no painel antes de vencer.
              Você pode desistir em até 7 dias após o pagamento com reembolso total (<Link href="/termos" style={{ color: "#E85D26" }}>Termos de Uso</Link>).
            </p>
          </>
        )}

        {/* HISTÓRICO */}
        {historico.length > 0 && (
          <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, marginTop: 28, overflowX: "auto" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", fontSize: 15, fontWeight: 700, color: "#1A1917" }}>Meus pagamentos</div>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr>{["Data", "Plano", "Valor", "Forma", "Situação"].map(h => <th key={h} style={{ textAlign: "left", fontSize: 11, color: "#7A7670", textTransform: "uppercase", padding: "10px 18px" }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {historico.map(h => {
                  const st = rotuloStatusPagamento(h.status);
                  return (
                    <tr key={h.id} style={{ borderTop: "1px solid #F7F6F3" }}>
                      <td style={{ padding: "10px 18px", fontSize: 13 }}>{new Date(h.criado_em).toLocaleDateString("pt-BR")}</td>
                      <td style={{ padding: "10px 18px", fontSize: 13 }}>{nomeDoPlano(h.plano)} · {h.meses} {h.meses === 1 ? "mês" : "meses"}</td>
                      <td style={{ padding: "10px 18px", fontSize: 13 }}>{formatarReais(Number(h.valor))}</td>
                      <td style={{ padding: "10px 18px", fontSize: 13 }}>{rotuloMetodo(h.metodo)}</td>
                      <td style={{ padding: "10px 18px", fontSize: 13, color: st.cor, fontWeight: 600 }}>{st.texto}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
