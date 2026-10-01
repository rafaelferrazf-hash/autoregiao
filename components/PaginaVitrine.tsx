import Link from "next/link";
import Logo from "@/components/Logo";
import BotoesConta from "@/components/BotoesConta";
import CartaoVeiculo from "@/components/CartaoVeiculo";
import CriarAlerta from "@/components/CriarAlerta";
import Rodape from "@/components/Rodape";
import { filtrosParaQuery } from "@/lib/busca";
import type { Vitrine } from "@/lib/vitrines";
import type { VeiculoComLoja } from "@/lib/tipos";

// Página de vitrine (/carros, /carros/chevrolet...): tudo renderizado no servidor, para o Google.
export default function PaginaVitrine({ vitrine, veiculos, total }: { vitrine: Vitrine; veiculos: VeiculoComLoja[]; total: number }) {
  const busca = filtrosParaQuery(vitrine.filtros).replace(/^\?/, "");
  const chip = { display: "inline-block", padding: "6px 12px", background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 20, fontSize: 12.5, color: "#1A1917", textDecoration: "none" } as const;

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>
      <style>{`
        .vit-grid { display: grid; grid-template-columns: 1fr 280px; gap: 20px; align-items: start; }
        .vit-carros { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        @media (max-width: 900px) { .vit-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .vit-carros { grid-template-columns: repeat(2, 1fr); gap: 10px; } .vit-links { display: none !important; } }
        @media (max-width: 480px) { .vit-carros { grid-template-columns: 1fr; } }
      `}</style>

      <nav style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Logo />
        </Link>
        <div className="vit-links" style={{ display: "flex", gap: 24 }}>
          {[["Buscar veículos", "/veiculos"], ["★ Favoritos", "/favoritos"], ["Anunciar", "/anunciar"]].map(([nome, href]) => (
            <Link key={href} href={href} style={{ textDecoration: "none", color: "#7A7670", fontSize: 13.5, fontWeight: 500 }}>{nome}</Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}><BotoesConta /></div>
      </nav>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 16px 40px" }}>
        <nav aria-label="Caminho" style={{ fontSize: 12, color: "#7A7670", marginBottom: 12 }}>
          {vitrine.caminho.map((c, i) => (
            <span key={c.href}>
              {i > 0 && " › "}
              {i === vitrine.caminho.length - 1 ? <span style={{ color: "#1A1917" }}>{c.nome}</span> : <Link href={c.href} style={{ color: "#7A7670", textDecoration: "none" }}>{c.nome}</Link>}
            </span>
          ))}
        </nav>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1A1917", marginBottom: 6 }}>{vitrine.h1}</h1>
        <p style={{ fontSize: 14, color: "#7A7670", marginBottom: 18, maxWidth: 720, lineHeight: 1.5 }}>
          {total > 0 ? `${total} ${total === 1 ? "anúncio" : "anúncios"} · ` : ""}{vitrine.descricao}
        </p>

        <div className="vit-grid">
          <div>
            {veiculos.length > 0 ? (
              <div className="vit-carros">
                {veiculos.map(car => <CartaoVeiculo key={car.id} car={car} />)}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "50px 20px", background: "#fff", borderRadius: 12, border: "1.5px solid #E8E6E1" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🚗</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1917", marginBottom: 6 }}>Nenhum anúncio agora</div>
                <div style={{ fontSize: 13, color: "#7A7670" }}>Crie um alerta ao lado e receba um e-mail quando aparecer.</div>
              </div>
            )}
            {total > veiculos.length && (
              <Link href={`/veiculos?${busca}`} style={{ display: "block", textAlign: "center", marginTop: 16, padding: 11, border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#fff", color: "#1A1917", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                Ver todos os {total} anúncios →
              </Link>
            )}
          </div>

          <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Link href={`/veiculos?${busca}`} style={{ display: "block", textAlign: "center", padding: 11, background: "#FF6600", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              🔧 Refinar com filtros
            </Link>
            {vitrine.atalhos.filter(a => a.links.length > 0).map(a => (
              <div key={a.titulo} style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1917", marginBottom: 10 }}>{a.titulo}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {a.links.slice(0, 20).map(l => (
                    <Link key={l.href} href={l.href} style={{ ...chip, ...(l.href === vitrine.rota ? { borderColor: "#FF6600", color: "#FF6600" } : {}) }}>
                      {l.nome}{l.qtd ? <span style={{ color: "#A8A49D" }}> ({l.qtd})</span> : null}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <CriarAlerta key={busca} filtros={vitrine.filtros} busca={busca} />
          </aside>
        </div>
      </div>

      <Rodape />
    </main>
  );
}
