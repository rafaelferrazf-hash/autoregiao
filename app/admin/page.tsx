"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ehAdmin } from "@/lib/admin";
import { gerarCupom as gerarCupomNoServidor } from "@/lib/dados/cupons";
import {
  carregarResumoAdmin, estenderLoja, definirLojaAtiva, definirAnuncioAtivoAdmin, removerAnuncioAdmin,
  type ResumoAdmin,
} from "@/lib/dados/admin";
import { formatarPreco } from "@/lib/formatar";

const ABAS = ["Dashboard", "Lojas", "Anúncios", "Usuários"] as const;
type Aba = (typeof ABAS)[number];

const COR_STATUS: Record<string, { bg: string; color: string }> = {
  ativo: { bg: "#D1FAE5", color: "#065F46" },
  vitalicio: { bg: "rgba(232,93,38,0.12)", color: "#C44818" },
  assinante: { bg: "#D1FAE5", color: "#065F46" },
  trial: { bg: "#FEF3C7", color: "#92400E" },
  vencida: { bg: "#FEE2E2", color: "#991B1B" },
  desativada: { bg: "#E8E6E1", color: "#57534E" },
  pausado: { bg: "#FEE2E2", color: "#991B1B" },
};
const ROTULO_STATUS: Record<string, string> = { vitalicio: "vitalícia", assinante: "assinante", trial: "grátis", vencida: "vencida", desativada: "desativada", ativo: "ativo", pausado: "pausado" };

const cartao = { background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "20px", marginBottom: 24 } as const;
const tituloCartao = { fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 16 } as const;
const th = { textAlign: "left", fontSize: 11, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.4, padding: "0 8px 10px" } as const;
const td = { padding: "12px 8px", fontSize: 13, color: "#1A1917", verticalAlign: "middle" } as const;
const botao = { padding: "5px 10px", borderRadius: 6, border: "1.5px solid #E8E6E1", background: "#F7F6F3", fontSize: 12, fontWeight: 500, color: "#1A1917", cursor: "pointer", whiteSpace: "nowrap" } as const;
const botaoPerigo = { ...botao, color: "#991B1B", borderColor: "#FCA5A5", background: "#FEF2F2" } as const;

function Etiqueta({ status }: { status: string }) {
  const c = COR_STATUS[status] ?? COR_STATUS.ativo;
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: c.bg, color: c.color, whiteSpace: "nowrap" }}>{ROTULO_STATUS[status] ?? status}</span>;
}

const data = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");

