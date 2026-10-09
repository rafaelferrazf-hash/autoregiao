"use client";
import Link from "next/link";
import Logo from "@/components/Logo";
import CartaoVeiculo from "@/components/CartaoVeiculo";
import Rodape from "@/components/Rodape";
import { slug } from "@/lib/nomesVeiculo";
import BotoesConta from "@/components/BotoesConta";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BarraBusca from "@/components/BarraBusca";
import VitrinePremium from "@/components/VitrinePremium";
import { listarVeiculosAtivos, opcoesDeFiltro } from "@/lib/dados/veiculos";
import { filtrosParaQuery } from "@/lib/busca";
import type { VeiculoComLoja } from "@/lib/tipos";
import Icone from "@/components/Icone";
import { ESTILOS } from "@/lib/estilos";
import { FAIXAS_PARCELA } from "@/lib/financiamento";

const MAX_HOME = 8;

export default function Home() {
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [carros, setCarros] = useState<VeiculoComLoja[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [cidades, setCidades] = useState<string[]>([]);

  useEffect(() => {
    opcoesDeFiltro().then(o => setCidades(o.cidades));
  }, []);

  useEffect(() => {
    listarVeiculosAtivos().then(({ veiculos, total, error }) => {
      if (!error) {
        setCarros(veiculos.slice(0, MAX_HOME));
        setTotal(total);
      }
      setCarregando(false);
    });
  }, []);

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>

      {/* CSS RESPONSIVO */}
      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile { display: none !important; }
        .cars-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
        @media (max-width: 1024px) { .cars-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
          .cars-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; }
        }
        @media (max-width: 480px) {
          .cars-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E8E6E1" }}>
        <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Logo />
          </Link>

          <div style={{ display: "flex", gap: 24 }} className="nav-desktop">
            {[["Buscar veículos", "/veiculos"], ["Favoritos", "/favoritos"], ["Lojas", "/lojas"], ["Tabela FIPE", "/tabela-fipe"], ["Anunciar", "/anunciar"]].map(([item, href]) => (
              <Link key={item} href={href} style={{ textDecoration: "none", color: "#7A7670", fontSize: 13.5, fontWeight: 500 }}>{item === "Favoritos" && <Icone nome="estrela" style={{ marginRight: 4 }} />}{item}</Link>
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
            {[["Buscar veículos", "/veiculos"], ["Favoritos", "/favoritos"], ["Lojas", "/lojas"], ["Tabela FIPE", "/tabela-fipe"], ["Anunciar", "/anunciar"]].map(([item, href]) => (
              <Link key={item} href={href} style={{ textDecoration: "none", color: "#1A1917", fontSize: 15, fontWeight: 500 }}>{item === "Favoritos" && <Icone nome="estrela" style={{ marginRight: 4 }} />}{item}</Link>
            ))}
            <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #E8E6E1" }}>
              <BotoesConta celular />
            </div>
          </div>
        )}
      </nav>

      <BarraBusca filtros={{}} cidades={cidades} onBuscar={f => router.push(`/veiculos${filtrosParaQuery(f)}`)} />

      <VitrinePremium />

      {/* CONTEÚDO */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px" }}>

        {/* LISTA DE VEÍCULOS */}
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#1A1917" }}>{carregando ? "..." : `${total} ${total === 1 ? "veículo" : "veículos"}`}</span>
                <span style={{ fontSize: 12, color: "#7A7670", marginLeft: 6 }}>anunciados</span>
              </div>
              <Link href="/veiculos" className="toque-facil" style={{ fontSize: 13, color: "#FF6600", fontWeight: 600, textDecoration: "none" }}>Buscar com filtros →</Link>
            </div>

            {!carregando && carros.length === 0 && (
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 32, textAlign: "center", fontSize: 13, color: "#7A7670" }}>
                Ainda não há veículos anunciados. <Link href="/anunciar" style={{ color: "#FF6600", fontWeight: 600, textDecoration: "none" }}>Anuncie o seu →</Link>
              </div>
            )}

            <div className="cars-grid">
              {carros.map(car => (
                <CartaoVeiculo key={car.id} car={car} />
              ))}
            </div>

            {total > MAX_HOME && (
              <Link href="/veiculos" style={{ display: "block", textAlign: "center", marginTop: 24, padding: "11px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#fff", color: "#1A1917", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
                Ver todos os {total} veículos →
              </Link>
            )}

            {/* EXPLORE: atalhos para as páginas prontas de busca (/carros, /carros/chevrolet...) */}
            {carros.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1A1917", marginBottom: 12 }}>Explore</div>
                {[
                  ["Tipo", [["Carros", "/carros"], ["Motos", "/motos"], ["Utilitários", "/utilitarios"], ["Abaixo da FIPE", "/carros/abaixo-da-fipe"]]],
                  ["Estilo", Object.entries(ESTILOS).map(([e, x]) => [x.nome, `/carros/${e}`])],
                  ["Parcela", FAIXAS_PARCELA.map(p => [`Até R$ ${p.toLocaleString("pt-BR")}/mês`, `/veiculos?parcela_max=${p}`])],
                  ["Preço", [30, 50, 80, 100, 150].map(n => [`Carros até R$ ${n} mil`, `/carros/ate-${n}-mil`])],
                  ["Marcas", [...new Set(carros.filter(c => c.marca && c.tipo !== "moto" && c.tipo !== "utilitario").map(c => c.marca!.trim()))]
                    .sort((a, b) => a.localeCompare(b, "pt-BR")).map(m => [m, `/carros/${slug(m)}`])],
                ].filter(([, links]) => links.length > 0).map(([titulo, links]) => (
                  <div key={titulo as string} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: "#7A7670", minWidth: 52 }}>{titulo as string}</span>
                    {(links as string[][]).map(([nome, href]) => (
                      <Link key={href} href={href} style={{ padding: "6px 12px", background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 20, fontSize: 12.5, color: "#1A1917", textDecoration: "none" }}>{nome === "Abaixo da FIPE" && <Icone nome="abaixo" cor="#15803D" style={{ marginRight: 4 }} />}{nome}</Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      <Rodape />
    </main>
  );
}