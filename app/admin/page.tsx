"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Admin() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("Dashboard");

  const stats = [
    { label: "Lojas cadastradas", value: "48", icon: "🏪", change: "+3 essa semana" },
    { label: "Veículos anunciados", value: "1.247", icon: "🚗", change: "+28 essa semana" },
    { label: "Usuários cadastrados", value: "3.891", icon: "👥", change: "+142 esse mês" },
    { label: "Receita mensal", value: "R$ 4.820", icon: "💰", change: "+12% vs mês anterior" },
  ];

  const lojas = [
    { id: 1, nome: "Auto Paulista", cidade: "Lençóis Paulista", plano: "Premium", veiculos: 23, status: "ativo", vencimento: "15/07/2026" },
    { id: 2, nome: "Bauru Motors", cidade: "Bauru", plano: "Profissional", veiculos: 18, status: "ativo", vencimento: "22/07/2026" },
    { id: 3, nome: "Jaú Veículos", cidade: "Jaú", plano: "Básico", veiculos: 7, status: "ativo", vencimento: "08/07/2026" },
    { id: 4, nome: "Regional Car", cidade: "Botucatu", plano: "Profissional", veiculos: 14, status: "trial", vencimento: "Trial — 18 dias" },
    { id: 5, nome: "Top Car Marília", cidade: "Marília", plano: "Básico", veiculos: 5, status: "trial", vencimento: "Trial — 42 dias" },
    { id: 6, nome: "Avaré Seminovos", cidade: "Avaré", plano: "—", veiculos: 0, status: "inativo", vencimento: "Expirado" },
  ];

  const anunciosRecentes = [
    { id: 9, veiculo: "Fiat Strada Endurance 2022", loja: "Auto Paulista", preco: "R$ 88.900", status: "ativo" },
    { id: 8, veiculo: "VW Polo Track 2023", loja: "Regional Car", preco: "R$ 76.500", status: "ativo" },
    { id: 7, veiculo: "Hyundai HB20 Diamond 2023", loja: "Jaú Veículos", preco: "R$ 82.900", status: "ativo" },
    { id: 6, veiculo: "Toyota Corolla XEi 2022", loja: "Bauru Motors", preco: "R$ 148.000", status: "pausado" },
  ];

  const planoColor: Record<string, string> = { Premium: "#E85D26", Profissional: "#3B82F6", Básico: "#7A7670", "—": "#E8E6E1" };
  const statusColor: Record<string, { bg: string; color: string }> = {
    ativo: { bg: "#D1FAE5", color: "#065F46" },
    trial: { bg: "#FEF3C7", color: "#92400E" },
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
          <div style={{ fontSize: 13, color: "#7A7670" }}>Visão geral do AutoRegião — Junho 2026</div>
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
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 16 }}>Receita por plano</div>
            {[
              { plano: "Premium", lojas: 8, valor: "R$ 2.392", pct: 50 },
              { plano: "Profissional", lojas: 14, valor: "R$ 2.226", pct: 46 },
              { plano: "Básico", lojas: 26, valor: "R$ 202", pct: 4 },
            ].map(r => (
              <div key={r.plano} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: "#1A1917", fontWeight: 500 }}>{r.plano} <span style={{ color: "#7A7670", fontWeight: 400 }}>({r.lojas} lojas)</span></span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1917" }}>{r.valor}</span>
                </div>
                <div style={{ height: 6, background: "#F7F6F3", borderRadius: 3 }}>
                  <div style={{ height: 6, background: planoColor[r.plano], borderRadius: 3, width: `${r.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "20px" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 16 }}>Lojas por status</div>
            {[
              { label: "Ativas (assinantes)", valor: 32, cor: "#D1FAE5", corTexto: "#065F46" },
              { label: "Em período trial", valor: 14, cor: "#FEF3C7", corTexto: "#92400E" },
              { label: "Inativas / Expiradas", valor: 2, cor: "#FEE2E2", corTexto: "#991B1B" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: s.cor, borderRadius: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: s.corTexto, fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: s.corTexto }}>{s.valor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LOJAS */}
        <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "20px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#1A1917" }}>Lojas cadastradas</div>
            <button style={{ padding: "6px 14px", background: "#E85D26", border: "none", borderRadius: 7, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Nova loja</button>
          </div>

          {/* TABELA DESKTOP */}
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
                  <td style={{ padding: "12px 8px" }}><span style={{ fontSize: 11, fontWeight: 600, color: planoColor[loja.plano] }}>{loja.plano}</span></td>
                  <td style={{ padding: "12px 8px", fontSize: 13, color: "#1A1917" }}>{loja.veiculos}</td>
                  <td style={{ padding: "12px 8px" }}><span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: statusColor[loja.status].bg, color: statusColor[loja.status].color }}>{loja.status}</span></td>
                  <td style={{ padding: "12px 8px", fontSize: 12, color: "#7A7670" }}>{loja.vencimento}</td>
                  <td style={{ padding: "12px 8px" }}><Link href={`/loja/${loja.id}`} style={{ fontSize: 12, color: "#E85D26", textDecoration: "none", fontWeight: 500 }}>Ver →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* CARDS MOBILE */}
          <div className="cards-admin" style={{ flexDirection: "column", gap: 10 }}>
            {lojas.map(loja => (
              <div key={loja.id} style={{ border: "1.5px solid #E8E6E1", borderRadius: 10, padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>{loja.nome}</div>
                    <div style={{ fontSize: 12, color: "#7A7670" }}>📍 {loja.cidade}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: statusColor[loja.status].bg, color: statusColor[loja.status].color }}>{loja.status}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: planoColor[loja.plano] }}>📋 {loja.plano}</span>
                  <span style={{ fontSize: 11, color: "#7A7670" }}>🚗 {loja.veiculos} veículos</span>
                  <span style={{ fontSize: 11, color: "#7A7670" }}>📅 {loja.vencimento}</span>
                </div>
                <Link href={`/loja/${loja.id}`} style={{ fontSize: 12, color: "#E85D26", textDecoration: "none", fontWeight: 500 }}>Ver detalhes →</Link>
              </div>
            ))}
          </div>
        </div>

        {/* ANÚNCIOS */}
        <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "20px" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 16 }}>Anúncios recentes</div>

          {/* TABELA DESKTOP */}
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
                  <td style={{ padding: "12px 8px", fontSize: 13, fontWeight: 600, color: "#1A1917" }}>{a.veiculo}</td>
                  <td style={{ padding: "12px 8px", fontSize: 13, color: "#7A7670" }}>{a.loja}</td>
                  <td style={{ padding: "12px 8px", fontSize: 13, fontFamily: "Georgia, serif", fontWeight: 700, color: "#1A1917" }}>{a.preco}</td>
                  <td style={{ padding: "12px 8px" }}><span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: statusColor[a.status].bg, color: statusColor[a.status].color }}>{a.status}</span></td>
                  <td style={{ padding: "12px 8px" }}><Link href={`/veiculo/${a.id}`} style={{ fontSize: 12, color: "#E85D26", textDecoration: "none", fontWeight: 500 }}>Ver →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* CARDS MOBILE */}
          <div className="cards-admin" style={{ flexDirection: "column", gap: 10 }}>
            {anunciosRecentes.map(a => (
              <div key={a.id} style={{ border: "1.5px solid #E8E6E1", borderRadius: 10, padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917", flex: 1, marginRight: 8 }}>{a.veiculo}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: statusColor[a.status].bg, color: statusColor[a.status].color, flexShrink: 0 }}>{a.status}</span>
                </div>
                <div style={{ fontSize: 12, color: "#7A7670", marginBottom: 4 }}>🏪 {a.loja}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#E85D26" }}>{a.preco}</span>
                  <Link href={`/veiculo/${a.id}`} style={{ fontSize: 12, color: "#E85D26", textDecoration: "none", fontWeight: 500 }}>Ver →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}