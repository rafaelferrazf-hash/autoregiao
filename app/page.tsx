"use client";
import Image from "next/image";
import Link from "next/link";
import CartaoVeiculo from "@/components/CartaoVeiculo";
import BotoesConta from "@/components/BotoesConta";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BarraBusca from "@/components/BarraBusca";
import { listarVeiculosAtivos, opcoesDeFiltro } from "@/lib/dados/veiculos";
import { filtrosParaQuery } from "@/lib/busca";
import type { VeiculoComLoja } from "@/lib/tipos";

const MAX_HOME = 9;

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
        .cars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
          .cars-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
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
            <span style={{ fontSize: 18, fontWeight: 800, color: "#1A1917" }}>
              <span style={{ color: "#E85D26" }}>Auto</span>Região
            </span>
          </Link>

          <div style={{ display: "flex", gap: 24 }} className="nav-desktop">
            {[["Buscar veículos", "/veiculos"], ["★ Favoritos", "/favoritos"], ["Anunciar", "/anunciar"]].map(([item, href]) => (
              <Link key={item} href={href} style={{ textDecoration: "none", color: "#7A7670", fontSize: 13.5, fontWeight: 500 }}>{item}</Link>
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
            {[["Buscar veículos", "/veiculos"], ["★ Favoritos", "/favoritos"], ["Anunciar", "/anunciar"]].map(([item, href]) => (
              <Link key={item} href={href} style={{ textDecoration: "none", color: "#1A1917", fontSize: 15, fontWeight: 500 }}>{item}</Link>
            ))}
            <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #E8E6E1" }}>
              <BotoesConta celular />
            </div>
          </div>
        )}
      </nav>

      <BarraBusca filtros={{}} cidades={cidades} onBuscar={f => router.push(`/veiculos${filtrosParaQuery(f)}`)} />

      {/* CONTEÚDO */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px" }}>

        {/* LISTA DE VEÍCULOS */}
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#1A1917" }}>{carregando ? "..." : `${total} ${total === 1 ? "veículo" : "veículos"}`}</span>
                <span style={{ fontSize: 12, color: "#7A7670", marginLeft: 6 }}>anunciados · mais recentes</span>
              </div>
              <Link href="/veiculos" style={{ fontSize: 13, color: "#E85D26", fontWeight: 600, textDecoration: "none" }}>Buscar com filtros →</Link>
            </div>

            {!carregando && carros.length === 0 && (
              <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 32, textAlign: "center", fontSize: 13, color: "#7A7670" }}>
                Ainda não há veículos anunciados. <Link href="/anunciar" style={{ color: "#E85D26", fontWeight: 600, textDecoration: "none" }}>Anuncie o seu →</Link>
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
        </div>
      </div>

      <footer style={{ borderTop: "1px solid #E8E6E1", marginTop: 32, padding: "20px 16px", textAlign: "center", fontSize: 12, color: "#7A7670", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        <span>© {new Date().getFullYear()} <span style={{ color: "#E85D26" }}>AutoRegião</span></span>
        <Link href="/anunciar" style={{ color: "#7A7670", textDecoration: "none" }}>Anunciar</Link>
        <Link href="/termos" style={{ color: "#7A7670", textDecoration: "none" }}>Termos de Uso</Link>
        <Link href="/privacidade" style={{ color: "#7A7670", textDecoration: "none" }}>Política de Privacidade</Link>
      </footer>
    </main>
  );
}