"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Painel() {
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [nomeUsuario, setNomeUsuario] = useState("...");
  const [nomeLoja, setNomeLoja] = useState("Minha Loja");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const nome = data.user.user_metadata?.nome || data.user.email || "Lojista";
        setNomeUsuario(nome.split(" ")[0]);

        // Busca a loja do usuário
        supabase.from("lojas").select("nome").eq("usuario_id", data.user.id).maybeSingle().then(({ data: loja }) => {
          if (loja?.nome) setNomeLoja(loja.nome);
        });
      }
    });
  }, []);

  // CUPOM
  const [cupom, setCupom] = useState("");
  const [cupomStatus, setCupomStatus] = useState<null | "ok" | "erro" | "loading" | "invalido" | "usado">(null);

  const resgatarCupom = async () => {
    const codigo = cupom.trim().toUpperCase();
    const regex = /^AR-[A-Z0-9]{6}$/;
    if (!regex.test(codigo)) { setCupomStatus("invalido"); return; }
    setCupomStatus("loading");
    try {
      const { data: cupomData, error: cupomError } = await supabase.from("cupons").select("*").eq("codigo", codigo).eq("ativo", true).single();
      if (cupomError || !cupomData) { setCupomStatus("erro"); return; }
      if (cupomData.usos_realizados >= cupomData.usos_maximos) { setCupomStatus("usado"); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setCupomStatus("erro"); return; }
      const { data: lojaData, error: lojaError } = await supabase.from("lojas").select("id, expira_em").eq("usuario_id", user.id).maybeSingle();
      if (lojaError || !lojaData) { setCupomStatus("erro"); return; }
      const base = lojaData.expira_em ? new Date(lojaData.expira_em) : new Date();
      if (base < new Date()) base.setTime(new Date().getTime());
      base.setDate(base.getDate() + cupomData.dias);
      const { error: updateLojaError } = await supabase.from("lojas").update({ expira_em: base.toISOString() }).eq("id", lojaData.id);
      if (updateLojaError) { setCupomStatus("erro"); return; }
      await supabase.from("cupons_usados").insert({ cupom_id: cupomData.id, loja_id: lojaData.id, usado_em: new Date().toISOString() });
      await supabase.from("cupons").update({ usos_realizados: cupomData.usos_realizados + 1 }).eq("id", cupomData.id);
      setCupomStatus("ok");
    } catch { setCupomStatus("erro"); }
  };

  const mensagemCupom = () => {
    if (cupomStatus === "ok") return { cor: "#16A34A", texto: "✅ Cupom aplicado! +30 dias adicionados ao seu período." };
    if (cupomStatus === "invalido") return { cor: "#DC2626", texto: "❌ Formato inválido. Use AR-XXXXXX." };
    if (cupomStatus === "erro") return { cor: "#DC2626", texto: "❌ Cupom não encontrado ou inválido." };
    if (cupomStatus === "usado") return { cor: "#DC2626", texto: "❌ Este cupom já foi utilizado." };
    return null;
  };

  const anuncios = [
    { id: 1, name: "Chevrolet Onix LT", ano: "2022", km: "38.000 km", price: "R$ 72.900", views: 342, status: "destaque" },
    { id: 2, name: "VW T-Cross TSI", ano: "2022", km: "29.000 km", price: "R$ 118.000", views: 218, status: "ativo" },
    { id: 3, name: "Tracker Premier", ano: "2023", km: "9.000 km", price: "R$ 139.900", views: 189, status: "ativo" },
    { id: 4, name: "Fiat Pulse Drive", ano: "2021", km: "52.000 km", price: "R$ 84.500", views: 97, status: "pausado" },
    { id: 5, name: "Honda HR-V EXL", ano: "2023", km: "14.000 km", price: "R$ 127.000", views: 0, status: "analise" },
  ];

  const contatos = [
    { nome: "Carlos Mendes", carro: "Onix LT 2022", tempo: "2min", lido: false },
    { nome: "Ana Paula", carro: "T-Cross TSI", tempo: "18min", lido: false },
    { nome: "Marcos Lima", carro: "Tracker Premier", tempo: "1h", lido: true },
    { nome: "Fernanda Costa", carro: "HR-V EXL", tempo: "3h", lido: true },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      destaque: { bg: "rgba(232,93,38,0.08)", color: "#E85D26", label: "⭐ Destaque" },
      ativo: { bg: "rgba(22,163,74,0.08)", color: "#16A34A", label: "✅ Ativo" },
      pausado: { bg: "#F7F6F3", color: "#7A7670", label: "⏸ Pausado" },
      analise: { bg: "rgba(37,99,235,0.08)", color: "#2563EB", label: "🕐 Análise" },
    };
    const s = map[status];
    return <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 20, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{s.label}</span>;
  };

  const msg = mensagemCupom();

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
        .sidebar-overlay { display: none; }
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
          .sidebar-overlay { display: block; }
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
            <div style={{ fontSize: 10, color: "#E85D26", fontWeight: 500, marginTop: 1 }}>⭐ Plano Profissional</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 1 }}>
          {[
            { id: "dashboard", icon: "📊", label: "Dashboard" },
            { id: "anuncios", icon: "🚗", label: "Meus Anúncios", badge: "18" },
            { id: "novo", icon: "➕", label: "Novo Anúncio" },
            { id: "mensagens", icon: "💬", label: "Mensagens", badge: "5" },
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
            <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>18 de 30 usados</div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 4, marginBottom: 6 }}>
              <div style={{ background: "#E85D26", height: 4, borderRadius: 4, width: "60%" }}></div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>12 slots disponíveis</div>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: "transparent", color: "rgba(255,255,255,0.35)", fontSize: 12.5, cursor: "pointer", width: "100%", fontFamily: "'DM Sans', sans-serif" }}>
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* HEADER */}
        <header style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", padding: "0 16px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 800, color: "#1A1917" }}>Dashboard</div>
              <div style={{ fontSize: 10, color: "#7A7670" }}>Terça-feira, 09 de junho de 2026</div>
            </div>
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
          <div style={{ background: "rgba(232,93,38,0.08)", border: "1px solid rgba(232,93,38,0.2)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>⏳</span>
              <div style={{ fontSize: 13, color: "#1A1917" }}>Período gratuito termina em <strong style={{ color: "#E85D26" }}>23 dias</strong>.</div>
            </div>
            <a href="#" style={{ fontSize: 12, fontWeight: 500, color: "#E85D26", textDecoration: "none" }}>Ver planos →</a>
          </div>

          {/* STATS */}
          <div className="stats-grid" style={{ marginBottom: 16 }}>
            {[
              { label: "Visualizações", value: "3.241", change: "▲ 18%", up: true, icon: "👁️", bg: "rgba(232,93,38,0.08)" },
              { label: "Contatos", value: "47", change: "▲ 9%", up: true, icon: "💬", bg: "rgba(22,163,74,0.08)" },
              { label: "Anúncios ativos", value: "18", change: "30 limite", up: false, icon: "🚗", bg: "rgba(37,99,235,0.08)" },
              { label: "Avaliação", value: "4.8", change: "24 avaliações", up: true, icon: "⭐", bg: "rgba(232,93,38,0.08)" },
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
              <table className="tabela-desktop" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F7F6F3" }}>
                    {["Veículo", "Status", "Preço", "Views", "Ações"].map(h => (
                      <th key={h} style={{ padding: "9px 14px", fontSize: 10, fontWeight: 500, color: "#7A7670", textAlign: "left", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {anuncios.map(car => (
                    <tr key={car.id} style={{ borderBottom: "1px solid #E8E6E1" }}>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ position: "relative", width: 48, height: 36, borderRadius: 6, overflow: "hidden", flexShrink: 0, border: "1px solid #E8E6E1" }}>
                            <Image src="/sem-foto.png" alt={car.name} fill style={{ objectFit: "cover" }} sizes="48px" />
                          </div>
                          <div>
                            <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917" }}>{car.name}</div>
                            <div style={{ fontSize: 11, color: "#7A7670" }}>{car.ano} · {car.km}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px" }}>{statusBadge(car.status)}</td>
                      <td style={{ padding: "11px 14px", fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917" }}>{car.price}</td>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: "#7A7670" }}>👁️ {car.views || "—"}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", gap: 5 }}>
                          {["✏️", "👁️", car.status === "pausado" ? "▶️" : "⏸️"].map((icon, i) => (
                            <button key={i} style={{ width: 28, height: 28, borderRadius: 6, border: "1.5px solid #E8E6E1", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12 }}>{icon}</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="cards-mobile" style={{ flexDirection: "column" }}>
                {anuncios.map(car => (
                  <div key={car.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #E8E6E1" }}>
                    <div style={{ position: "relative", width: 56, height: 42, borderRadius: 7, overflow: "hidden", flexShrink: 0, border: "1px solid #E8E6E1" }}>
                      <Image src="/sem-foto.png" alt={car.name} fill style={{ objectFit: "cover" }} sizes="56px" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917", marginBottom: 2 }}>{car.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {statusBadge(car.status)}
                        <span style={{ fontSize: 11, color: "#7A7670" }}>👁️ {car.views || "—"}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917" }}>{car.price}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        {["✏️", "⏸️"].map((icon, i) => (
                          <button key={i} style={{ width: 26, height: 26, borderRadius: 5, border: "1.5px solid #E8E6E1", background: "#F7F6F3", cursor: "pointer", fontSize: 11 }}>{icon}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Contatos recentes</div>
                  <a href="#" style={{ fontSize: 12, color: "#E85D26", fontWeight: 500, textDecoration: "none" }}>Ver todos →</a>
                </div>
                {contatos.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: i < contatos.length - 1 ? "1px solid #E8E6E1" : "none", cursor: "pointer" }}>
                    <span style={{ width: 7, height: 7, background: c.lido ? "transparent" : "#E85D26", borderRadius: "50%", flexShrink: 0, border: c.lido ? "1.5px solid #E8E6E1" : "none" }}></span>
                    <div style={{ width: 32, height: 32, background: "#F7F6F3", border: "1px solid #E8E6E1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👤</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#1A1917" }}>{c.nome}</div>
                      <div style={{ fontSize: 11, color: "#7A7670" }}>{c.carro}</div>
                    </div>
                    <div style={{ fontSize: 10.5, color: "#7A7670" }}>{c.tempo}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Visitas esta semana</div>
                </div>
                <div style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70, marginBottom: 8 }}>
                    {[{ h: 45, d: "Seg" }, { h: 60, d: "Ter" }, { h: 75, d: "Qua", a: true }, { h: 50, d: "Qui" }, { h: 65, d: "Sex" }, { h: 40, d: "Sáb" }, { h: 30, d: "Dom" }].map((b: { h: number; d: string; a?: boolean }) => (
                      <div key={b.d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: "100%", height: b.h, background: b.a ? "#E85D26" : "rgba(232,93,38,0.12)", borderRadius: "4px 4px 0 0" }}></div>
                        <span style={{ fontSize: 9, color: "#7A7670" }}>{b.d}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7A7670" }}>
                    <span>Visitas</span>
                    <span>Total: <strong style={{ color: "#1A1917" }}>365</strong></span>
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
                {[["Plano atual", "⭐ Profissional", "#E85D26"], ["Anúncios usados", "18 / 30", "#1A1917"], ["Período gratuito", "23 dias restantes", "#E85D26"], ["Destaque patrocinado", "Não contratado", "#7A7670"], ["Loja verificada", "✅ Sim", "#16A34A"]].map(([label, value, color]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E8E6E1" }}>
                    <span style={{ fontSize: 12.5, color: "#7A7670" }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#F7F6F3", border: "1.5px solid #E8E6E1", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#7A7670", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
                    🎟️ Resgatar cupom
                  </div>
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
              </div>
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
          { id: "mensagens", icon: "💬", label: "Msgs", badge: "5" },
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
                {item.badge && <span style={{ position: "absolute", top: 0, right: 8, background: "#E85D26", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 8 }}>{item.badge}</span>}
              </button>
        ))}
      </div>

    </div>
  );
}