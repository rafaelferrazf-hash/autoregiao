"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Anunciar() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh" }}>

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile { display: none !important; }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        .numeros-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .planos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .depoimentos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 24px !important; text-align: center; }
          .numeros-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .planos-grid { grid-template-columns: 1fr !important; }
          .depoimentos-grid { grid-template-columns: 1fr !important; }
          .hero-btns { justify-content: center !important; }
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

      {/* HERO */}
      <section style={{ background: "#1A1917", padding: "100px 16px 64px", marginTop: 60 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="hero-grid">
            <div>
              <div style={{ display: "inline-block", background: "rgba(232,93,38,0.15)", border: "1px solid rgba(232,93,38,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#E85D26", fontWeight: 600, marginBottom: 20 }}>
                🚗 Plataforma nº1 da região
              </div>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
                Hora de vender?<br /><span style={{ color: "#E85D26" }}>A gente te ajuda!</span>
              </h1>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                Anuncie seu veículo para milhares de compradores da sua região. Simples, rápido e eficiente.
              </p>
              <div className="hero-btns" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/cadastro" style={{ padding: "14px 28px", background: "#E85D26", borderRadius: 9, color: "#fff", fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  🚀 Criar conta grátis
                </Link>
                <Link href="/login" style={{ padding: "14px 28px", background: "transparent", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 9, color: "#fff", fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Já tenho conta →
                </Link>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["✅", "Cadastro simples e rápido", "Em menos de 5 minutos seu anúncio está no ar"],
                ["📍", "Compradores da sua região", "Foco no interior de São Paulo"],
                ["💬", "Contato direto via WhatsApp", "Sem intermediários, negocie direto"],
                ["🔒", "Plataforma segura", "Lojas e anunciantes verificados"],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{title}</div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section style={{ background: "#fff", padding: "48px 16px", borderBottom: "1px solid #E8E6E1" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="numeros-grid">
            {[
              ["🏆", "Lançamento 2026", "Primeiro portal regional focado no interior paulista"],
              ["📍", "Lençóis Paulista", "Cidade sede, com expansão para toda a região"],
              ["🚗", "60 dias grátis", "Para lojas cadastradas no período de lançamento"],
              ["👥", "Suporte humano", "Atendimento personalizado para cada lojista"],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ textAlign: "center", padding: "20px 16px" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: "#1A1917", marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#7A7670", lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS LOJISTAS */}
      <section style={{ padding: "64px 16px", background: "#F7F6F3" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#E85D26", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Para lojas e revendas</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 800, color: "#1A1917", marginBottom: 12 }}>Planos para lojistas</h2>
            <p style={{ fontSize: 15, color: "#7A7670", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
              Escolha o plano ideal para o tamanho da sua revenda. Todos incluem 60 dias grátis no lançamento.
            </p>
          </div>

          <div className="planos-grid">
            {[
              { nome: "Básico", preco: "R$ 89", periodo: "/mês", anuncios: "Até 10 anúncios", recursos: ["Fotos ilimitadas", "WhatsApp direto", "Perfil da loja", "Suporte por e-mail"], destaque: false },
              { nome: "Profissional", preco: "R$ 159", periodo: "/mês", anuncios: "Até 30 anúncios", recursos: ["Fotos ilimitadas", "WhatsApp direto", "Perfil da loja", "Destaque nos resultados", "Suporte prioritário", "Estatísticas avançadas"], destaque: true },
              { nome: "Premium", preco: "R$ 299", periodo: "/mês", anuncios: "Anúncios ilimitados", recursos: ["Fotos ilimitadas", "WhatsApp direto", "Perfil da loja", "Destaque nos resultados", "Banner na cidade", "Suporte VIP 24h", "Relatórios mensais"], destaque: false },
            ].map(plano => (
              <div key={plano.nome} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: plano.destaque ? "2px solid #E85D26" : "1.5px solid #E8E6E1", position: "relative" }}>
                {plano.destaque && (
                  <div style={{ background: "#E85D26", padding: "6px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>
                    ⭐ MAIS POPULAR
                  </div>
                )}
                <div style={{ padding: "28px 24px" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 800, color: "#1A1917", marginBottom: 4 }}>{plano.nome}</div>
                  <div style={{ fontSize: 12, color: "#7A7670", marginBottom: 16 }}>{plano.anuncios}</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 20 }}>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 800, color: plano.destaque ? "#E85D26" : "#1A1917", lineHeight: 1 }}>{plano.preco}</span>
                    <span style={{ fontSize: 13, color: "#7A7670", marginBottom: 4 }}>{plano.periodo}</span>
                  </div>
                  <div style={{ background: "rgba(232,93,38,0.08)", border: "1px solid rgba(232,93,38,0.15)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#E85D26", fontWeight: 600, marginBottom: 20, textAlign: "center" }}>
                    🎁 60 dias grátis no lançamento
                  </div>
                  {plano.recursos.map(r => (
                    <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1A1917", marginBottom: 10 }}>
                      <span style={{ color: "#16A34A", fontSize: 14 }}>✅</span> {r}
                    </div>
                  ))}
                  <Link href="/cadastro" style={{ display: "block", width: "100%", padding: "12px", background: plano.destaque ? "#E85D26" : "#1A1917", color: "#fff", borderRadius: 9, fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center", marginTop: 20, boxSizing: "border-box" }}>
                    Começar grátis →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS PARTICULAR */}
      <section style={{ padding: "64px 16px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#E85D26", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Para pessoas físicas</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 800, color: "#1A1917", marginBottom: 12 }}>Quer vender seu carro?</h2>
            <p style={{ fontSize: 15, color: "#7A7670", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
              Anuncie seu veículo como particular. Simples, rápido e com visibilidade para toda a região.
            </p>
          </div>

          <div className="planos-grid">
            {[
              { dias: "30 dias", preco: "R$ 29,90", fotos: "Até 8 fotos", cor: "#F7F6F3", corBorda: "#E8E6E1" },
              { dias: "60 dias", preco: "R$ 49,90", fotos: "Até 12 fotos", cor: "#FFF5F1", corBorda: "#E85D26", popular: true },
              { dias: "90 dias", preco: "R$ 69,90", fotos: "Até 20 fotos", cor: "#F7F6F3", corBorda: "#E8E6E1" },
            ].map(plano => (
              <div key={plano.dias} style={{ background: plano.cor, borderRadius: 14, padding: "28px 24px", border: `1.5px solid ${plano.corBorda}`, textAlign: "center", position: "relative" }}>
                {plano.popular && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#E85D26", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>MAIS ESCOLHIDO</div>}
                <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 800, color: "#1A1917", marginBottom: 4 }}>{plano.dias}</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 800, color: "#E85D26", marginBottom: 8 }}>{plano.preco}</div>
                <div style={{ fontSize: 13, color: "#7A7670", marginBottom: 20 }}>{plano.fotos}</div>
                <Link href="/cadastro" style={{ display: "block", padding: "11px", background: "#E85D26", color: "#fff", borderRadius: 8, fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  Anunciar agora →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section style={{ padding: "64px 16px", background: "#F7F6F3" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#E85D26", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Quem já confia</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 800, color: "#1A1917" }}>O que dizem sobre o AutoRegião</h2>
          </div>
          <div className="depoimentos-grid">
            {[
              { nome: "Carlos Mendes", cidade: "Lençóis Paulista", texto: "Vendi meu Onix em menos de uma semana! A plataforma é muito fácil de usar e os compradores da região respondem rápido.", estrelas: 5 },
              { nome: "Ana Paula Silva", cidade: "Bauru", texto: "Cadastrei minha loja no lançamento e já recebi vários contatos. O suporte é excelente e o painel é muito intuitivo.", estrelas: 5 },
              { nome: "Marcos Lima", cidade: "Jaú", texto: "Finalmente um portal focado na nossa região. Muito melhor do que os grandes portais nacionais para quem quer vender localmente.", estrelas: 5 },
            ].map(dep => (
              <div key={dep.nome} style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1.5px solid #E8E6E1" }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                  {[...Array(dep.estrelas)].map((_, i) => <span key={i} style={{ color: "#E85D26", fontSize: 16 }}>⭐</span>)}
                </div>
                <p style={{ fontSize: 14, color: "#1A1917", lineHeight: 1.7, marginBottom: 16 }}>"{dep.texto}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: "#E85D26", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700 }}>{dep.nome[0]}</div>
                  <div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917" }}>{dep.nome}</div>
                    <div style={{ fontSize: 11, color: "#7A7670" }}>📍 {dep.cidade}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: "#1A1917", padding: "64px 16px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 14, lineHeight: 1.2 }}>
            Pronto para vender<br /><span style={{ color: "#E85D26" }}>mais rápido?</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 32, lineHeight: 1.6 }}>
            Cadastre sua loja agora e aproveite 60 dias grátis. Sem cartão de crédito.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/cadastro" style={{ padding: "14px 32px", background: "#E85D26", borderRadius: 9, color: "#fff", fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
              Começar grátis →
            </Link>
            <Link href="/veiculos" style={{ padding: "14px 32px", background: "transparent", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 9, color: "#fff", fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
              Ver anúncios
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#111009", padding: "24px 16px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          © 2026 <span style={{ color: "#E85D26" }}>AutoRegião</span> · Todos os direitos reservados · 
          <a href="#" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", marginLeft: 8 }}>Termos de uso</a> · 
          <a href="#" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", marginLeft: 8 }}>Privacidade</a>
        </p>
      </footer>

    </main>
  );
}