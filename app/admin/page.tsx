"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ehAdmin } from "@/lib/admin";
import { gerarCupom as gerarCupomNoServidor } from "@/lib/dados/cupons";
import { formatarPreco } from "@/lib/formatar";

type Resumo = {
  totais: { lojas: number; lojas_7d: number; veiculos_ativos: number; veiculos_7d: number; usuarios: number; usuarios_30d: number; visualizacoes_30d: number; contatos_30d: number };
  status: { assinante: number; trial: number; vencida: number };
  lojas: { id: string; nome: string; cidade: string; plano: string; veiculos: number; status: "assinante" | "trial" | "vencida"; vencimento: string }[];
  anuncios: { id: string; nome: string; loja: string; preco: number | null; status: string }[];
};

export default function Admin() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("Dashboard");
  const [cupomGerado, setCupomGerado] = useState("");
  const [gerando, setGerando] = useState(false);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [erroResumo, setErroResumo] = useState("");

  useEffect(() => {
    // O proxy.ts já barra no servidor; esta checagem é uma segunda camada.
    supabase.auth.getUser().then(({ data }) => {
      if (ehAdmin(data.user?.email)) {
        setAutorizado(true);
      } else {
        router.replace("/login");
      }
      setVerificando(false);
    });
  }, [router]);

  useEffect(() => {
    if (!autorizado) return;
    fetch("/api/admin/resumo")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setResumo)
      .catch(() => setErroResumo("Não foi possível carregar os números. Recarregue a página."));
  }, [autorizado]);

  if (verificando || !autorizado) {
    return (
      <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 13, color: "#7A7670" }}>{verificando ? "Verificando acesso..." : "Redirecionando..."}</div>
      </main>
    );
  }

  async function gerarCupom() {
    setGerando(true);
    const { codigo, erro } = await gerarCupomNoServidor();
    if (erro || !codigo) {
      alert("Erro ao gerar cupom: " + (erro || "resposta vazia"));
    } else {
      setCupomGerado(codigo);
    }
    setGerando(false);
  }

  const t = resumo?.totais;
  const n = (v: number | undefined) => (v === undefined ? "…" : v.toLocaleString("pt-BR"));
  const stats = [
    { label: "Lojas cadastradas", value: n(t?.lojas), icon: "🏪", change: t ? `+${t.lojas_7d} nos últimos 7 dias` : "" },
    { label: "Veículos ativos", value: n(t?.veiculos_ativos), icon: "🚗", change: t ? `+${t.veiculos_7d} nos últimos 7 dias` : "" },
    { label: "Usuários cadastrados", value: n(t?.usuarios), icon: "👥", change: t ? `+${t.usuarios_30d} nos últimos 30 dias` : "" },
    { label: "Contatos (30 dias)", value: n(t?.contatos_30d), icon: "💬", change: t ? `${n(t.visualizacoes_30d)} visualizações` : "" },
  ];
  const lojas = resumo?.lojas ?? [];
  const anunciosRecentes = resumo?.anuncios ?? [];
  const mesAtual = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const corStatus = (st: string) => statusColor[st] ?? statusColor.ativo;
  const statusColor: Record<string, { bg: string; color: string }> = {
    ativo: { bg: "#D1FAE5", color: "#065F46" },
    assinante: { bg: "#D1FAE5", color: "#065F46" },
    trial: { bg: "#FEF3C7", color: "#92400E" },
    vencida: { bg: "#FEE2E2", color: "#991B1B" },
    inativo: { bg: "#FEE2E2", color: "#991B1B" },
    pausado: { bg: "#FEE2E2", color: "#991B1B" },
  };

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh" }}>

      <style>{`
        .admin-nav-links { display: flex !important; }
        .admin-hamburger { display: none !important; }
        .stats-grid-admin { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .receita-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .tabela-admin { display: table !important; }
        .cards-admin { display: none !important; }
        @media (max-width: 768px) {
          .admin-nav-links { display: none !important; }
          .admin-hamburger { display: flex !important; }
          .stats-grid-admin { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .receita-grid { grid-template-columns: 1fr !important; }
          .tabela-admin { display: none !important; }
          .cards-admin { display: flex !important; }
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
          {["Dashboard", "Lojas", "Anúncios", "Usuários", "Financeiro"].map(item => (
            <a key={item} href="#" onClick={() => setAbaAtiva(item)} style={{ fontSize: 13, color: abaAtiva === item ? "#fff" : "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: abaAtiva === item ? 600 : 400 }}>{item}</a>
          ))}
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E85D26", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>R</div>
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
          {["Dashboard", "Lojas", "Anúncios", "Usuários", "Financeiro"].map(item => (
            <a key={item} href="#" onClick={() => { setAbaAtiva(item); setMenuAberto(false); }} style={{ fontSize: 15, color: "#fff", textDecoration: "none", fontWeight: 500 }}>{item}</a>
          ))}
        </div>
      )}

      <div style={{ paddingTop: 76, padding: "76px 16px 40px", maxWidth: 1100, margin: "0 auto" }}>

        {/* TÍTULO */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 800, color: "#1A1917" }}>Dashboard</div>
          <div style={{ fontSize: 13, color: "#7A7670" }}><span style={{ textTransform: "capitalize" }}>Visão geral do AutoRegião — {mesAtual}</span></div>
          {erroResumo && <div style={{ fontSize: 13, color: "#991B1B", marginTop: 6 }}>⚠️ {erroResumo}</div>}
        </div>

        {/* STATS */}
        <div className="stats-grid-admin" style={{ marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.4 }}>{s.label}</div>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
              </div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#E85D26" }}>{s.change}</div>
            </div>
          ))}
        </div>

        {/* RECEITA + STATUS */}
        <div className="receita-grid" style={{ marginBottom: 24 }}>
          <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "20px" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 16 }}>Engajamento (30 dias)</div>
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
          <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "20px" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 16 }}>Lojas por status</div>
            {[
              { label: "Assinantes", valor: resumo?.status.assinante, cor: "#D1FAE5", corTexto: "#065F46" },
              { label: "Em período grátis", valor: resumo?.status.trial, cor: "#FEF3C7", corTexto: "#92400E" },
              { label: "Período vencido", valor: resumo?.status.vencida, cor: "#FEE2E2", corTexto: "#991B1B" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: s.cor, borderRadius: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: s.corTexto, fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: s.corTexto }}>{n(s.valor)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LOJAS */}
        <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "20px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#1A1917" }}>Lojas cadastradas</div>
          </div>
          <table className="tabela-admin" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #E8E6E1" }}>
                {["Loja", "Cidade", "Plano", "Veículos", "Status", "Vencimento", ""].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.4, padding: "0 8px 10px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lojas.map(loja => (
                <tr key={loja.id} style={{ borderBottom: "1px solid #F7F6F3" }}>
                  <td style={{ padding: "12px 8px", fontSize: 13, fontWeight: 600, color: "#1A1917" }}>{loja.nome}</td>
                  <td style={{ padding: "12px 8px", fontSize: 13, color: "#7A7670" }}>{loja.cidade}</td>
                  <td style={{ padding: "12px 8px" }}><span style={{ fontSize: 11, fontWeight: 600, color: "#1A1917" }}>{loja.plano}</span></td>
                  <td style={{ padding: "12px 8px", fontSize: 13, color: "#1A1917" }}>{loja.veiculos}</td>
                  <td style={{ padding: "12px 8px" }}><span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: corStatus(loja.status).bg, color: corStatus(loja.status).color }}>{loja.status}</span></td>
                  <td style={{ padding: "12px 8px", fontSize: 12, color: "#7A7670" }}>{loja.vencimento}</td>
                  <td style={{ padding: "12px 8px" }}><Link href={`/loja/${loja.id}`} style={{ fontSize: 12, color: "#E85D26", textDecoration: "none", fontWeight: 500 }}>Ver →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cards-admin" style={{ flexDirection: "column", gap: 10 }}>
            {lojas.map(loja => (
              <div key={loja.id} style={{ border: "1.5px solid #E8E6E1", borderRadius: 10, padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>{loja.nome}</div>
                    <div style={{ fontSize: 12, color: "#7A7670" }}>📍 {loja.cidade}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: corStatus(loja.status).bg, color: corStatus(loja.status).color }}>{loja.status}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#1A1917" }}>📋 {loja.plano}</span>
                  <span style={{ fontSize: 11, color: "#7A7670" }}>🚗 {loja.veiculos} veículos</span>
                  <span style={{ fontSize: 11, color: "#7A7670" }}>📅 {loja.vencimento}</span>
                </div>
                <Link href={`/loja/${loja.id}`} style={{ fontSize: 12, color: "#E85D26", textDecoration: "none", fontWeight: 500 }}>Ver detalhes →</Link>
              </div>
            ))}
          </div>
        </div>

        {/* ANÚNCIOS */}
        <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "20px", marginBottom: 24 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 16 }}>Anúncios recentes</div>
          <table className="tabela-admin" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #E8E6E1" }}>
                {["Veículo", "Loja", "Preço", "Status", ""].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.4, padding: "0 8px 10px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {anunciosRecentes.map(a => (
                <tr key={a.id} style={{ borderBottom: "1px solid #F7F6F3" }}>
                  <td style={{ padding: "12px 8px", fontSize: 13, fontWeight: 600, color: "#1A1917" }}>{a.nome}</td>
                  <td style={{ padding: "12px 8px", fontSize: 13, color: "#7A7670" }}>{a.loja}</td>
                  <td style={{ padding: "12px 8px", fontSize: 13, fontFamily: "Georgia, serif", fontWeight: 700, color: "#1A1917" }}>{formatarPreco(a.preco)}</td>
                  <td style={{ padding: "12px 8px" }}><span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: corStatus(a.status).bg, color: corStatus(a.status).color }}>{a.status}</span></td>
                  <td style={{ padding: "12px 8px" }}><Link href={`/veiculo/${a.id}`} style={{ fontSize: 12, color: "#E85D26", textDecoration: "none", fontWeight: 500 }}>Ver →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cards-admin" style={{ flexDirection: "column", gap: 10 }}>
            {anunciosRecentes.map(a => (
              <div key={a.id} style={{ border: "1.5px solid #E8E6E1", borderRadius: 10, padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917", flex: 1, marginRight: 8 }}>{a.nome}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: corStatus(a.status).bg, color: corStatus(a.status).color, flexShrink: 0 }}>{a.status}</span>
                </div>
                <div style={{ fontSize: 12, color: "#7A7670", marginBottom: 4 }}>🏪 {a.loja}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#E85D26" }}>{formatarPreco(a.preco)}</span>
                  <Link href={`/veiculo/${a.id}`} style={{ fontSize: 12, color: "#E85D26", textDecoration: "none", fontWeight: 500 }}>Ver →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CUPONS */}
        <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#1A1917" }}>🎟️ Cupons de extensão</div>
            <button
              onClick={gerarCupom}
              disabled={gerando}
              style={{ padding: "6px 14px", background: gerando ? "#C44818" : "#E85D26", border: "none", borderRadius: 7, color: "#fff", fontSize: 12, fontWeight: 600, cursor: gerando ? "default" : "pointer", opacity: gerando ? 0.7 : 1 }}
            >
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
              <button
                onClick={() => { navigator.clipboard.writeText(cupomGerado); alert("Copiado!"); }}
                style={{ padding: "8px 16px", background: "#065F46", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                📋 Copiar
              </button>
            </div>
          )}
          <div style={{ fontSize: 13, color: "#7A7670", lineHeight: 1.6 }}>
            Gere cupons para estender o período de uma loja por 30 dias. Envie o código diretamente para o lojista via WhatsApp ou e-mail.
          </div>
        </div>

      </div>
    </main>
  );
}