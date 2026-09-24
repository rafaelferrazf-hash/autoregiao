"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usuarioAtual, sair } from "@/lib/dados/usuario";
import { resgatarCupom as resgatarCupomNoBanco } from "@/lib/dados/cupons";
import { buscarLojaDoUsuario } from "@/lib/dados/lojas";
import { listarVeiculosDoUsuario } from "@/lib/dados/veiculos";
import { formatarPreco, formatarKm } from "@/lib/formatar";
import { buscarEstatisticasPainel, type EstatisticasPainel } from "@/lib/dados/eventos";
import type { Loja } from "@/lib/tipos";
import { ehVitalicio } from "@/lib/planos";

export default function Painel() {
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [nomeUsuario, setNomeUsuario] = useState("...");
  const [nomeLoja, setNomeLoja] = useState("Minha Loja");
  const [anunciosReais, setAnunciosReais] = useState<Awaited<ReturnType<typeof listarVeiculosDoUsuario>>["veiculos"]>([]);
  const [lojaId, setLojaId] = useState<string | null>(null);
  const [loja, setLoja] = useState<Loja | null>(null);
  const [stats, setStats] = useState<EstatisticasPainel | null>(null);

  useEffect(() => {
    (async () => {
      const user = await usuarioAtual();
      if (!user) return;
      const nome = user.user_metadata?.nome || user.email || "Lojista";
      setNomeUsuario(nome.split(" ")[0]);

      const { loja } = await buscarLojaDoUsuario(user.id);
      if (loja?.nome) setNomeLoja(loja.nome);
      if (loja?.id) setLojaId(loja.id);
      setLoja(loja);

      // Anúncios pelo usuario_id OU loja_id
      const { veiculos } = await listarVeiculosDoUsuario(user.id, loja?.id);
      setAnunciosReais(veiculos);

      setStats(await buscarEstatisticasPainel());
    })();
  }, []);

  // CUPOM
  const [cupom, setCupom] = useState("");
  const [cupomStatus, setCupomStatus] = useState<null | "ok" | "erro" | "loading" | "invalido" | "usado">(null);

  const resgatarCupom = async () => {
    const codigo = cupom.trim().toUpperCase();
    const regex = /^AR-[A-Z0-9]{6}$/;
    if (!regex.test(codigo)) { setCupomStatus("invalido"); return; }
    setCupomStatus("loading");
    const resultado = await resgatarCupomNoBanco(codigo);
    if (resultado === "ok") setCupomStatus("ok");
    else if (resultado === "usado" || resultado === "ja_resgatado") setCupomStatus("usado");
    else setCupomStatus("erro");
  };

  const mensagemCupom = () => {
    if (cupomStatus === "ok") return { cor: "#16A34A", texto: "✅ Cupom aplicado! +30 dias adicionados ao seu período." };
    if (cupomStatus === "invalido") return { cor: "#DC2626", texto: "❌ Formato inválido. Use AR-XXXXXX." };
    if (cupomStatus === "erro") return { cor: "#DC2626", texto: "❌ Cupom não encontrado ou inválido." };
    if (cupomStatus === "usado") return { cor: "#DC2626", texto: "❌ Este cupom já foi utilizado." };
    return null;
  };

  const statusBadge = (status: string | null) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      destaque: { bg: "rgba(232,93,38,0.08)", color: "#E85D26", label: "⭐ Destaque" },
      ativo: { bg: "rgba(22,163,74,0.08)", color: "#16A34A", label: "✅ Ativo" },
      pausado: { bg: "#F7F6F3", color: "#7A7670", label: "⏸ Pausado" },
      analise: { bg: "rgba(37,99,235,0.08)", color: "#2563EB", label: "🕐 Análise" },
    };
    const s = (status && map[status]) || map["ativo"];
    return <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 20, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{s.label}</span>;
  };

  const msg = mensagemCupom();
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  // Plano e período grátis reais (tabela lojas). A regra de bloqueio ao vencer fica para a Fase 4.
  // Plano "vitalicio" (conta do dono): sem vencimento e sem limite de anúncios.
  const vitalicio = ehVitalicio(loja?.plano);
  const expiraEm = !vitalicio && loja?.expira_em ? new Date(loja.expira_em) : null;
  const diasRestantes = expiraEm ? Math.ceil((expiraEm.getTime() - Date.now()) / 86_400_000) : null;
  const periodoVencido = diasRestantes !== null && diasRestantes <= 0;
  const nomePlano = !loja ? "Sem loja" : vitalicio ? "Acesso vitalício" : loja.plano === "trial" || !loja.plano ? "Período grátis" : `Plano ${loja.plano.charAt(0).toUpperCase()}${loja.plano.slice(1)}`;
  const dataFim = expiraEm ? expiraEm.toLocaleDateString("pt-BR") : "";
  const textoPeriodo = diasRestantes === null ? "—"
    : periodoVencido ? `Encerrado em ${dataFim}`
    : `${diasRestantes} ${diasRestantes === 1 ? "dia restante" : "dias restantes"}`;

  const variacao = (atual: number, anterior: number) => {
    if (!anterior) return atual > 0 ? { texto: "novo este mês", up: true } : { texto: "últimos 30 dias", up: false };
    const pct = Math.round(((atual - anterior) / anterior) * 100);
    return { texto: `${pct >= 0 ? "▲" : "▼"} ${Math.abs(pct)}% vs mês anterior`, up: pct >= 0 };
  };
  const varVisitas = variacao(stats?.visualizacoes_30d ?? 0, stats?.visualizacoes_30d_anterior ?? 0);
  const varContatos = variacao(stats?.contatos_30d ?? 0, stats?.contatos_30d_anterior ?? 0);
  const visitas7d = stats?.visitas_7d ?? [];
  const maxVisitas = Math.max(1, ...visitas7d.map(v => v.total));
  const totalVisitas7d = visitas7d.reduce((soma, v) => soma + v.total, 0);
  const contatosRecentes = stats?.contatos_recentes ?? [];
  const tempoAtras = (iso: string) => {
    const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
    if (min < 60) return `${min}min`;
    if (min < 1440) return `${Math.round(min / 60)}h`;
    return `${Math.round(min / 1440)}d`;
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", minHeight: "100vh", background: "#F7F6F3" }}>

      <style>{`
        .sidebar-desktop { display: flex !important; }
        .main-content { margin-left: 240px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .dashboard-grid { display: grid; grid-template-columns: 1fr 300px; gap: 16px; }
        .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .tabela-desktop { display: table !important; }
        .cards-mobile { display: none !important; }
        .tab-bar { display: none !important; }
        .header-novo { display: inline-flex !important; }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .main-content { margin-left: 0 !important; padding-bottom: 70px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .dashboard-grid { grid-template-columns: 1fr !important; }
          .bottom-grid { grid-template-columns: 1fr !important; }
          .tabela-desktop { display: none !important; }
          .cards-mobile { display: flex !important; }
          .tab-bar { display: flex !important; }
          .header-novo { display: none !important; }
        }
      `}</style>

      {/* SIDEBAR DESKTOP */}
      <aside className="sidebar-desktop" style={{ width: 240, background: "#111009", minHeight: "100vh", position: "fixed", top: 0, left: 0, flexDirection: "column", zIndex: 50 }}>
        <Link href="/" style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo.png" alt="AutoRegião" width={32} height={32} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 800, color: "#fff" }}><span style={{ color: "#E85D26" }}>Auto</span>Região</span>
        </Link>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, background: "#E85D26", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏪</div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>{nomeLoja}</div>
            <div style={{ fontSize: 10, color: "#E85D26", fontWeight: 500, marginTop: 1 }}>{nomePlano}</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 1 }}>
          {[
            { id: "dashboard", icon: "📊", label: "Dashboard" },
            { id: "anuncios", icon: "🚗", label: "Meus Anúncios", badge: anunciosReais.length > 0 ? String(anunciosReais.length) : undefined },
            { id: "novo", icon: "➕", label: "Novo Anúncio" },
            { id: "mensagens", icon: "💬", label: "Mensagens" },
            { id: "avaliacoes", icon: "⭐", label: "Avaliações" },
            { id: "estatisticas", icon: "📈", label: "Estatísticas" },
            { id: "plano", icon: "💳", label: "Plano & Pagamento" },
            { id: "perfil", icon: "🏪", label: "Perfil da Loja" },
            { id: "config", icon: "⚙️", label: "Configurações" },
          ].map(item => (
            item.id === "novo"
              ? <Link key={item.id} href="/painel/novo-anuncio" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 13.5, fontWeight: 500, textDecoration: "none", width: "100%" }}>
                  <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>➕</span>
                  <span>Novo Anúncio</span>
                </Link>
              : <button key={item.id} onClick={() => setAbaAtiva(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: abaAtiva === item.id ? "#E85D26" : "transparent", color: abaAtiva === item.id ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 13.5, fontWeight: 500, cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "'DM Sans', sans-serif" }}>
                <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && <span style={{ background: abaAtiva === item.id ? "rgba(255,255,255,0.25)" : "#E85D26", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{item.badge}</span>}
              </button>
          ))}
        </nav>
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ background: "rgba(232,93,38,0.12)", border: "1px solid rgba(232,93,38,0.25)", borderRadius: 10, padding: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: "#E85D26", fontWeight: 500, marginBottom: 4 }}>ANÚNCIOS ATIVOS</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{anunciosReais.length} cadastrado{anunciosReais.length !== 1 ? "s" : ""}</div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 4, marginBottom: 6 }}>
              <div style={{ background: "#E85D26", height: 4, borderRadius: 4, width: `${Math.min((anunciosReais.length / 30) * 100, 100)}%` }}></div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{vitalicio ? "Sem limite de anúncios" : `${Math.max(30 - anunciosReais.length, 0)} slots disponíveis`}</div>
          </div>
          <button
            onClick={async () => { await sair(); window.location.href = "/login"; }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: "transparent", color: "rgba(255,255,255,0.35)", fontSize: 12.5, cursor: "pointer", width: "100%", fontFamily: "'DM Sans', sans-serif" }}>
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* HEADER */}
        <header style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", padding: "0 16px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40 }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 800, color: "#1A1917" }}>Dashboard</div>
            <div style={{ fontSize: 10, color: "#7A7670", textTransform: "capitalize" }}>{hoje}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/painel/novo-anuncio" className="header-novo" style={{ padding: "7px 14px", background: "#E85D26", borderRadius: 7, fontFamily: "Georgia, serif", fontSize: 12, fontWeight: 700, color: "#fff", textDecoration: "none", alignItems: "center" }}>+ Novo Anúncio</Link>
            <div style={{ width: 34, height: 34, border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, position: "relative" }}>
              🔔<span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, background: "#E85D26", borderRadius: "50%", border: "1.5px solid #fff" }}></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#F7F6F3", cursor: "pointer" }}>
              <div style={{ width: 26, height: 26, background: "#E85D26", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>👤</div>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#1A1917" }}>{nomeUsuario}</span>
            </div>
          </div>
        </header>

        <div style={{ padding: "16px", flex: 1 }}>

          {/* AVISO */}
          {!vitalicio && <div style={{ background: "rgba(232,93,38,0.08)", border: "1px solid rgba(232,93,38,0.2)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>⏳</span>
              <div style={{ fontSize: 13, color: "#1A1917" }}>{diasRestantes === null ? "Sua conta ainda não tem uma loja vinculada." : periodoVencido ? <>Seu período gratuito <strong style={{ color: "#E85D26" }}>terminou em {dataFim}</strong>. Use um cupom em &quot;Meu plano&quot; ou assine um plano.</> : <>Período gratuito termina em <strong style={{ color: "#E85D26" }}>{diasRestantes} {diasRestantes === 1 ? "dia" : "dias"}</strong>.</>}</div>
            </div>
            <a href="#" style={{ fontSize: 12, fontWeight: 500, color: "#E85D26", textDecoration: "none" }}>Ver planos →</a>
          </div>}

          {/* STATS */}
          <div className="stats-grid" style={{ marginBottom: 16 }}>
            {[
              { label: "Visualizações (30 dias)", value: stats ? stats.visualizacoes_30d.toLocaleString("pt-BR") : "—", change: varVisitas.texto, up: varVisitas.up, icon: "👁️", bg: "rgba(232,93,38,0.08)" },
              { label: "Contatos (30 dias)", value: stats ? stats.contatos_30d.toLocaleString("pt-BR") : "—", change: varContatos.texto, up: varContatos.up, icon: "💬", bg: "rgba(22,163,74,0.08)" },
              { label: "Anúncios ativos", value: String(anunciosReais.length), change: vitalicio ? "sem limite" : "30 limite", up: false, icon: "🚗", bg: "rgba(37,99,235,0.08)" },
              vitalicio
                ? { label: "Plano", value: "Vitalício", change: "sem vencimento", up: true, icon: "👑", bg: "rgba(232,93,38,0.08)" }
                : { label: "Período grátis", value: diasRestantes === null ? "—" : periodoVencido ? "Encerrado" : String(diasRestantes), change: diasRestantes === null ? "sem loja" : periodoVencido ? `em ${dataFim}` : diasRestantes === 1 ? "dia restante" : "dias restantes", up: !periodoVencido, icon: "⏳", bg: "rgba(232,93,38,0.08)" },
            ].map(stat => (
              <div key={stat.label} style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "#7A7670", fontWeight: 500 }}>{stat.label}</span>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{stat.icon}</div>
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 800, color: "#1A1917", lineHeight: 1, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: stat.up ? "#16A34A" : "#7A7670" }}>{stat.change}</div>
              </div>
            ))}
          </div>

          {/* DASHBOARD GRID */}
          <div className="dashboard-grid" style={{ marginBottom: 16 }}>

            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Anúncios recentes</div>
                <a href="#" style={{ fontSize: 12, color: "#E85D26", fontWeight: 500, textDecoration: "none" }}>Ver todos →</a>
              </div>

              {anunciosReais.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🚗</div>
                  <div style={{ fontSize: 13, color: "#7A7670", marginBottom: 12 }}>Nenhum anúncio cadastrado ainda.</div>
                  <Link href="/painel/novo-anuncio" style={{ padding: "8px 16px", background: "#E85D26", color: "#fff", borderRadius: 7, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>+ Criar primeiro anúncio</Link>
                </div>
              ) : (
                <>
                  <table className="tabela-desktop" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F7F6F3" }}>
                        {["Veículo", "Status", "Preço", "Ações"].map(h => (
                          <th key={h} style={{ padding: "9px 14px", fontSize: 10, fontWeight: 500, color: "#7A7670", textAlign: "left", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {anunciosReais.slice(0, 5).map(car => (
                        <tr key={car.id} style={{ borderBottom: "1px solid #E8E6E1" }}>
                          <td style={{ padding: "11px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <div style={{ width: 48, height: 36, borderRadius: 6, overflow: "hidden", flexShrink: 0, border: "1px solid #E8E6E1", background: "#F7F6F3" }}>
                                {car.fotos && car.fotos.length > 0
                                  ? <img src={car.fotos[0]} alt={car.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  : <Image src="/sem-foto.png" alt={car.nome} width={48} height={36} style={{ objectFit: "cover" }} />
                                }
                              </div>
                              <div>
                                <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917" }}>{car.nome}</div>
                                <div style={{ fontSize: 11, color: "#7A7670" }}>{car.ano} · {formatarKm(car.km)}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "11px 14px" }}>{statusBadge(car.status || "ativo")}</td>
                          <td style={{ padding: "11px 14px", fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917" }}>{formatarPreco(car.preco)}</td>
                          <td style={{ padding: "11px 14px" }}>
                            <div style={{ display: "flex", gap: 5 }}>
                              <Link href={`/veiculo/${car.id}`} style={{ width: 28, height: 28, borderRadius: 6, border: "1.5px solid #E8E6E1", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, textDecoration: "none" }}>👁️</Link>
                              <button style={{ width: 28, height: 28, borderRadius: 6, border: "1.5px solid #E8E6E1", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12 }}>✏️</button>
                              <button style={{ width: 28, height: 28, borderRadius: 6, border: "1.5px solid #E8E6E1", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12 }}>⏸️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="cards-mobile" style={{ flexDirection: "column" }}>
                    {anunciosReais.slice(0, 5).map(car => (
                      <div key={car.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #E8E6E1" }}>
                        <div style={{ width: 56, height: 42, borderRadius: 7, overflow: "hidden", flexShrink: 0, border: "1px solid #E8E6E1", background: "#F7F6F3" }}>
                          {car.fotos && car.fotos.length > 0
                            ? <img src={car.fotos[0]} alt={car.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <Image src="/sem-foto.png" alt={car.nome} width={56} height={42} style={{ objectFit: "cover" }} />
                          }
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917", marginBottom: 2 }}>{car.nome}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {statusBadge(car.status || "ativo")}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917" }}>{formatarPreco(car.preco)}</div>
                          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                            <Link href={`/veiculo/${car.id}`} style={{ width: 26, height: 26, borderRadius: 5, border: "1.5px solid #E8E6E1", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, textDecoration: "none" }}>👁️</Link>
                            <button style={{ width: 26, height: 26, borderRadius: 5, border: "1.5px solid #E8E6E1", background: "#F7F6F3", cursor: "pointer", fontSize: 11 }}>⏸️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Contatos recentes</div>
                </div>
                {contatosRecentes.length === 0 ? (
                  <div style={{ padding: "18px 16px", fontSize: 12, color: "#7A7670", lineHeight: 1.5 }}>Nenhum contato ainda. Quando alguém clicar em WhatsApp ou Ligar nos seus anúncios, aparece aqui.</div>
                ) : contatosRecentes.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: i < contatosRecentes.length - 1 ? "1px solid #E8E6E1" : "none" }}>
                    <div style={{ width: 32, height: 32, background: "#F7F6F3", border: "1px solid #E8E6E1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{c.tipo === "whatsapp" ? "💬" : "📞"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#1A1917" }}>{c.tipo === "whatsapp" ? "Clique no WhatsApp" : "Clique em Ligar"}</div>
                      <div style={{ fontSize: 11, color: "#7A7670" }}>{c.veiculo}</div>
                    </div>
                    <div style={{ fontSize: 10.5, color: "#7A7670" }}>{tempoAtras(c.criado_em)}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Visitas esta semana</div>
                </div>
                <div style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70, marginBottom: 8 }}>
                    {visitas7d.map((v, i) => {
                      const barraHoje = i === visitas7d.length - 1;
                      const dia = new Date(v.dia + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
                      return (
                        <div key={v.dia} title={`${v.total} visita${v.total === 1 ? "" : "s"}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ width: "100%", height: Math.max(3, Math.round((v.total / maxVisitas) * 60)), background: barraHoje ? "#E85D26" : "rgba(232,93,38,0.25)", borderRadius: "4px 4px 0 0" }}></div>
                          <span style={{ fontSize: 9, color: "#7A7670", textTransform: "capitalize" }}>{dia}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7A7670" }}>
                    <span>Últimos 7 dias</span>
                    <span>Total: <strong style={{ color: "#1A1917" }}>{totalVisitas7d}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM GRID */}
          <div className="bottom-grid">
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Ações rápidas</div>
              </div>
              <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["➕", "Novo anúncio"], ["⭐", "Destaque"], ["📊", "Estatísticas"], ["🏪", "Editar perfil"], ["📱", "QR Code"], ["💬", "Mensagens"]].map(([icon, label]) => (
                  <button key={label} style={{ padding: 12, border: "1.5px solid #E8E6E1", borderRadius: 10, background: "#F7F6F3", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 5 }}>{icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "#1A1917" }}>{label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Meu plano</div>
                <a href="#" style={{ fontSize: 12, color: "#E85D26", fontWeight: 500, textDecoration: "none" }}>Alterar →</a>
              </div>
              <div style={{ padding: "0 18px" }}>
                {(vitalicio
                  ? [["Plano atual", "👑 Acesso vitalício", "#E85D26"], ["Anúncios usados", `${anunciosReais.length} (sem limite)`, "#1A1917"], ["Vencimento", "Nunca", "#16A34A"]]
                  : [["Plano atual", nomePlano, "#E85D26"], ["Anúncios usados", `${anunciosReais.length} / 30`, "#1A1917"], ["Período gratuito", textoPeriodo, periodoVencido ? "#DC2626" : "#E85D26"], ["Destaque patrocinado", "Não contratado", "#7A7670"]]
                ).map(([label, value, color]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E8E6E1" }}>
                    <span style={{ fontSize: 12.5, color: "#7A7670" }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color }}>{value}</span>
                  </div>
                ))}
              </div>
              {!vitalicio && <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#F7F6F3", border: "1.5px solid #E8E6E1", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#7A7670", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>🎟️ Resgatar cupom</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="text" placeholder="AR-XXXXXX" value={cupom}
                      onChange={e => { setCupom(e.target.value.toUpperCase()); setCupomStatus(null); }}
                      maxLength={9} disabled={cupomStatus === "ok"}
                      style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${cupomStatus === "invalido" || cupomStatus === "erro" || cupomStatus === "usado" ? "#DC2626" : "#E8E6E1"}`, borderRadius: 7, fontSize: 13, fontFamily: "'DM Sans', sans-serif", background: "#fff", color: "#1A1917", outline: "none", letterSpacing: 1 }}
                    />
                    <button onClick={resgatarCupom} disabled={cupomStatus === "loading" || cupomStatus === "ok"}
                      style={{ padding: "8px 14px", background: cupomStatus === "ok" ? "#16A34A" : "#E85D26", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: cupomStatus === "loading" || cupomStatus === "ok" ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" as const, opacity: cupomStatus === "loading" ? 0.7 : 1 }}>
                      {cupomStatus === "loading" ? "..." : cupomStatus === "ok" ? "✅ Ok" : "Resgatar"}
                    </button>
                  </div>
                  {msg && <div style={{ fontSize: 11, color: msg.cor, marginTop: 6, fontWeight: 500 }}>{msg.texto}</div>}
                </div>
                <button style={{ width: "100%", padding: 10, background: "#E85D26", color: "#fff", border: "none", borderRadius: 8, fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  Assinar plano — R$ 159/mês
                </button>
              </div>}
            </div>
          </div>
        </div>
      </div>

      {/* TAB BAR MOBILE */}
      <div className="tab-bar" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#111009", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8px 0", zIndex: 50, justifyContent: "space-around", alignItems: "center" }}>
        {[
          { id: "dashboard", icon: "📊", label: "Início" },
          { id: "anuncios", icon: "🚗", label: "Anúncios" },
          { id: "novo", icon: "➕", label: "Novo", link: "/painel/novo-anuncio" },
          { id: "mensagens", icon: "💬", label: "Msgs" },
          { id: "config", icon: "⚙️", label: "Mais" },
        ].map(item => (
          item.link
            ? <Link key={item.id} href={item.link} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, textDecoration: "none", padding: "4px 12px" }}>
                <div style={{ width: 36, height: 36, background: "#E85D26", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{item.icon}</div>
                <span style={{ fontSize: 10, color: "#E85D26", fontWeight: 600 }}>{item.label}</span>
              </Link>
            : <button key={item.id} onClick={() => setAbaAtiva(item.id)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 12px", position: "relative" }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 10, color: abaAtiva === item.id ? "#E85D26" : "rgba(255,255,255,0.4)", fontWeight: abaAtiva === item.id ? 600 : 400 }}>{item.label}</span>
              </button>
        ))}
      </div>

    </div>
  );
}