export default function Admin() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);
  const [aba, setAba] = useState<Aba>("Dashboard");
  const [cupomGerado, setCupomGerado] = useState("");
  const [gerando, setGerando] = useState(false);
  const [resumo, setResumo] = useState<ResumoAdmin | null>(null);
  const [erroResumo, setErroResumo] = useState("");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [diasPorLoja, setDiasPorLoja] = useState<Record<string, number>>({});

  const recarregar = useCallback(async () => {
    const r = await carregarResumoAdmin();
    if (r) { setResumo(r); setErroResumo(""); }
    else setErroResumo("Não foi possível carregar os dados. Recarregue a página.");
  }, []);

  useEffect(() => {
    // O proxy.ts já barra no servidor; esta checagem é uma segunda camada.
    supabase.auth.getUser().then(({ data }) => {
      const ok = ehAdmin(data.user?.email);
      setAutorizado(ok);
      setVerificando(false);
      if (ok) recarregar();
      else router.replace("/login");
    });
  }, [router, recarregar]);

  if (verificando || !autorizado) {
    return (
      <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 13, color: "#7A7670" }}>{verificando ? "Verificando acesso..." : "Redirecionando..."}</div>
      </main>
    );
  }

  // Executa uma ação, mostra erro se houver e recarrega os dados.
  async function executar(chave: string, acao: () => Promise<{ ok: boolean; erro?: string }>) {
    setOcupado(chave);
    const r = await acao();
    setOcupado(null);
    if (!r.ok) alert("Não deu certo: " + (r.erro || "erro desconhecido"));
    await recarregar();
  }

  async function gerarCupom() {
    setGerando(true);
    const { codigo, erro } = await gerarCupomNoServidor();
    if (erro || !codigo) alert("Erro ao gerar cupom: " + (erro || "resposta vazia"));
    else setCupomGerado(codigo);
    setGerando(false);
  }

  const t = resumo?.totais;
  const n = (v: number | undefined) => (v === undefined ? "…" : v.toLocaleString("pt-BR"));
  const mesAtual = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const subtitulo: Record<Aba, string> = {
    Dashboard: `Visão geral do AutoRegião — ${mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)}`,
    Lojas: "Estender prazo, desativar ou reativar lojas. A loja vitalícia do dono fica protegida.",
    "Anúncios": "Moderação: pausar ou remover anúncios falsos ou impróprios.",
    "Usuários": "Contas cadastradas no AutoRegião.",
  };

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh" }}>

      <style>{`
        .admin-nav-links { display: flex !important; }
        .admin-hamburger { display: none !important; }
        .stats-grid-admin { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .receita-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .tabela-rolavel { overflow-x: auto; }
        @media (max-width: 768px) {
          .admin-nav-links { display: none !important; }
          .admin-hamburger { display: flex !important; }
          .stats-grid-admin { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .receita-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#1A1917", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/logo.png" alt="AutoRegião" width={28} height={28} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 800, color: "#fff" }}>
            <span style={{ color: "#E85D26" }}>Auto</span>Região
          </span>
          <span style={{ background: "#E85D26", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, marginLeft: 4 }}>ADMIN</span>
        </Link>
        <div className="admin-nav-links" style={{ gap: 20, alignItems: "center" }}>
          {ABAS.map(item => (
            <button key={item} onClick={() => setAba(item)} style={{ fontSize: 13, color: aba === item ? "#fff" : "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", fontWeight: aba === item ? 600 : 400, padding: 0 }}>{item}</button>
          ))}
          <Link href="/painel" title="Meu painel de lojista" style={{ width: 32, height: 32, borderRadius: "50%", background: "#E85D26", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>R</Link>
        </div>
        <button className="admin-hamburger" onClick={() => setMenuAberto(!menuAberto)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 8, flexDirection: "column", gap: 5 }}>
          <span style={{ display: "block", width: 24, height: 2, background: "#fff", borderRadius: 2, transition: "all 0.2s", transform: menuAberto ? "rotate(45deg) translate(5px, 5px)" : "none" }}></span>
          <span style={{ display: "block", width: 24, height: 2, background: "#fff", borderRadius: 2, opacity: menuAberto ? 0 : 1 }}></span>
          <span style={{ display: "block", width: 24, height: 2, background: "#fff", borderRadius: 2, transition: "all 0.2s", transform: menuAberto ? "rotate(-45deg) translate(5px, -5px)" : "none" }}></span>
        </button>
      </nav>

      {menuAberto && (
        <div style={{ position: "fixed", top: 60, left: 0, right: 0, zIndex: 99, background: "#1A1917", padding: "16px", display: "flex", flexDirection: "column", gap: 14, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          {ABAS.map(item => (
            <button key={item} onClick={() => { setAba(item); setMenuAberto(false); }} style={{ fontSize: 15, color: "#fff", background: "none", border: "none", textAlign: "left", fontWeight: aba === item ? 700 : 500, cursor: "pointer", padding: 0 }}>{item}</button>
          ))}
          <Link href="/painel" style={{ fontSize: 15, color: "#E85D26", textDecoration: "none", fontWeight: 500 }}>Meu painel de lojista →</Link>
        </div>
      )}

      <div style={{ padding: "76px 16px 40px", maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 800, color: "#1A1917" }}>{aba}</div>
          <div style={{ fontSize: 13, color: "#7A7670" }}>{subtitulo[aba]}</div>
          {erroResumo && <div style={{ fontSize: 13, color: "#991B1B", marginTop: 6 }}>⚠️ {erroResumo}</div>}
        </div>

        {/* ===================== DASHBOARD ===================== */}
        {aba === "Dashboard" && (
          <>
            <div className="stats-grid-admin" style={{ marginBottom: 24 }}>
              {[
                { label: "Lojas cadastradas", value: n(t?.lojas), icon: "🏪", change: t ? `+${t.lojas_7d} nos últimos 7 dias` : "", ir: "Lojas" as Aba },
                { label: "Veículos ativos", value: n(t?.veiculos_ativos), icon: "🚗", change: t ? `+${t.veiculos_7d} nos últimos 7 dias` : "", ir: "Anúncios" as Aba },
                { label: "Usuários cadastrados", value: n(t?.usuarios), icon: "👥", change: t ? `+${t.usuarios_30d} nos últimos 30 dias` : "", ir: "Usuários" as Aba },
                { label: "Contatos (30 dias)", value: n(t?.contatos_30d), icon: "💬", change: t ? `${n(t.visualizacoes_30d)} visualizações` : "", ir: null },
              ].map(s => (
                <div key={s.label} onClick={() => s.ir && setAba(s.ir)} style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "16px", cursor: s.ir ? "pointer" : "default" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.4 }}>{s.label}</div>
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                  </div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#E85D26" }}>{s.change}</div>
                </div>
              ))}
            </div>

            <div className="receita-grid" style={{ marginBottom: 24 }}>
              <div style={{ ...cartao, marginBottom: 0 }}>
                <div style={tituloCartao}>Engajamento (30 dias)</div>
                {[
                  { label: "Visualizações de anúncios", valor: t?.visualizacoes_30d },
                  { label: "Cliques em WhatsApp / Ligar", valor: t?.contatos_30d },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F7F6F3" }}>
                    <span style={{ fontSize: 13, color: "#1A1917", fontWeight: 500 }}>{r.label}</span>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: "#1A1917" }}>{n(r.valor)}</span>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: "#7A7670", marginTop: 10 }}>Receita aparece aqui quando os pagamentos (Mercado Pago) estiverem ativos.</div>
              </div>
              <div style={{ ...cartao, marginBottom: 0 }}>
                <div style={tituloCartao}>Lojas por status</div>
                {[
                  { label: "Vitalícias (dono)", valor: resumo?.status.vitalicio, s: "vitalicio" },
                  { label: "Assinantes", valor: resumo?.status.assinante, s: "assinante" },
                  { label: "Em período grátis", valor: resumo?.status.trial, s: "trial" },
                  { label: "Período vencido", valor: resumo?.status.vencida, s: "vencida" },
                  { label: "Desativadas", valor: resumo?.status.desativada, s: "desativada" },
                ].map(s => (
                  <div key={s.label} onClick={() => setAba("Lojas")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: COR_STATUS[s.s].bg, borderRadius: 8, marginBottom: 8, cursor: "pointer" }}>
                    <span style={{ fontSize: 13, color: COR_STATUS[s.s].color, fontWeight: 500 }}>{s.label}</span>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: COR_STATUS[s.s].color }}>{n(s.valor)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CUPONS */}
            <div style={cartao}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ ...tituloCartao, marginBottom: 0 }}>🎟️ Cupons de extensão</div>
                <button onClick={gerarCupom} disabled={gerando}
                  style={{ padding: "6px 14px", background: gerando ? "#C44818" : "#E85D26", border: "none", borderRadius: 7, color: "#fff", fontSize: 12, fontWeight: 600, cursor: gerando ? "default" : "pointer", opacity: gerando ? 0.7 : 1 }}>
                  {gerando ? "Gerando..." : "+ Gerar cupom"}
                </button>
              </div>
              {cupomGerado && (
                <div style={{ background: "#D1FAE5", border: "1.5px solid #6EE7B7", borderRadius: 10, padding: "16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#065F46", fontWeight: 600, marginBottom: 4 }}>CUPOM GERADO E SALVO</div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800, color: "#065F46", letterSpacing: 2 }}>{cupomGerado}</div>
                    <div style={{ fontSize: 12, color: "#065F46", marginTop: 4 }}>Válido para 1 uso · Estende por 30 dias</div>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(cupomGerado); alert("Copiado!"); }}
                    style={{ padding: "8px 16px", background: "#065F46", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    📋 Copiar
                  </button>
                </div>
              )}
              <div style={{ fontSize: 13, color: "#7A7670", lineHeight: 1.6 }}>
                Gere cupons para o lojista estender o próprio período em 30 dias. Para estender direto, sem cupom, use a aba Lojas.
              </div>
            </div>
          </>
        )}

        {/* ===================== LOJAS ===================== */}
        {aba === "Lojas" && (
          <div style={cartao}>
            <div style={tituloCartao}>Lojas cadastradas ({n(resumo?.lojas.length)})</div>
            <div className="tabela-rolavel">
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #E8E6E1" }}>
                    {["Loja", "Plano", "Veículos", "Status", "Vencimento", "Ações"].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(resumo?.lojas ?? []).map(loja => {
                    const dias = diasPorLoja[loja.id] ?? 30;
                    const trabalhando = ocupado === loja.id;
                    return (
                      <tr key={loja.id} style={{ borderBottom: "1px solid #F7F6F3", opacity: trabalhando ? 0.5 : 1 }}>
                        <td style={td}>
                          <Link href={`/loja/${loja.id}`} style={{ fontWeight: 600, color: "#1A1917", textDecoration: "none" }}>{loja.nome}</Link>
                          <div style={{ fontSize: 11, color: "#7A7670" }}>📍 {loja.cidade || "—"}</div>
                        </td>
                        <td style={td}>{loja.plano}</td>
                        <td style={td}>{loja.veiculos}</td>
                        <td style={td}><Etiqueta status={loja.status} /></td>
                        <td style={{ ...td, fontSize: 12, color: "#7A7670" }}>{loja.vencimento}</td>
                        <td style={td}>
                          {loja.protegida ? (
                            <span style={{ fontSize: 12, color: "#7A7670" }}>👑 Protegida (dono)</span>
                          ) : (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                              <select value={dias} disabled={trabalhando} onChange={e => setDiasPorLoja(d => ({ ...d, [loja.id]: Number(e.target.value) }))}
                                style={{ ...botao, padding: "4px 6px" }}>
                                {[7, 15, 30, 60, 90, 180, 365].map(d => <option key={d} value={d}>+{d} dias</option>)}
                              </select>
                              <button disabled={trabalhando} style={botao}
                                onClick={() => executar(loja.id, () => estenderLoja(loja.id, dias))}>Estender</button>
                              {loja.ativo ? (
                                <button disabled={trabalhando} style={botaoPerigo}
                                  onClick={() => window.confirm(`Desativar a loja "${loja.nome}"?\n\nA página da loja e todos os anúncios dela saem do site até você reativar.`) && executar(loja.id, () => definirLojaAtiva(loja.id, false))}>Desativar</button>
                              ) : (
                                <button disabled={trabalhando} style={botao}
                                  onClick={() => executar(loja.id, () => definirLojaAtiva(loja.id, true))}>Reativar</button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== ANÚNCIOS ===================== */}
        {aba === "Anúncios" && (
          <div style={cartao}>
            <div style={tituloCartao}>Todos os anúncios ({n(resumo?.anuncios.length)})</div>
            <div className="tabela-rolavel">
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #E8E6E1" }}>
                    {["Veículo", "Loja", "Preço", "Status", "Publicado", "Ações"].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(resumo?.anuncios ?? []).map(a => {
                    const trabalhando = ocupado === a.id;
                    return (
                      <tr key={a.id} style={{ borderBottom: "1px solid #F7F6F3", opacity: trabalhando ? 0.5 : 1 }}>
                        <td style={{ ...td, fontWeight: 600 }}>{a.nome}</td>
                        <td style={{ ...td, color: "#7A7670" }}>{a.loja}</td>
                        <td style={{ ...td, fontFamily: "Georgia, serif", fontWeight: 700 }}>{formatarPreco(a.preco)}</td>
                        <td style={td}><Etiqueta status={a.ativo ? "ativo" : "pausado"} /></td>
                        <td style={{ ...td, fontSize: 12, color: "#7A7670" }}>{data(a.criado_em)}</td>
                        <td style={td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Link href={`/veiculo/${a.id}`} style={{ ...botao, textDecoration: "none" }}>Ver</Link>
                            <button disabled={trabalhando} style={botao}
                              onClick={() => executar(a.id, () => definirAnuncioAtivoAdmin(a.id, !a.ativo))}>{a.ativo ? "Pausar" : "Reativar"}</button>
                            <button disabled={trabalhando} style={botaoPerigo}
                              onClick={() => window.confirm(`Remover o anúncio "${a.nome}" de vez?\n\nEle e as fotos são apagados e não dá para desfazer. Para só tirar do ar, use Pausar.`) && executar(a.id, () => removerAnuncioAdmin(a.id))}>Remover</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== USUÁRIOS ===================== */}
        {aba === "Usuários" && (
          <div style={cartao}>
            <div style={tituloCartao}>Usuários cadastrados ({n(resumo?.usuarios.length)})</div>
            <div className="tabela-rolavel">
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #E8E6E1" }}>
                    {["Usuário", "Loja", "Cadastro", "E-mail confirmado", "Último acesso"].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(resumo?.usuarios ?? []).map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #F7F6F3" }}>
                      <td style={td}>
                        <div style={{ fontWeight: 600 }}>{u.nome || "—"} {u.admin && <span style={{ fontSize: 10, fontWeight: 700, background: "#E85D26", color: "#fff", padding: "1px 6px", borderRadius: 4, marginLeft: 4 }}>ADMIN</span>}</div>
                        <div style={{ fontSize: 12, color: "#7A7670" }}>{u.email}</div>
                      </td>
                      <td style={{ ...td, color: u.loja ? "#1A1917" : "#7A7670" }}>{u.loja ?? "—"}</td>
                      <td style={{ ...td, fontSize: 12 }}>{data(u.cadastro)}</td>
                      <td style={td}>{u.confirmado ? <span style={{ color: "#16A34A", fontWeight: 600, fontSize: 12 }}>✓ Sim</span> : <span style={{ color: "#92400E", fontWeight: 600, fontSize: 12 }}>Pendente</span>}</td>
                      <td style={{ ...td, fontSize: 12, color: "#7A7670" }}>{data(u.ultimo_acesso)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
