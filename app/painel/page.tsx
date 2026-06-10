"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Painel() {
  const [abaAtiva, setAbaAtiva] = useState("dashboard");

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
      analise: { bg: "rgba(37,99,235,0.08)", color: "#2563EB", label: "🕐 Em análise" },
    };
    const s = map[status];
    return <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10.5, fontWeight: 500, padding: "3px 9px", borderRadius: 20, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{s.label}</span>;
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", minHeight: "100vh", background: "#F7F6F3" }}>

      {/* SIDEBAR */}
      <aside style={{ width: 240, background: "#111009", minHeight: "100vh", position: "fixed", top: 0, left: 0, display: "flex", flexDirection: "column", zIndex: 50 }}>
        <Link href="/" style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo.png" alt="AutoRegião" width={32} height={32} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 800, color: "#fff" }}><span style={{ color: "#E85D26" }}>Auto</span>Região</span>
        </Link>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, background: "#E85D26", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏪</div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>Auto Paulista</div>
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
            <button key={item.id} onClick={() => setAbaAtiva(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: abaAtiva === item.id ? "#E85D26" : "transparent", color: abaAtiva === item.id ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 13.5, fontWeight: 500, cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "'DM Sans', sans-serif" }}>
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
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40 }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 800, color: "#1A1917" }}>Dashboard</div>
            <div style={{ fontSize: 11, color: "#7A7670", marginTop: 1 }}>Terça-feira, 09 de junho de 2026</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={{ padding: "7px 16px", background: "#E85D26", border: "none", borderRadius: 7, fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>+ Novo Anúncio</button>
            <div style={{ width: 34, height: 34, border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, position: "relative" }}>
              🔔<span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, background: "#E85D26", borderRadius: "50%", border: "1.5px solid #fff" }}></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#F7F6F3", cursor: "pointer" }}>
              <div style={{ width: 26, height: 26, background: "#E85D26", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>👤</div>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "#1A1917" }}>Rodrigo</span>
            </div>
          </div>
        </header>

        <div style={{ padding: "22px 28px", flex: 1 }}>
          <div style={{ background: "rgba(232,93,38,0.08)", border: "1px solid rgba(232,93,38,0.2)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>⏳</span>
              <div style={{ fontSize: 13, color: "#1A1917" }}>Seu período gratuito termina em <strong style={{ color: "#E85D26" }}>23 dias</strong>. Assine um plano para continuar anunciando.</div>
            </div>
            <a href="#" style={{ fontSize: 12.5, fontWeight: 500, color: "#E85D26", textDecoration: "none", borderBottom: "1px solid rgba(232,93,38,0.3)", whiteSpace: "nowrap" }}>Ver planos →</a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Visualizações (mês)", value: "3.241", change: "▲ 18%", up: true, icon: "👁️", bg: "rgba(232,93,38,0.08)" },
              { label: "Contatos recebidos", value: "47", change: "▲ 9%", up: true, icon: "💬", bg: "rgba(22,163,74,0.08)" },
              { label: "Anúncios ativos", value: "18", change: "2 pausados · 30 limite", up: false, icon: "🚗", bg: "rgba(37,99,235,0.08)" },
              { label: "Avaliação da loja", value: "4.8", change: "▲ 24 avaliações", up: true, icon: "⭐", bg: "rgba(232,93,38,0.08)" },
            ].map(stat => (
              <div key={stat.label} style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: "#7A7670", fontWeight: 500 }}>{stat.label}</span>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{stat.icon}</div>
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 800, color: "#1A1917", lineHeight: 1, marginBottom: 5 }}>{stat.value}</div>
                <div style={{ fontSize: 11.5, fontWeight: 500, color: stat.up ? "#16A34A" : "#7A7670" }}>{stat.change}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 16 }}>
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Anúncios recentes</div>
                <a href="#" style={{ fontSize: 12, color: "#E85D26", fontWeight: 500, textDecoration: "none" }}>Ver todos →</a>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F7F6F3" }}>
                    {["Veículo", "Status", "Preço", "Visualizações", "Ações"].map(h => (
                      <th key={h} style={{ padding: "9px 14px", fontSize: 10, fontWeight: 500, color: "#7A7670", textAlign: "left", letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
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
                            <div style={{ fontSize: 11, color: "#7A7670", marginTop: 1 }}>{car.ano} · {car.km}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px" }}>{statusBadge(car.status)}</td>
                      <td style={{ padding: "11px 14px", fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>{car.price}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#7A7670" }}>👁️ {car.views || "—"}</td>
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
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Contatos recentes</div>
                  <a href="#" style={{ fontSize: 12, color: "#E85D26", fontWeight: 500, textDecoration: "none" }}>Ver todos →</a>
                </div>
                {contatos.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderBottom: i < contatos.length - 1 ? "1px solid #E8E6E1" : "none", cursor: "pointer" }}>
                    <span style={{ width: 7, height: 7, background: c.lido ? "transparent" : "#E85D26", borderRadius: "50%", flexShrink: 0, border: c.lido ? "1.5px solid #E8E6E1" : "none" }}></span>
                    <div style={{ width: 34, height: 34, background: "#F7F6F3", border: "1px solid #E8E6E1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👤</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#1A1917" }}>{c.nome}</div>
                      <div style={{ fontSize: 11, color: "#7A7670", marginTop: 1 }}>{c.carro}</div>
                    </div>
                    <div style={{ fontSize: 10.5, color: "#7A7670", flexShrink: 0 }}>{c.tempo}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Visitas esta semana</div>
                </div>
                <div style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, marginBottom: 8 }}>
                    {[{ h: 45, d: "Seg" }, { h: 60, d: "Ter" }, { h: 75, d: "Qua", a: true }, { h: 50, d: "Qui" }, { h: 65, d: "Sex" }, { h: 40, d: "Sáb" }, { h: 30, d: "Dom" }].map((b: { h: number; d: string; a?: boolean }) => (
                      <div key={b.d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: "100%", height: b.h, background: b.a ? "#E85D26" : "rgba(232,93,38,0.12)", borderRadius: "4px 4px 0 0" }}></div>
                        <span style={{ fontSize: 9.5, color: "#7A7670" }}>{b.d}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7A7670" }}>
                    <span>Visitas aos anúncios</span>
                    <span>Total: <strong style={{ color: "#1A1917" }}>365</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Ações rápidas</div>
              </div>
              <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["➕", "Novo anúncio"], ["⭐", "Contratar destaque"], ["📊", "Ver estatísticas"], ["🏪", "Editar perfil"], ["📱", "Gerar QR Code"], ["💬", "Ver mensagens"]].map(([icon, label]) => (
                  <button key={label} style={{ padding: 14, border: "1.5px solid #E8E6E1", borderRadius: 10, background: "#F7F6F3", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 500, color: "#1A1917" }}>{label}</div>
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
              <div style={{ padding: "14px 18px" }}>
                <button style={{ width: "100%", padding: 10, background: "#E85D26", color: "#fff", border: "none", borderRadius: 8, fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Assinar plano — R$ 159/mês</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
