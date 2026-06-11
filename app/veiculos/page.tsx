"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Veiculos() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const carros = [
    { id: 1, name: "Chevrolet Onix LT", ano: "2022", km: "38.000 km", cambio: "Automático", combustivel: "Flex", price: "R$ 72.900", parcel: "60x R$ 1.580", store: "Auto Paulista", city: "Lençóis Paulista", featured: true },
    { id: 2, name: "VW T-Cross TSI", ano: "2022", km: "29.000 km", cambio: "Automático", combustivel: "Gasolina", price: "R$ 118.000", parcel: "60x R$ 2.560", store: "Bauru Motors", city: "Bauru", featured: true },
    { id: 3, name: "Tracker Premier", ano: "2023", km: "9.000 km", cambio: "Automático", combustivel: "Flex", price: "R$ 139.900", parcel: "60x R$ 3.040", store: "Jaú Veículos", city: "Jaú", featured: false },
    { id: 4, name: "Fiat Pulse Drive", ano: "2023", km: "18.000 km", cambio: "Automático", combustivel: "Flex", price: "R$ 98.500", parcel: "60x R$ 2.140", store: "Regional Car", city: "Botucatu", featured: false },
    { id: 5, name: "Honda HR-V EXL", ano: "2023", km: "14.000 km", cambio: "Automático", combustivel: "Flex", price: "R$ 127.000", parcel: "60x R$ 2.760", store: "Auto Paulista", city: "Lençóis Paulista", featured: false },
    { id: 6, name: "Toyota Corolla XEi", ano: "2022", km: "41.000 km", cambio: "Automático", combustivel: "Flex", price: "R$ 148.000", parcel: "60x R$ 3.220", store: "Bauru Motors", city: "Bauru", featured: false },
    { id: 7, name: "Hyundai HB20 Diamond", ano: "2023", km: "12.000 km", cambio: "Automático", combustivel: "Flex", price: "R$ 82.900", parcel: "60x R$ 1.800", store: "Jaú Veículos", city: "Jaú", featured: false },
    { id: 8, name: "VW Polo Track", ano: "2023", km: "22.000 km", cambio: "Manual", combustivel: "Flex", price: "R$ 76.500", parcel: "60x R$ 1.660", store: "Regional Car", city: "Botucatu", featured: false },
    { id: 9, name: "Fiat Strada Endurance", ano: "2022", km: "35.000 km", cambio: "Manual", combustivel: "Flex", price: "R$ 88.900", parcel: "60x R$ 1.930", store: "Auto Paulista", city: "Lençóis Paulista", featured: false },
  ];

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh" }}>

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile { display: none !important; }
        .search-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto; gap: 10px; align-items: end; }
        .content-grid { display: grid; grid-template-columns: 260px 1fr; gap: 20px; }
        .cars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .filtros-sidebar { display: block; }
        .filtros-mobile-btn { display: none !important; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
          .search-grid { grid-template-columns: 1fr !important; }
          .content-grid { grid-template-columns: 1fr !important; }
          .cars-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .filtros-sidebar { display: none !important; }
          .filtros-mobile-btn { display: flex !important; }
        }
        @media (max-width: 480px) {
          .cars-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E8E6E1" }}>
        <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo.png" alt="AutoRegião" width={32} height={32} style={{ objectFit: "contain" }} />
            <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: "#1A1917" }}>
              <span style={{ color: "#E85D26" }}>Auto</span>Região
            </span>
          </Link>
          <div style={{ display: "flex", gap: 24 }} className="nav-desktop">
            {["Buscar veículos", "Revendas", "Tabela FIPE", "Financiamento", "Anunciar"].map(item => (
              <a key={item} href="#" style={{ textDecoration: "none", color: "#7A7670", fontSize: 13.5, fontWeight: 500 }}>{item}</a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }} className="nav-desktop">
            <Link href="/login" style={{ padding: "7px 16px", border: "1.5px solid #E8E6E1", borderRadius: 7, background: "transparent", fontSize: 13, fontWeight: 500, color: "#1A1917", textDecoration: "none", display: "flex", alignItems: "center" }}>Entrar</Link>
            <Link href="/cadastro" style={{ padding: "7px 16px", background: "#E85D26", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center" }}>Cadastrar loja</Link>
          </div>
          <button className="nav-mobile" onClick={() => setMenuAberto(!menuAberto)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, transition: "all 0.2s", transform: menuAberto ? "rotate(45deg) translate(5px, 5px)" : "none" }}></span>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, opacity: menuAberto ? 0 : 1 }}></span>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, transition: "all 0.2s", transform: menuAberto ? "rotate(-45deg) translate(5px, -5px)" : "none" }}></span>
          </button>
        </div>
        {menuAberto && (
          <div className="nav-mobile" style={{ borderTop: "1px solid #E8E6E1", background: "#fff", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
            {["Buscar veículos", "Revendas", "Tabela FIPE", "Financiamento", "Anunciar"].map(item => (
              <a key={item} href="#" style={{ textDecoration: "none", color: "#1A1917", fontSize: 15, fontWeight: 500 }}>{item}</a>
            ))}
            <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #E8E6E1" }}>
              <Link href="/login" style={{ flex: 1, padding: "10px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 14, fontWeight: 500, color: "#1A1917", textDecoration: "none", textAlign: "center" }}>Entrar</Link>
              <Link href="/cadastro" style={{ flex: 1, padding: "10px", background: "#E85D26", borderRadius: 7, color: "#fff", fontSize: 14, fontWeight: 500, textDecoration: "none", textAlign: "center" }}>Cadastrar loja</Link>
            </div>
          </div>
        )}
      </nav>

      {/* SEARCH BAR */}
      <section style={{ marginTop: 60, background: "#1A1917", padding: "20px 16px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
            {["🚗 Carros", "🏍️ Motos", "🚐 Utilitários"].map((tab, i) => (
              <button key={tab} style={{ padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", background: i === 0 ? "#E85D26" : "rgba(255,255,255,0.1)", color: i === 0 ? "#fff" : "rgba(255,255,255,0.6)", whiteSpace: "nowrap", flexShrink: 0 }}>{tab}</button>
            ))}
          </div>
          <div className="search-grid">
            {[["Marca / Modelo", "Ex: Onix, HB20..."],
              ["Cidade", "Todas as cidades"],
              ["Ano", "Qualquer ano"],
              ["Preço até", "Qualquer valor"],
              ["KM até", "Qualquer km"]].map(([label, placeholder]) => (
              <div key={label}>
                <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
                <input placeholder={placeholder} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 7, fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.08)", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <button style={{ padding: "10px 22px", background: "#E85D26", color: "#fff", border: "none", borderRadius: 7, fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>🔍 Buscar</button>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px" }}>

        {/* BOTÃO FILTROS MOBILE */}
        <button className="filtros-mobile-btn" onClick={() => setFiltrosAbertos(!filtrosAbertos)}
          style={{ width: "100%", padding: "10px", background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "#1A1917", cursor: "pointer", marginBottom: 12, alignItems: "center", justifyContent: "center", gap: 8 }}>
          🔧 {filtrosAbertos ? "Fechar filtros" : "Filtrar veículos"}
        </button>

        {/* FILTROS MOBILE ABERTOS */}
        {filtrosAbertos && (
          <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "18px", marginBottom: 14 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 16 }}>Filtros</div>
            {[["Marca", ["Todas", "Chevrolet", "Volkswagen", "Fiat", "Toyota", "Honda", "Hyundai"]],
              ["Ano", ["Qualquer", "2024-2025", "2021-2023", "2018-2020", "Até 2017"]],
              ["Câmbio", ["Qualquer", "Automático", "Manual"]],
              ["Combustível", ["Qualquer", "Flex", "Gasolina", "Diesel", "Elétrico"]]].map(([title, opts]) => (
              <div key={title as string} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", marginBottom: 8 }}>{title as string}</div>
                <select style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none" }}>
                  {(opts as string[]).map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              <input placeholder="Preço mín" style={{ padding: "10px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none" }} />
              <input placeholder="Preço máx" style={{ padding: "10px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none" }} />
            </div>
            <button style={{ width: "100%", padding: "12px", background: "#E85D26", color: "#fff", border: "none", borderRadius: 8, fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Aplicar filtros</button>
          </div>
        )}

        <div className="content-grid">

          {/* FILTROS DESKTOP */}
          <aside className="filtros-sidebar">
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "18px", marginBottom: 14 }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 16 }}>Filtros</div>
              {[["Marca", ["Todas", "Chevrolet", "Volkswagen", "Fiat", "Toyota", "Honda", "Hyundai"]],
                ["Ano", ["Qualquer", "2024-2025", "2021-2023", "2018-2020", "Até 2017"]],
                ["Câmbio", ["Qualquer", "Automático", "Manual"]],
                ["Combustível", ["Qualquer", "Flex", "Gasolina", "Diesel", "Elétrico"]]].map(([title, opts]) => (
                <div key={title as string} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#7A7670", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>{title as string}</div>
                  <select style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 13, color: "#1A1917", background: "#F7F6F3", outline: "none" }}>
                    {(opts as string[]).map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", marginBottom: 8 }}>Faixa de preço</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input placeholder="Mín" style={{ padding: "8px 10px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 13, color: "#1A1917", background: "#F7F6F3", outline: "none" }} />
                  <input placeholder="Máx" style={{ padding: "8px 10px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 13, color: "#1A1917", background: "#F7F6F3", outline: "none" }} />
                </div>
              </div>
              <button style={{ width: "100%", padding: "10px", background: "#E85D26", color: "#fff", border: "none", borderRadius: 8, fontFamily: "Georgia, serif", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Aplicar filtros</button>
              <button style={{ width: "100%", padding: "8px", background: "transparent", color: "#7A7670", border: "none", fontSize: 12, cursor: "pointer", marginTop: 8 }}>Limpar filtros</button>
            </div>
            <div style={{ background: "#E85D26", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>🔔 Criar alerta</div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 12, lineHeight: 1.5 }}>Receba um aviso quando aparecer um veículo com esses filtros!</p>
              <button style={{ width: "100%", padding: "8px", background: "#fff", color: "#E85D26", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Criar alerta de busca</button>
            </div>
          </aside>

          {/* LISTA */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 800, color: "#1A1917" }}>1.247 veículos</span>
                <span style={{ fontSize: 12, color: "#7A7670", marginLeft: 6 }}>na sua região</span>
              </div>
              <select style={{ padding: "6px 12px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 13, color: "#1A1917", background: "#fff", outline: "none" }}>
                <option>Mais recentes</option>
                <option>Menor preço</option>
                <option>Maior preço</option>
                <option>Menor km</option>
              </select>
            </div>

            <div className="cars-grid">
              {carros.map(car => (
                <Link key={car.id} href={`/veiculo/${car.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: car.featured ? "1.5px solid #E85D26" : "1.5px solid #E8E6E1", position: "relative" }}>
                    {car.featured && <span style={{ position: "absolute", top: 8, left: 8, background: "#E85D26", color: "#fff", fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 20, zIndex: 2 }}>⭐ Destaque</span>}
                    <div style={{ position: "relative", height: 150, width: "100%" }}>
                      <Image src="/sem-foto.png" alt={car.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw" />
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917", marginBottom: 4 }}>{car.name}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 8 }}>
                        {[car.ano, car.km, car.combustivel].map(tag => (
                          <span key={tag} style={{ fontSize: 10, color: "#7A7670", background: "#F7F6F3", padding: "2px 5px", borderRadius: 4 }}>{tag}</span>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #E8E6E1" }}>
                        <div>
                          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 800, color: "#1A1917" }}>{car.price}</div>
                          <div style={{ fontSize: 10, color: "#7A7670" }}>{car.parcel}</div>
                        </div>
                        <button onClick={(e) => e.preventDefault()} style={{ width: 28, height: 28, background: "#F7F6F3", border: "1.5px solid #E8E6E1", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>🤍</button>
                      </div>
                      <div style={{ fontSize: 10.5, color: "#7A7670", marginTop: 5, display: "flex", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 5, height: 5, background: "#E85D26", borderRadius: "50%", display: "inline-block", flexShrink: 0 }}></span>
                        {car.store} · {car.city}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>
              {["‹", "1", "2", "3", "4", "5", "›"].map((p, i) => (
                <button key={i} style={{ width: 36, height: 36, borderRadius: 7, border: "1.5px solid", borderColor: i === 1 ? "#E85D26" : "#E8E6E1", background: i === 1 ? "#E85D26" : "#fff", color: i === 1 ? "#fff" : "#1A1917", fontSize: 13, fontWeight: i === 1 ? 700 : 400, cursor: "pointer" }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}