import Image from "next/image";
import Link from "next/link";

export default function PerfilLoja({ params }: { params: { id: string } }) {
  const loja = {
    id: params.id,
    nome: "Auto Paulista",
    cidade: "Lençóis Paulista",
    estado: "SP",
    telefone: "(14) 99876-5432",
    whatsapp: "(14) 99876-5432",
    descricao: "Somos uma revenda de seminovos com mais de 10 anos de mercado em Lençóis Paulista e região. Trabalhamos com veículos revisados, com procedência garantida e financiamento facilitado.",
    desde: "2014",
    avaliacao: 4.8,
    totalAvaliacoes: 127,
    totalVeiculos: 23,
    vendidos: 312,
    horario: "Seg–Sex: 8h às 18h | Sáb: 8h às 13h",
    endereco: "Av. Brasil, 1.450 – Centro",
    plano: "Premium",
  };

  const veiculos = [
    { id: 1, name: "Chevrolet Onix LT", ano: "2022", km: "38.000 km", price: "R$ 72.900", featured: true },
    { id: 5, name: "Honda HR-V EXL", ano: "2023", km: "14.000 km", price: "R$ 127.000", featured: false },
    { id: 9, name: "Fiat Strada Endurance", ano: "2022", km: "35.000 km", price: "R$ 88.900", featured: false },
    { id: 3, name: "Tracker Premier", ano: "2023", km: "9.000 km", price: "R$ 139.900", featured: true },
  ];

  const avaliacoes = [
    { nome: "Carlos M.", nota: 5, texto: "Excelente atendimento! Comprei meu Onix e foi tudo muito tranquilo. Recomendo!", data: "Mai 2026" },
    { nome: "Ana L.", nota: 5, texto: "Muito profissionais, veículo exatamente como descrito no anúncio.", data: "Abr 2026" },
    { nome: "Roberto S.", nota: 4, texto: "Bom atendimento e bom preço. Processo de financiamento foi rápido.", data: "Mar 2026" },
  ];

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo.png" alt="AutoRegião" width={36} height={36} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 800, color: "#1A1917" }}>
            <span style={{ color: "#E85D26" }}>Auto</span>Região
          </span>
        </Link>
        <Link href="/veiculos" style={{ fontSize: 13, color: "#7A7670", textDecoration: "none" }}>← Ver todos os veículos</Link>
      </nav>

      <div style={{ paddingTop: 60 }}>

        {/* HEADER DA LOJA */}
        <div style={{ background: "#1A1917", padding: "32px 24px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
            {/* AVATAR */}
            <div style={{ width: 80, height: 80, borderRadius: 16, background: "#E85D26", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>
              🏪
            </div>
            {/* INFO */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 800, color: "#fff" }}>{loja.nome}</span>
                {loja.plano === "Premium" && (
                  <span style={{ background: "#E85D26", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20 }}>⭐ Premium</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>
                📍 {loja.cidade}, {loja.estado} · Na plataforma desde {loja.desde}
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  [`⭐ ${loja.avaliacao}`, `${loja.totalAvaliacoes} avaliações`],
                  [`🚗 ${loja.totalVeiculos}`, "veículos ativos"],
                  [`✅ ${loja.vendidos}`, "vendidos"],
                ].map(([num, label]) => (
                  <div key={label}>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>{num}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* CONTATO */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <a href={`tel:${loja.telefone}`} style={{ padding: "8px 16px", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
                📞 Ligar
              </a>
              <a href={`https://wa.me/55${loja.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: "8px 16px", background: "#25D366", border: "none", borderRadius: 8, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>

          {/* COLUNA PRINCIPAL */}
          <div>
            {/* VEÍCULOS */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 800, color: "#1A1917", marginBottom: 14 }}>
                Veículos à venda <span style={{ fontSize: 13, color: "#7A7670", fontFamily: "DM Sans, sans-serif", fontWeight: 400 }}>({loja.totalVeiculos} anúncios)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                {veiculos.map(car => (
                  <Link key={car.id} href={`/veiculo/${car.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: car.featured ? "1.5px solid #E85D26" : "1.5px solid #E8E6E1", position: "relative" }}>
                      {car.featured && <span style={{ position: "absolute", top: 8, left: 8, background: "#E85D26", color: "#fff", fontSize: 10, padding: "2px 7px", borderRadius: 20, zIndex: 2 }}>⭐ Destaque</span>}
                      <div style={{ position: "relative", height: 130 }}>
                        <Image src="/sem-foto.png" alt={car.name} fill style={{ objectFit: "cover" }} sizes="50vw" />
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917", marginBottom: 3 }}>{car.name}</div>
                        <div style={{ fontSize: 11, color: "#7A7670", marginBottom: 6 }}>{car.ano} · {car.km}</div>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 800, color: "#1A1917" }}>{car.price}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/veiculos" style={{ display: "block", textAlign: "center", marginTop: 14, padding: "10px", border: "1.5px solid #E8E6E1", borderRadius: 8, color: "#7A7670", textDecoration: "none", fontSize: 13 }}>
                Ver todos os {loja.totalVeiculos} veículos →
              </Link>
            </div>

            {/* AVALIAÇÕES */}
            <div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 800, color: "#1A1917", marginBottom: 14 }}>
                Avaliações <span style={{ fontSize: 13, color: "#7A7670", fontFamily: "DM Sans, sans-serif", fontWeight: 400 }}>⭐ {loja.avaliacao} · {loja.totalAvaliacoes} avaliações</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {avaliacoes.map((av, i) => (
                  <div key={i} style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E85D26", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                          {av.nome[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1917" }}>{av.nome}</div>
                          <div style={{ fontSize: 11, color: "#E85D26" }}>{"⭐".repeat(av.nota)}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: "#7A7670" }}>{av.data}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#7A7670", lineHeight: 1.5, margin: 0 }}>{av.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* SOBRE */}
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 10 }}>Sobre a loja</div>
              <p style={{ fontSize: 13, color: "#7A7670", lineHeight: 1.6, margin: 0 }}>{loja.descricao}</p>
            </div>

            {/* INFORMAÇÕES */}
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 12 }}>Informações</div>
              {[
                ["📍", "Endereço", loja.endereco],
                ["🕐", "Horário", loja.horario],
                ["📞", "Telefone", loja.telefone],
              ].map(([icon, label, value]) => (
                <div key={label} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#1A1917", marginTop: 1 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA WHATSAPP */}
            <a href={`https://wa.me/55${loja.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
              style={{ display: "block", background: "#25D366", borderRadius: 12, padding: "16px", textAlign: "center", textDecoration: "none" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>💬</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Falar com a loja</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>Responde pelo WhatsApp</div>
            </a>

          </div>
        </div>
      </div>
    </main>
  );
}
