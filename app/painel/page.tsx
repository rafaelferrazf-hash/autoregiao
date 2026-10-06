"use client";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import LogoLoja from "@/components/LogoLoja";
import { useEmAppDaLoja } from "@/lib/appLoja";
import { useState, useEffect } from "react";
import { usuarioAtual, sair } from "@/lib/dados/usuario";
import ExcluirConta from "@/components/ExcluirConta";
import { ehAdmin } from "@/lib/admin";
import { resgatarCupom as resgatarCupomNoBanco } from "@/lib/dados/cupons";
import { buscarLojaDoUsuario } from "@/lib/dados/lojas";
import { marcarVendido, listarVeiculosDoUsuario, definirAnuncioAtivo, excluirVeiculo } from "@/lib/dados/veiculos";
import { formatarPreco, formatarKm } from "@/lib/formatar";
import { buscarEstatisticasPainel, type EstatisticasPainel } from "@/lib/dados/eventos";
import type { Loja } from "@/lib/tipos";
import { ehVitalicio, limiteDoPlano, mensagemErroAnuncio, nomeDoPlano, situacaoDoPlano } from "@/lib/planos";
import PerfilLoja from "@/components/PerfilLoja";
import Icone, { type NomeIcone } from "@/components/Icone";

export default function Painel() {
  // Dentro dos apps das lojas: sem cupom nem compra de plano (ver lib/appLoja.ts).
  const emApp = useEmAppDaLoja();
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [nomeUsuario, setNomeUsuario] = useState("...");
  const [nomeLoja, setNomeLoja] = useState("Minha Loja");
  const [anunciosReais, setAnunciosReais] = useState<Awaited<ReturnType<typeof listarVeiculosDoUsuario>>["veiculos"]>([]);
  const [lojaId, setLojaId] = useState<string | null>(null);
  // Atalho para o /admin, só para o dono (a checagem de verdade é no servidor/proxy).
  const [souAdmin, setSouAdmin] = useState(false);
  const [loja, setLoja] = useState<Loja | null>(null);
  const [lojaCarregada, setLojaCarregada] = useState(false);
  const [stats, setStats] = useState<EstatisticasPainel | null>(null);
  // Hora lida uma vez ao abrir o painel (cálculo de dias restantes e "há X min").
  const [agora] = useState(() => Date.now());

  useEffect(() => {
    (async () => {
      const user = await usuarioAtual();
      if (!user) return;
      setSouAdmin(ehAdmin(user.email));
      const nome = user.user_metadata?.nome || user.email || "Lojista";
      setNomeUsuario(nome.split(" ")[0]);

      const { loja } = await buscarLojaDoUsuario(user.id);
      if (loja?.nome) setNomeLoja(loja.nome);
      if (loja?.id) setLojaId(loja.id);
      setLoja(loja);
      setLojaCarregada(true);

      // Anúncios pelo usuario_id OU loja_id
      const { veiculos } = await listarVeiculosDoUsuario(user.id, loja?.id);
      setAnunciosReais(veiculos);

      setStats(await buscarEstatisticasPainel());
    })();
  }, []);

  // AÇÕES NOS ANÚNCIOS
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<string | null>(null);
  type Anuncio = (typeof anunciosReais)[number];

  const alternarPausa = async (car: Anuncio) => {
    const reativar = car.ativo === false;
    setAcaoEmAndamento(car.id);
    const { error } = await definirAnuncioAtivo(car.id, reativar);
    setAcaoEmAndamento(null);
    if (error) return alert(mensagemErroAnuncio(error.message) ?? "Não foi possível " + (reativar ? "reativar" : "pausar") + " o anúncio. Tente de novo.");
    setAnunciosReais(lista => lista.map(a => a.id === car.id ? { ...a, ativo: reativar, status: reativar ? "ativo" : "pausado" } : a));
  };

  const finalizar = async (car: Anuncio) => {
    if (!window.confirm(`Marcar "${car.nome}" como VENDIDO?\n\nEle sai do site e fica no painel como "Vendido", com as visualizações e contatos que teve. Não conta no limite do plano e não volta mais ao ar.`)) return;
    setAcaoEmAndamento(car.id);
    const { error } = await marcarVendido(car.id);
    setAcaoEmAndamento(null);
    if (error) return alert("Não foi possível marcar como vendido. Tente de novo.");
    setAnunciosReais(lista => lista.map(a => a.id === car.id ? { ...a, ativo: false, status: "vendido" } : a));
  };

  const excluir = async (car: Anuncio) => {
    if (!window.confirm(`Excluir o anúncio "${car.nome}"?\n\nEle sai do site e não dá para desfazer. Se quiser só tirar do ar por um tempo, use Pausar.`)) return;
    setAcaoEmAndamento(car.id);
    const { error } = await excluirVeiculo(car.id, car.fotos);
    setAcaoEmAndamento(null);
    if (error) return alert("Não foi possível excluir o anúncio. Tente de novo.");
    setAnunciosReais(lista => lista.filter(a => a.id !== car.id));
  };

  const verTodos = abaAtiva === "anuncios";
  const anunciosVisiveis = verTodos ? anunciosReais : anunciosReais.slice(0, 5);

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
    if (cupomStatus === "ok") return { cor: "#16A34A", texto: "Cupom aplicado! +30 dias adicionados ao seu período." };
    if (cupomStatus === "invalido") return { cor: "#DC2626", texto: "Formato inválido. Use AR-XXXXXX." };
    if (cupomStatus === "erro") return { cor: "#DC2626", texto: "Cupom não encontrado ou inválido." };
    if (cupomStatus === "usado") return { cor: "#DC2626", texto: "Este cupom já foi utilizado." };
    return null;
  };

  const statusBadge = (status: string | null) => {
    const map: Record<string, { bg: string; color: string; label: string; icone: NomeIcone }> = {
      destaque: { bg: "rgba(255,102,0,0.08)", color: "#FF6600", label: "Destaque", icone: "estrelaCheia" },
      ativo: { bg: "rgba(22,163,74,0.08)", color: "#16A34A", label: "Ativo", icone: "ok" },
      pausado: { bg: "#F7F6F3", color: "#7A7670", label: "Pausado", icone: "pausar" },
      analise: { bg: "rgba(37,99,235,0.08)", color: "#2563EB", label: "Análise", icone: "relogio" },
      fora: { bg: "#FEF2F2", color: "#DC2626", label: "Fora do site", icone: "atencao" },
      vendido: { bg: "#EEF2F7", color: "#475569", label: "Vendido", icone: "check" },
    };
    const s = (status && map[status]) || map["ativo"];
    return <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 20, background: s.bg, color: s.color, whiteSpace: "nowrap", gap: 3 }}><Icone nome={s.icone} tamanho={12} /> {s.label}</span>;
  };

  const msg = mensagemCupom();
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  // Plano, vencimento e limite reais (tabela lojas). As regras valem no banco (supabase/fase4a.sql):
  // venceu → 3 dias de carência → anúncios saem do site até renovar. Vitalício nunca vence.
  const vitalicio = ehVitalicio(loja?.plano);
  const situacao = situacaoDoPlano(loja?.plano, loja?.expira_em, agora);
  const emTrial = !loja?.plano || loja.plano === "trial";
  const nomePlano = !lojaCarregada ? "…" : !loja ? "Sem loja" : nomeDoPlano(loja.plano);
  const limite = loja ? limiteDoPlano(loja.plano) : 1;
  const ativos = anunciosReais.filter(a => a.ativo !== false).length;
  const foraDoAr = situacao.tipo === "vencido";
  // Plano menor já pago que começa quando o atual termina (fase15).
  const planoProximo = loja?.plano_proximo && loja.plano_proximo_em ? { nome: nomeDoPlano(loja.plano_proximo), em: new Date(loja.plano_proximo_em).toLocaleDateString("pt-BR"), limite: limiteDoPlano(loja.plano_proximo) } : null;
  const pausados = anunciosReais.filter(a => a.ativo === false && a.status !== "vendido").length;
  const semVaga = limite !== null && ativos >= limite;
  const dataFim = loja?.expira_em ? new Date(loja.expira_em).toLocaleDateString("pt-BR") : "";
  const textoPeriodo =
    situacao.tipo === "em_dia" ? `${situacao.diasRestantes} ${situacao.diasRestantes === 1 ? "dia restante" : "dias restantes"} (até ${dataFim})`
    : situacao.tipo === "carencia" ? `Venceu em ${dataFim}`
    : situacao.tipo === "vencido" ? `Vencido desde ${dataFim}`
    : "—";

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
    const min = Math.max(0, Math.round((agora - new Date(iso).getTime()) / 60_000));
    if (min < 60) return `${min}min`;
    if (min < 1440) return `${Math.round(min / 60)}h`;
    return `${Math.round(min / 1440)}d`;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F7F6F3" }}>

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
          <Logo altura={24} />
        </Link>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
          <LogoLoja url={loja?.logo_url} tamanho={40} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{nomeLoja}</div>
            <div style={{ fontSize: 10, color: "#FF6600", fontWeight: 500, marginTop: 1 }}>{nomePlano}</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 1 }}>
          {[
            { id: "dashboard", icon: "grafico", label: "Dashboard" },
            { id: "anuncios", icon: "carro", label: "Meus Anúncios", badge: anunciosReais.length > 0 ? String(anunciosReais.length) : undefined },
            { id: "novo", icon: "mais", label: "Novo Anúncio" },
            // Mensagens, Avaliações, Estatísticas, Plano & Pagamento e Configurações
            // ficam escondidas até existirem de verdade.
            { id: "perfil", icon: "loja", label: "Perfil da Loja" },
          ].map(item => (
            item.id === "novo"
              ? <Link key={item.id} href="/painel/novo-anuncio" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 13.5, fontWeight: 500, textDecoration: "none", width: "100%" }}>
                  <span style={{ width: 20, display: "flex", justifyContent: "center", flexShrink: 0 }}><Icone nome="mais" tamanho={18} /></span>
                  <span>Novo Anúncio</span>
                </Link>
              : <button key={item.id} onClick={() => setAbaAtiva(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: abaAtiva === item.id ? "#FF6600" : "transparent", color: abaAtiva === item.id ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 13.5, fontWeight: 500, cursor: "pointer", width: "100%", textAlign: "left" }}>
                <span style={{ width: 20, display: "flex", justifyContent: "center", flexShrink: 0 }}><Icone nome={item.icon as NomeIcone} tamanho={18} /></span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && <span style={{ background: abaAtiva === item.id ? "rgba(255,255,255,0.25)" : "#FF6600", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{item.badge}</span>}
              </button>
          ))}
          {souAdmin && (
            <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, marginTop: 10, border: "1px solid rgba(255,102,0,0.35)", background: "rgba(255,102,0,0.1)", color: "#fff", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>
              <span style={{ width: 20, display: "flex", justifyContent: "center", flexShrink: 0 }}><Icone nome="escudo" tamanho={18} /></span>
              <span style={{ flex: 1 }}>Painel Admin</span>
            </Link>
          )}
        </nav>
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ background: "rgba(255,102,0,0.12)", border: "1px solid rgba(255,102,0,0.25)", borderRadius: 10, padding: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: "#FF6600", fontWeight: 500, marginBottom: 4 }}>ANÚNCIOS ATIVOS</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{ativos} ativo{ativos !== 1 ? "s" : ""}{limite !== null ? ` de ${limite}` : ""}</div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 4, marginBottom: 6 }}>
              <div style={{ background: "#FF6600", height: 4, borderRadius: 4, width: limite === null ? "100%" : `${Math.min((ativos / limite) * 100, 100)}%` }}></div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{limite === null ? "Sem limite de anúncios" : `${Math.max(limite - ativos, 0)} vaga${limite - ativos === 1 ? "" : "s"} disponíve${limite - ativos === 1 ? "l" : "is"}`}</div>
          </div>
          <button
            onClick={async () => { await sair(); window.location.href = "/login"; }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: "transparent", color: "rgba(255,255,255,0.35)", fontSize: 12.5, cursor: "pointer", width: "100%" }}>
            <Icone nome="sair" tamanho={17} /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* HEADER */}
        <header style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", padding: "0 16px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1A1917" }}>{abaAtiva === "perfil" ? "Perfil da loja" : abaAtiva === "anuncios" ? "Meus anúncios" : "Dashboard"}</div>
            <div style={{ fontSize: 10, color: "#7A7670", textTransform: "capitalize" }}>{hoje}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/painel/novo-anuncio" className="header-novo" style={{ padding: "7px 14px", background: "#FF6600", borderRadius: 7, fontSize: 12, fontWeight: 700, color: "#fff", textDecoration: "none", alignItems: "center" }}>+ Novo Anúncio</Link>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#F7F6F3", cursor: "pointer" }}>
              <div style={{ width: 26, height: 26, background: "#FF6600", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Icone nome="usuario" tamanho={16} /></div>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#1A1917" }}>{nomeUsuario}</span>
            </div>
          </div>
        </header>

        <div style={{ padding: "16px", flex: 1 }}>
          {abaAtiva === "perfil" ? (
            lojaCarregada && <>
              <PerfilLoja key={loja?.id ?? "sem-loja"} loja={loja} onSalvo={l => { setLoja(l); setNomeLoja(l.nome); }} />
              {!souAdmin && <ExcluirConta />}
            </>
          ) : (<>

          {/* AVISO */}
          {lojaCarregada && (situacao.tipo === "sem_loja" || (situacao.tipo === "em_dia" && (situacao.avisar || emTrial)) || situacao.tipo === "carencia" || situacao.tipo === "vencido") && (() => {
            const grave = situacao.tipo === "carencia" || situacao.tipo === "vencido";
            return (
              <div style={{ background: grave ? "#FEF2F2" : "rgba(255,102,0,0.08)", border: `1px solid ${grave ? "#FCA5A5" : "rgba(255,102,0,0.2)"}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "flex", color: grave ? "#DC2626" : "#FF6600" }}><Icone nome={grave ? "atencao" : "ampulheta"} tamanho={18} /></span>
                  <div style={{ fontSize: 13, color: "#1A1917", lineHeight: 1.5 }}>
                    {situacao.tipo === "sem_loja" && "Sua conta ainda não tem uma loja vinculada. Você pode anunciar 1 veículo como particular."}
                    {situacao.tipo === "em_dia" && planoProximo && <>{emTrial ? "Período grátis" : `Plano ${nomePlano}`} até <strong>{planoProximo.em}</strong>. Depois começa o <strong>Plano {planoProximo.nome}</strong> ({planoProximo.limite === null ? "sem limite de anúncios" : `até ${planoProximo.limite} anúncios ativos`}), pago até {dataFim}.</>}
                    {situacao.tipo === "em_dia" && !planoProximo && <>{emTrial ? "Período grátis" : `Plano ${nomePlano}`} termina em <strong style={{ color: "#FF6600" }}>{situacao.diasRestantes} {situacao.diasRestantes === 1 ? "dia" : "dias"}</strong> ({dataFim}).</>}
                    {situacao.tipo === "carencia" && <>Seu plano <strong>venceu em {dataFim}</strong>. Seus anúncios <strong style={{ color: "#DC2626" }}>saem do site em {situacao.diasAteSairDoAr} {situacao.diasAteSairDoAr === 1 ? "dia" : "dias"}</strong> se o plano não for renovado.</>}
                    {situacao.tipo === "vencido" && <>Seu plano venceu em {dataFim}. <strong style={{ color: "#DC2626" }}>Seus anúncios estão fora do site</strong> e voltam assim que o plano for renovado.</>}
                  </div>
                </div>
                {situacao.tipo !== "sem_loja" && <Link href="/painel/planos" style={{ fontSize: 12, fontWeight: 600, color: "#FF6600", textDecoration: "none" }}>{emApp ? "Meu plano →" : "Ver planos →"}</Link>}
              </div>
            );
          })()}

          {/* STATS */}
          <div className="stats-grid" style={{ marginBottom: 16 }}>
            {[
              { label: "Visualizações (30 dias)", value: stats ? stats.visualizacoes_30d.toLocaleString("pt-BR") : "—", change: varVisitas.texto, up: varVisitas.up, icon: "olho", bg: "rgba(255,102,0,0.08)" },
              { label: "Contatos (30 dias)", value: stats ? stats.contatos_30d.toLocaleString("pt-BR") : "—", change: varContatos.texto, up: varContatos.up, icon: "whatsapp", bg: "rgba(22,163,74,0.08)" },
              { label: "Anúncios ativos", value: String(ativos), change: foraDoAr ? "fora do site (plano vencido)" : limite === null ? "sem limite" : `limite do plano: ${limite}`, up: false, icon: "carro", bg: "rgba(37,99,235,0.08)" },
              vitalicio
                ? { label: "Plano", value: "Vitalício", change: "sem vencimento", up: true, icon: "coroa", bg: "rgba(255,102,0,0.08)" }
                : { label: emTrial ? "Período grátis" : `Plano ${nomePlano}`, value: situacao.tipo === "em_dia" ? String(situacao.diasRestantes) : situacao.tipo === "sem_loja" ? "—" : "Vencido", change: situacao.tipo === "em_dia" ? (situacao.diasRestantes === 1 ? "dia restante" : "dias restantes") : situacao.tipo === "carencia" ? `sai do site em ${situacao.diasAteSairDoAr}d` : situacao.tipo === "vencido" ? "anúncios fora do site" : "sem loja", up: situacao.tipo === "em_dia", icon: "ampulheta", bg: "rgba(255,102,0,0.08)" },
            ].map(stat => (
              <div key={stat.label} style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "#7A7670", fontWeight: 500 }}>{stat.label}</span>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#1A1917" }}><Icone nome={stat.icon as NomeIcone} tamanho={16} /></div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#1A1917", lineHeight: 1, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: stat.up ? "#16A34A" : "#7A7670" }}>{stat.change}</div>
              </div>
            ))}
          </div>

          {/* DASHBOARD GRID */}
          <div className="dashboard-grid" style={{ marginBottom: 16 }}>

            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917" }}>{verTodos ? `Meus anúncios (${anunciosReais.length})` : "Anúncios recentes"}</div>
                {verTodos
                  ? <button onClick={() => setAbaAtiva("dashboard")} style={{ fontSize: 12, color: "#FF6600", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}>← Voltar ao resumo</button>
                  : anunciosReais.length > 5 && <button onClick={() => setAbaAtiva("anuncios")} style={{ fontSize: 12, color: "#FF6600", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}>Ver todos ({anunciosReais.length}) →</button>}
              </div>

              {pausados > 0 && limite !== null && (
                <div style={{ padding: "10px 18px", background: semVaga ? "#FEF2F2" : "rgba(255,102,0,0.06)", borderBottom: "1px solid #E8E6E1", fontSize: 12.5, color: "#1A1917", lineHeight: 1.5 }}>
                  {semVaga
                    ? <>Seu plano permite <strong>{limite} anúncios ativos</strong> e todos estão em uso. Os pausados só podem ser <strong>marcados como vendidos</strong> ou <strong>excluídos</strong> — ou pause um ativo para liberar uma vaga.</>
                    : <>Você pode reativar mais <strong>{limite - ativos} {limite - ativos === 1 ? "anúncio" : "anúncios"}</strong> (limite do plano: {limite}).</>}
                </div>
              )}
              {anunciosReais.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center" }}>
                  <div style={{ marginBottom: 8, color: "#C9C5BE" }}><Icone nome="carro" tamanho={36} traco={1.5} /></div>
                  <div style={{ fontSize: 13, color: "#7A7670", marginBottom: 12 }}>Nenhum anúncio cadastrado ainda.</div>
                  <Link href="/painel/novo-anuncio" style={{ padding: "8px 16px", background: "#FF6600", color: "#fff", borderRadius: 7, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>+ Criar primeiro anúncio</Link>
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
                      {anunciosVisiveis.map(car => (
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
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1917" }}>{car.nome}</div>
                                <div style={{ fontSize: 11, color: "#7A7670" }}>{car.ano} · {formatarKm(car.km)}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "11px 14px" }}>{statusBadge(car.status === "vendido" ? "vendido" : car.ativo === false ? "pausado" : foraDoAr ? "fora" : car.status || "ativo")}</td>
                          <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "#1A1917" }}>{formatarPreco(car.preco)}<SituacaoFipe car={car} /></td>
                          <td style={{ padding: "11px 14px" }}>
                            <div style={{ display: "flex", gap: 5 }}>
                              <Link href={`/veiculo/${car.id}`} style={{ width: 28, height: 28, borderRadius: 6, border: "1.5px solid #E8E6E1", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, textDecoration: "none", color: "#1A1917" }}><Icone nome="olho" tamanho={15} /></Link>
                              <Link href={`/painel/novo-anuncio?editar=${car.id}`} title="Editar" style={{ width: 28, height: 28, borderRadius: 6, border: "1.5px solid #E8E6E1", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, textDecoration: "none", color: "#1A1917" }}><Icone nome="editar" tamanho={15} /></Link>
                              {car.status !== "vendido" && !(car.ativo === false && semVaga) && <button title={car.ativo === false ? "Reativar" : "Pausar"} disabled={acaoEmAndamento === car.id} onClick={() => alternarPausa(car)} style={{ width: 28, height: 28, borderRadius: 6, border: "1.5px solid #E8E6E1", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, opacity: acaoEmAndamento === car.id ? 0.5 : 1 }}><Icone nome={car.ativo === false ? "reativar" : "pausar"} tamanho={15} /></button>}
                              {car.status !== "vendido" && <button title="Marcar como vendido" disabled={acaoEmAndamento === car.id} onClick={() => finalizar(car)} style={{ width: 28, height: 28, borderRadius: 6, border: "1.5px solid #E8E6E1", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#16A34A" }}><Icone nome="ok" tamanho={15} /></button>}
                              <button title="Excluir" disabled={acaoEmAndamento === car.id} onClick={() => excluir(car)} style={{ width: 28, height: 28, borderRadius: 6, border: "1.5px solid #E8E6E1", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, opacity: acaoEmAndamento === car.id ? 0.5 : 1 , color: "#DC2626" }}><Icone nome="lixeira" tamanho={15} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="cards-mobile" style={{ flexDirection: "column" }}>
                    {anunciosVisiveis.map(car => (
                      <div key={car.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #E8E6E1" }}>
                        <div style={{ width: 56, height: 42, borderRadius: 7, overflow: "hidden", flexShrink: 0, border: "1px solid #E8E6E1", background: "#F7F6F3" }}>
                          {car.fotos && car.fotos.length > 0
                            ? <img src={car.fotos[0]} alt={car.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <Image src="/sem-foto.png" alt={car.nome} width={56} height={42} style={{ objectFit: "cover" }} />
                          }
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1917", marginBottom: 2 }}>{car.nome}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {statusBadge(car.status === "vendido" ? "vendido" : car.ativo === false ? "pausado" : foraDoAr ? "fora" : car.status || "ativo")}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1917" }}>{formatarPreco(car.preco)}<SituacaoFipe car={car} /></div>
                          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                            <Link href={`/veiculo/${car.id}`} style={{ width: 26, height: 26, borderRadius: 5, border: "1.5px solid #E8E6E1", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, textDecoration: "none", color: "#1A1917" }}><Icone nome="olho" tamanho={15} /></Link>
                            <Link href={`/painel/novo-anuncio?editar=${car.id}`} title="Editar" style={{ width: 26, height: 26, borderRadius: 5, border: "1.5px solid #E8E6E1", background: "#F7F6F3", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "#1A1917" }}><Icone nome="editar" tamanho={15} /></Link>
                            {car.status !== "vendido" && !(car.ativo === false && semVaga) && <button title={car.ativo === false ? "Reativar" : "Pausar"} disabled={acaoEmAndamento === car.id} onClick={() => alternarPausa(car)} style={{ width: 26, height: 26, borderRadius: 5, border: "1.5px solid #E8E6E1", background: "#F7F6F3", cursor: "pointer", fontSize: 11 }}><Icone nome={car.ativo === false ? "reativar" : "pausar"} tamanho={15} /></button>}
                              {car.status !== "vendido" && <button title="Marcar como vendido" disabled={acaoEmAndamento === car.id} onClick={() => finalizar(car)} style={{ width: 28, height: 28, borderRadius: 6, border: "1.5px solid #E8E6E1", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#16A34A" }}><Icone nome="ok" tamanho={15} /></button>}
                            <button title="Excluir" disabled={acaoEmAndamento === car.id} onClick={() => excluir(car)} style={{ width: 26, height: 26, borderRadius: 5, border: "1.5px solid #E8E6E1", background: "#F7F6F3", cursor: "pointer", fontSize: 11 , color: "#DC2626" }}><Icone nome="lixeira" tamanho={15} /></button>
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
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Contatos recentes</div>
                </div>
                {contatosRecentes.length === 0 ? (
                  <div style={{ padding: "18px 16px", fontSize: 12, color: "#7A7670", lineHeight: 1.5 }}>Nenhum contato ainda. Quando alguém clicar em WhatsApp ou Ligar nos seus anúncios, aparece aqui.</div>
                ) : contatosRecentes.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: i < contatosRecentes.length - 1 ? "1px solid #E8E6E1" : "none" }}>
                    <div style={{ width: 32, height: 32, background: "#F7F6F3", border: "1px solid #E8E6E1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: c.tipo === "whatsapp" ? "#16A34A" : "#1A1917" }}><Icone nome={c.tipo === "whatsapp" ? "whatsapp" : "telefone"} tamanho={16} /></div>
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
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Visitas esta semana</div>
                </div>
                <div style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70, marginBottom: 8 }}>
                    {visitas7d.map((v, i) => {
                      const barraHoje = i === visitas7d.length - 1;
                      const dia = new Date(v.dia + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
                      return (
                        <div key={v.dia} title={`${v.total} visita${v.total === 1 ? "" : "s"}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ width: "100%", height: Math.max(3, Math.round((v.total / maxVisitas) * 60)), background: barraHoje ? "#FF6600" : "rgba(255,102,0,0.25)", borderRadius: "4px 4px 0 0" }}></div>
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
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Ações rápidas</div>
              </div>
              <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {([["mais", "Novo anúncio"], ["estrela", "Destaque"], ["grafico", "Estatísticas"], ["loja", "Editar perfil"], ["qrcode", "QR Code"], ["whatsapp", "Mensagens"]] as const).map(([icon, label]) => (
                  <button key={label} style={{ padding: 12, border: "1.5px solid #E8E6E1", borderRadius: 10, background: "#F7F6F3", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ marginBottom: 5, color: "#FF6600" }}><Icone nome={icon} tamanho={22} /></div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "#1A1917" }}>{label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Meu plano</div>
                {!vitalicio && <Link href="/painel/planos" style={{ fontSize: 12, color: "#FF6600", fontWeight: 500, textDecoration: "none" }}>{emApp ? "Detalhes →" : "Ver planos →"}</Link>}
              </div>
              <div style={{ padding: "0 18px" }}>
                {(vitalicio
                  ? [["Plano atual", "Acesso vitalício", "#FF6600"], ["Anúncios usados", `${anunciosReais.length} (sem limite)`, "#1A1917"], ["Vencimento", "Nunca", "#16A34A"]]
                  : [["Plano atual", nomePlano, "#FF6600"], ["Anúncios ativos", limite === null ? `${ativos} (sem limite)` : `${ativos} / ${limite}`, "#1A1917"], [emTrial ? "Período grátis" : "Validade", textoPeriodo, situacao.tipo === "em_dia" ? "#FF6600" : "#DC2626"], ["Destaque nos resultados", loja?.plano === "profissional" || loja?.plano === "premium" ? "Incluído" : "Planos Profissional e Premium", "#7A7670"]]
                ).map(([label, value, color]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E8E6E1" }}>
                    <span style={{ fontSize: 12.5, color: "#7A7670" }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color }}>{value}</span>
                  </div>
                ))}
              </div>
              {!vitalicio && <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                {!emApp && <div style={{ background: "#F7F6F3", border: "1.5px solid #E8E6E1", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#7A7670", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: 0.5 }}><Icone nome="cupom" /> Resgatar cupom</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="text" placeholder="AR-XXXXXX" value={cupom}
                      onChange={e => { setCupom(e.target.value.toUpperCase()); setCupomStatus(null); }}
                      maxLength={9} disabled={cupomStatus === "ok"}
                      style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${cupomStatus === "invalido" || cupomStatus === "erro" || cupomStatus === "usado" ? "#DC2626" : "#E8E6E1"}`, borderRadius: 7, fontSize: 13, background: "#fff", color: "#1A1917", outline: "none", letterSpacing: 1 }}
                    />
                    <button onClick={resgatarCupom} disabled={cupomStatus === "loading" || cupomStatus === "ok"}
                      style={{ padding: "8px 14px", background: cupomStatus === "ok" ? "#16A34A" : "#FF6600", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: cupomStatus === "loading" || cupomStatus === "ok" ? "default" : "pointer", whiteSpace: "nowrap" as const, opacity: cupomStatus === "loading" ? 0.7 : 1 }}>
                      {cupomStatus === "loading" ? "..." : cupomStatus === "ok" ? "Ok" : "Resgatar"}
                    </button>
                  </div>
                  {msg && <div style={{ fontSize: 11, color: msg.cor, marginTop: 6, fontWeight: 500 }}><Icone nome={cupomStatus === "ok" ? "ok" : "erro"} /> {msg.texto}</div>}
                </div>}
                <Link href="/painel/planos" style={{ display: "block", textAlign: "center", width: "100%", padding: 10, background: "#FF6600", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none", boxSizing: "border-box" }}>
                  {emApp ? "Ver meu plano" : "Ver planos e renovar"}
                </Link>
              </div>}
            </div>
          </div>
          </>)}
        </div>
      </div>

      {/* TAB BAR MOBILE */}
      <div className="tab-bar" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#111009", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8px 0", zIndex: 50, justifyContent: "space-around", alignItems: "center" }}>
        {[
          { id: "dashboard", icon: "grafico", label: "Início" },
          { id: "anuncios", icon: "carro", label: "Anúncios" },
          { id: "novo", icon: "mais", label: "Novo", link: "/painel/novo-anuncio" },
          { id: "perfil", icon: "loja", label: "Loja" },
        ].map(item => (
          item.link
            ? <Link key={item.id} href={item.link} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, textDecoration: "none", padding: "4px 12px" }}>
                <div style={{ width: 36, height: 36, background: "#FF6600", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Icone nome={item.icon as NomeIcone} tamanho={20} /></div>
                <span style={{ fontSize: 10, color: "#FF6600", fontWeight: 600 }}>{item.label}</span>
              </Link>
            : <button key={item.id} onClick={() => setAbaAtiva(item.id)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 12px", position: "relative" }}>
                <span style={{ display: "flex", color: abaAtiva === item.id ? "#FF6600" : "rgba(255,255,255,0.55)" }}><Icone nome={item.icon as NomeIcone} tamanho={22} /></span>
                <span style={{ fontSize: 10, color: abaAtiva === item.id ? "#FF6600" : "rgba(255,255,255,0.4)", fontWeight: abaAtiva === item.id ? 600 : 400 }}>{item.label}</span>
              </button>
        ))}
        {souAdmin && (
          <Link href="/admin" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, textDecoration: "none", padding: "4px 12px" }}>
            <span style={{ display: "flex", color: "rgba(255,255,255,0.55)" }}><Icone nome="escudo" tamanho={22} /></span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Admin</span>
          </Link>
        )}
      </div>

    </div>
  );
}

// Só o lojista vê: como o preço está em relação à FIPE (o site mostra apenas o selo quando está abaixo).
function SituacaoFipe({ car }: { car: { preco: number | null; fipe_valor: number | null; fipe_ano: string | null } }) {
  if (!car.fipe_ano) return <div style={{ fontSize: 10.5, fontWeight: 500, color: "#A8A49D", marginTop: 2 }}>Sem FIPE — edite para ligar</div>;
  if (!car.fipe_valor || !car.preco) return null;
  const pct = Math.round(((car.preco - car.fipe_valor) / car.fipe_valor) * 100);
  if (car.preco < car.fipe_valor) {
    return <div style={{ fontSize: 10.5, fontWeight: 600, color: "#15803D", marginTop: 2 }}><Icone nome="abaixo" /> {Math.abs(pct)}% abaixo da FIPE (selo ativo)</div>;
  }
  return <div style={{ fontSize: 10.5, fontWeight: 500, color: "#7A7670", marginTop: 2 }}>{pct === 0 ? "Igual à FIPE" : `${pct}% acima da FIPE`}</div>;
}
