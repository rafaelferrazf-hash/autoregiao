import Image from "next/image";

export default function Home() {
  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo.png" alt="AutoRegião" width={38} height={38} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 800, color: "#1A1917" }}>
            <span style={{ color: "#E85D26" }}>Auto</span>Região
          </span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Buscar veículos", "Revendas", "Tabela FIPE", "Financiamento", "Anunciar"].map(item => (
            <a key={item} href="#" style={{ textDecoration: "none", color: "#7A7670", fontSize: 13.5, fontWeight: 500 }}>{item}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "7px 16px", border: "1.5px solid #E8E6E1", borderRadius: 7, background: "transparent", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Entrar</button>
          <button style={{ padding: "7px 16px", background: "#E85D26", border: "none", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Cadastrar loja</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ marginTop: 60, background: "#1A1917", padding: "56px 24px 0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "55% 45%", gap: 40, alignItems: "end" }}>
          <div style={{ paddingBottom: 48 }}>
            <span style={{ display: "inline-block", background: "rgba(232,93,38,0.15)", color: "#E85D26", fontSize: 11, fontWeight: 500, letterSpacing: 1.5, padding: "4px 10px", borderRadius: 4, marginBottom: 16, textTransform: "uppercase" }}>
              📍 Lençóis Paulista e região
            </span>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 44, fontWeight: 800, color: "#fff", lineHeight: 1.08, letterSpacing: -1, marginBottom: 14 }}>
              O carro certo,<br /><span style={{ color: "#E85D26" }}>perto de você.</span>
            </h1>
            <p style={{ color: "#7A7670", fontSize: 15, lineHeight: 1.65, marginBottom: 28, maxWidth: 400 }}>
              Encontre seminovos de lojistas da sua cidade. Sem intermediários, sem complicação.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ padding: "11px 24px", background: "#E85D26", color: "#fff", border: "none", borderRadius: 8, fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Ver veículos</button>
              <button style={{ padding: "11px 20px", background: "transparent", color: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>Como funciona</button>
            </div>
            <div style={{ display: "flex", gap: 28, marginTop: 36, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              {[["1.2k+", "Veículos anunciados"], ["48+", "Lojas cadastradas"], ["12+", "Cidades atendidas"]].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800, color: "#fff" }}>{num}</div>
                  <div style={{ fontSize: 11, color: "#7A7670", marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "14px 14px 0 0", padding: "20px 18px", position: "relative" }}>
              <span style={{ position: "absolute", top: -11, left: 18, background: "#E85D26", color: "#fff", fontSize: 10.5, fontWeight: 500, padding: "3px 11px", borderRadius: 20 }}>⭐ Destaques da semana</span>
              {[["🚙", "Onix LT 1.0", "2022 · 38.000 km · Lençóis Paulista", "R$ 72.900"],
                ["🚘", "T-Cross TSI", "2022 · 29.000 km · Bauru", "R$ 118.000"],
                ["🚗", "Tracker Premier", "2023 · 9.000 km · Jaú", "R$ 139.900"]].map(([icon, name, meta, price]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", background: "rgba(255,255,255,0.06)", borderRadius: 9, marginBottom: 8, cursor: "pointer" }}>
                  <div style={{ width: 50, height: 36, background: "rgba(232,93,38,0.15)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 12.5, fontWeight: 700, color: "#fff" }}>{name}</div>
                    <div style={{ fontSize: 10.5, color: "#7A7670", marginTop: 1 }}>{meta}</div>
                  </div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#E85D26", flexShrink: 0 }}>{price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", padding: 24 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {["🚗 Carros", "🏍️ Motos", "🚐 Utilitários"].map((tab, i) => (
              <button key={tab} style={{ padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", background: i === 0 ? "#E85D26" : "transparent", color: i === 0 ? "#fff" : "#7A7670" }}>{tab}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            {[["Marca / Modelo", "Ex: Onix, HB20, Corolla..."],
              ["Cidade", "Todas as cidades"],
              ["Ano", "Qualquer ano"],
              ["Preço até", "Qualquer valor"],
              ["KM até", "Qualquer km"]].map(([label, placeholder]) => (
              <div key={label}>
                <div style={{ fontSize: 10.5, fontWeight: 500, color: "#7A7670", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
                <input placeholder={placeholder} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 13.5, color: "#1A1917", background: "#F7F6F3", outline: "none" }} />
              </div>
            ))}
            <button style={{ padding: "9px 22px", background: "#E85D26", color: "#fff", border: "none", borderRadius: 7, fontFamily: "Georgia, serif", fontSize: 13.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>🔍 Buscar</button>
          </div>
        </div>
      </section>

      {/* VEÍCULOS */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 1.8, color: "#E85D26", textTransform: "uppercase", marginBottom: 4 }}>Recém adicionados</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800, color: "#1A1917" }}>Veículos disponíveis</div>
          </div>
          <a href="#" style={{ fontSize: 13, fontWeight: 500, color: "#E85D26", textDecoration: "none" }}>Ver todos →</a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { name: "Chevrolet Onix LT", tags: ["2022", "38.000 km", "Flex"], price: "R$ 72.900", parcel: "60x R$ 1.580", store: "Auto Paulista · Lençóis Paulista", featured: true },
            { name: "VW T-Cross TSI", tags: ["2022", "29.000 km", "Gasolina"], price: "R$ 118.000", parcel: "60x R$ 2.560", store: "Bauru Motors · Bauru", featured: false },
            { name: "Tracker Premier", tags: ["2023", "9.000 km", "Flex"], price: "R$ 139.900", parcel: "60x R$ 3.040", store: "Jaú Veículos · Jaú", featured: false },
            { name: "Fiat Pulse Drive", tags: ["2023", "18.000 km", "Flex"], price: "R$ 98.500", parcel: "60x R$ 2.140", store: "Regional Car · Botucatu", featured: false },
          ].map(car => (
            <div key={car.name} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: car.featured ? "1.5px solid #E85D26" : "1.5px solid #E8E6E1", cursor: "pointer", position: "relative" }}>
              {car.featured && <span style={{ position: "absolute", top: 9, left: 9, background: "#E85D26", color: "#fff", fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 20, zIndex: 2 }}>⭐ Destaque</span>}
              <div style={{ position: "relative", height: 180, width: "100%" }}>
                <Image
                  src="/sem-foto.png"
                  alt={car.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 6 }}>{car.name}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                  {car.tags.map(tag => <span key={tag} style={{ fontSize: 11, color: "#7A7670", background: "#F7F6F3", padding: "2px 6px", borderRadius: 4 }}>{tag}</span>)}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #E8E6E1" }}>
                  <div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: "#1A1917" }}>{car.price}</div>
                    <div style={{ fontSize: 10.5, color: "#7A7670" }}>{car.parcel}</div>
                  </div>
                  <button style={{ width: 30, height: 30, background: "#F7F6F3", border: "1.5px solid #E8E6E1", borderRadius: 7, cursor: "pointer", fontSize: 12 }}>🤍</button>
                </div>
                <div style={{ fontSize: 11, color: "#7A7670", marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 5, height: 5, background: "#E85D26", borderRadius: "50%", display: "inline-block" }}></span>{car.store}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 56px" }}>
        <div style={{ background: "#E85D26", borderRadius: 16, padding: "48px 52px", display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: 1.8, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", marginBottom: 10, fontWeight: 500 }}>Para lojistas</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 10 }}>Sua loja no maior marketplace<br />regional do interior</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.55 }}>Alcance compradores da sua cidade e região. Anuncie, gerencie e receba contatos pelo site.</div>
            <span style={{ display: "inline-block", background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11.5, fontWeight: 500, padding: "4px 12px", borderRadius: 20, marginTop: 14 }}>✅ 60 dias grátis para começar</span>
          </div>
          <button style={{ padding: "14px 30px", background: "#fff", color: "#E85D26", border: "none", borderRadius: 9, fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>Cadastrar minha loja →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1A1917", padding: "44px 24px 28px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr", gap: 40, paddingBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Image src="/logo.png" alt="AutoRegião" width={32} height={32} style={{ objectFit: "contain" }} />
              <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800 }}><span style={{ color: "#E85D26" }}>Auto</span><span style={{ color: "#fff" }}>Região</span></span>
            </div>
            <p style={{ fontSize: 13, color: "#7A7670", marginTop: 8, lineHeight: 1.6 }}>O carro da sua região. Conectando compradores e lojistas no interior do Brasil.</p>
          </div>
          {[["Para compradores", ["Buscar veículos", "Tabela FIPE", "Financiamento", "Comparar", "Alertas"]],
            ["Para lojistas", ["Cadastrar loja", "Planos e preços", "Destaque", "Painel"]],
            ["AutoRegião", ["Sobre nós", "Contato", "Termos", "Privacidade", "App mobile"]]].map(([title, links]) => (
            <div key={title as string}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 14 }}>{title as string}</div>
              {(links as string[]).map(link => <div key={link} style={{ marginBottom: 9 }}><a href="#" style={{ color: "#7A7670", textDecoration: "none", fontSize: 13 }}>{link}</a></div>)}
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1180, margin: "20px auto 0", display: "flex", justifyContent: "space-between" }}>
          <p style={{ fontSize: 12, color: "#7A7670" }}>© 2025 <span style={{ color: "#E85D26" }}>AutoRegião</span> · autoregiao.com.br</p>
          <p style={{ fontSize: 12, color: "#7A7670" }}>Desenvolvido com ❤️ para o interior do Brasil</p>
        </div>
      </footer>

    </main>
  );
}
