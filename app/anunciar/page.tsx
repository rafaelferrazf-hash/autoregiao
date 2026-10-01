"use client";
import Link from "next/link";
import Logo from "@/components/Logo";
import BotoesConta from "@/components/BotoesConta";
import { PLANOS, DIAS_GRATIS } from "@/lib/planos";
import { useState } from "react";

// Itens do menu de navegação.
// href: "#" nos itens ainda sem página pronta (Revendas, Tabela FIPE, Financiamento).
// Quando você criar essas páginas, é só trocar o "#" pela rota real (ex: "/revendas").
const menuItens = [
  { nome: "Buscar veículos", href: "/veiculos" },
  { nome: "Revendas", href: "#" },
  { nome: "Tabela FIPE", href: "#" },
  { nome: "Financiamento", href: "#" },
  { nome: "Anunciar", href: "/anunciar" },
];

export default function Anunciar() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile { display: none !important; }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        .numeros-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .planos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 24px !important; text-align: center; }
          .numeros-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .planos-grid { grid-template-columns: 1fr !important; }
          .hero-btns { justify-content: center !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E8E6E1" }}>
        <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Logo />
          </Link>
          <div style={{ display: "flex", gap: 24 }} className="nav-desktop">
            {menuItens.map(item => (
              <Link key={item.nome} href={item.href} style={{ textDecoration: "none", color: "#7A7670", fontSize: 13.5, fontWeight: 500 }}>{item.nome}</Link>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }} className="nav-desktop">
            <BotoesConta />
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
            {menuItens.map(item => (
              <Link key={item.nome} href={item.href} onClick={() => setMenuAberto(false)} style={{ textDecoration: "none", color: "#1A1917", fontSize: 15, fontWeight: 500 }}>{item.nome}</Link>
            ))}
            <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #E8E6E1" }}>
              <BotoesConta celular />
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ background: "#1A1917", padding: "100px 16px 64px", marginTop: 60 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="hero-grid">
            <div>
              <div style={{ display: "inline-block", background: "rgba(255,102,0,0.15)", border: "1px solid rgba(255,102,0,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#FF6600", fontWeight: 600, marginBottom: 20 }}>
                🚗 Lançamento em Teixeira de Freitas e região
              </div>
              <h1 style={{ fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
                Hora de vender?<br /><span style={{ color: "#FF6600" }}>A gente te ajuda!</span>
              </h1>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                Anuncie seu veículo para compradores da sua região, com contato direto pelo WhatsApp. Simples e rápido.
              </p>
              <div className="hero-btns" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/cadastro" style={{ padding: "14px 28px", background: "#FF6600", borderRadius: 9, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  🚀 Criar conta grátis
                </Link>
                <Link href="/login" style={{ padding: "14px 28px", background: "transparent", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 9, color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Já tenho conta →
                </Link>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["✅", "Cadastro simples e rápido", "Em menos de 5 minutos seu anúncio está no ar"],
                ["📍", "Compradores da sua região", "Teixeira de Freitas e cidades vizinhas"],
                ["💬", "Contato direto via WhatsApp", "Sem intermediários: o comprador fala com você"],
                ["📊", "Veja o resultado", "Quantas pessoas viram e chamaram no seu anúncio"],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{title}</div>
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
              ["🏆", "Lançamento 2026", "Portal de veículos focado na nossa região"],
              ["📍", "Teixeira de Freitas", "Cidade sede, com expansão para as cidades vizinhas"],
              ["🚗", `${DIAS_GRATIS} dias grátis`, "Para lojas cadastradas no período de lançamento"],
              ["🆓", "Particular anuncia grátis", "1 veículo por pessoa no período de lançamento"],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ textAlign: "center", padding: "20px 16px" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1A1917", marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#7A7670", lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS LOJISTAS */}
      <section id="planos" style={{ padding: "64px 16px", background: "#F7F6F3", scrollMarginTop: 60 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#FF6600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Para lojas e revendas</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#1A1917", marginBottom: 12 }}>Planos para lojistas</h2>
            <p style={{ fontSize: 15, color: "#7A7670", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
              Escolha o plano ideal para o tamanho da sua revenda. Toda loja nova começa com {DIAS_GRATIS} dias grátis. Pagamento por Pix, cartão ou boleto.
            </p>
          </div>

          <div className="planos-grid">
            {PLANOS.map(p => ({ nome: p.nome, preco: `R$ ${p.precoMensal}`, periodo: "/mês", anuncios: p.limite === null ? "Anúncios ilimitados" : `Até ${p.limite} anúncios ativos`, recursos: p.recursos, destaque: p.id === "profissional" })).map(plano => (
              <div key={plano.nome} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: plano.destaque ? "2px solid #FF6600" : "1.5px solid #E8E6E1", position: "relative" }}>
                {plano.destaque && (
                  <div style={{ background: "#FF6600", padding: "6px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>
                    ⭐ MAIS POPULAR
                  </div>
                )}
                <div style={{ padding: "28px 24px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#1A1917", marginBottom: 4 }}>{plano.nome}</div>
                  <div style={{ fontSize: 12, color: "#7A7670", marginBottom: 16 }}>{plano.anuncios}</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 20 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: plano.destaque ? "#FF6600" : "#1A1917", lineHeight: 1 }}>{plano.preco}</span>
                    <span style={{ fontSize: 13, color: "#7A7670", marginBottom: 4 }}>{plano.periodo}</span>
                  </div>
                  <div style={{ background: "rgba(255,102,0,0.08)", border: "1px solid rgba(255,102,0,0.15)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#FF6600", fontWeight: 600, marginBottom: 20, textAlign: "center" }}>
                    🎁 {DIAS_GRATIS} dias grátis para começar
                  </div>
                  {plano.recursos.map(r => (
                    <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1A1917", marginBottom: 10 }}>
                      <span style={{ color: "#16A34A", fontSize: 14 }}>✅</span> {r}
                    </div>
                  ))}
                  <Link href="/cadastro" style={{ display: "block", width: "100%", padding: "12px", background: plano.destaque ? "#FF6600" : "#1A1917", color: "#fff", borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center", marginTop: 20, boxSizing: "border-box" }}>
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
            <div style={{ fontSize: 12, fontWeight: 600, color: "#FF6600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Para pessoas físicas</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#1A1917", marginBottom: 12 }}>Quer vender seu carro?</h2>
            <p style={{ fontSize: 15, color: "#7A7670", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
              Anuncie seu veículo como particular. No período de lançamento é <strong style={{ color: "#1A1917" }}>grátis</strong>: 1 veículo por pessoa, com fotos e contato direto pelo WhatsApp.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/cadastro" style={{ display: "inline-block", padding: "13px 32px", background: "#FF6600", color: "#fff", borderRadius: 9, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
              Anunciar meu carro grátis →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: "#1A1917", padding: "64px 16px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 14, lineHeight: 1.2 }}>
            Pronto para vender<br /><span style={{ color: "#FF6600" }}>mais rápido?</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 32, lineHeight: 1.6 }}>
            Cadastre sua loja agora e aproveite 60 dias grátis. Sem cartão de crédito.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/cadastro" style={{ padding: "14px 32px", background: "#FF6600", borderRadius: 9, color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
              Começar grátis →
            </Link>
            <Link href="/veiculos" style={{ padding: "14px 32px", background: "transparent", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 9, color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
              Ver anúncios
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#111009", padding: "24px 16px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          © 2026 <span style={{ color: "#FF6600" }}>AutoRegião</span> · Todos os direitos reservados ·{" "}
          <Link href="/termos" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", marginLeft: 8 }}>Termos de uso</Link> ·{" "}
          <Link href="/privacidade" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", marginLeft: 8 }}>Privacidade</Link>
        </p>
      </footer>

    </main>
  );
}