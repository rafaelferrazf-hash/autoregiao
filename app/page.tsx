"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BarraBusca from "@/components/BarraBusca";
import { listarVeiculosAtivos, opcoesDeFiltro } from "@/lib/dados/veiculos";
import { formatarPreco, formatarKm } from "@/lib/formatar";
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
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh" }}>

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
            <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: "#1A1917" }}>
              <span style={{ color: "#E85D26" }}>Auto</span>Região
            </span>
          </Link>

          <div style={{ display: "flex", gap: 24 }} className="nav-desktop">
            {[["Buscar veículos", "/veiculos"], ["Anunciar", "/anunciar"]].map(([item, href]) => (
              <Link key={item} href={href} style={{ textDecoration: "none", color: "#7A7670", fontSize: 13.5, fontWeight: 500 }}>{item}</Link>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }} className="nav-desktop">
            <Link href="/login" style={{ padding: "7px 16px", border: "1.5px solid #E8E6E1", borderRadius: 7, background: "transparent", fontSize: 13, fontWeight: 500, color: "#1A1917", textDecoration: "none", display: "flex", alignItems: "center" }}>Entrar</Link>
            <Link href="/cadastro" style={{ padding: "7px 16px", background: "#E85D26", border: "none", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center" }}>Cadastrar loja</Link>
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
            {[["Buscar veículos", "/veiculos"], ["Anunciar", "/anunciar"]].map(([item, href]) => (
              <Link key={item} href={href} style={{ textDecoration: "none", color: "#1A1917", fontSize: 15, fontWeight: 500 }}>{item}</Link>
            ))}
            <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #E8E6E1" }}>
              <Link href="/login" style={{ flex: 1, padding: "10px", border: "1.5px solid #E8E6E1", borderRadius: 7, background: "transparent", fontSize: 14, fontWeight: 500, color: "#1A1917", textDecoration: "none", textAlign: "center" }}>Entrar</Link>
              <Link href="/cadastro" style={{ flex: 1, padding: "10px", background: "#E85D26", borderRadius: 7, color: "#fff", fontSize: 14, fontWeight: 500, textDecoration: "none", textAlign: "center" }}>Cadastrar loja</Link>
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
                <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 800, color: "#1A1917" }}>{carregando ? "..." : `${total} ${total === 1 ? "veículo" : "veículos"}`}</span>
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
                <Link key={car.id} href={`/veiculo/${car.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: car.destaque ? "1.5px solid #E85D26" : "1.5px solid #E8E6E1", position: "relative" }}>
                    {car.destaque && <span style={{ position: "absolute", top: 8, left: 8, background: "#E85D26", color: "#fff", fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 20, zIndex: 2 }}>⭐ Destaque</span>}
                    <div style={{ position: "relative", height: 150, width: "100%", background: "#F7F6F3" }}>
                      {car.fotos && car.fotos.length > 0
                        ? <img src={car.fotos[0]} alt={car.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <Image src="/sem-foto.png" alt={car.nome} fill style={{ objectFit: "cover" }} sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw" />
                      }
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917", marginBottom: 4 }}>{car.nome}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 8 }}>
                        {[car.ano, formatarKm(car.km), car.combustivel].filter(Boolean).map(tag => (
                          <span key={tag} style={{ fontSize: 10, color: "#7A7670", background: "#F7F6F3", padding: "2px 5px", borderRadius: 4 }}>{tag}</span>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #E8E6E1" }}>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 800, color: "#1A1917" }}>{formatarPreco(car.preco)}</div>
                      </div>
                      {(car.lojas?.nome || car.cidade) && (
                        <div style={{ fontSize: 10.5, color: "#7A7670", marginTop: 5, display: "flex", alignItems: "center", gap: 3 }}>
                          <span style={{ width: 5, height: 5, background: "#E85D26", borderRadius: "50%", display: "inline-block", flexShrink: 0 }}></span>
                          {[car.lojas?.nome, car.lojas?.cidade || car.cidade].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {total > MAX_HOME && (
              <Link href="/veiculos" style={{ display: "block", textAlign: "center", marginTop: 24, padding: "11px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#fff", color: "#1A1917", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
                Ver todos os {total} veículos →
              </Link>
            )}
        </div>
      </div>
    </main>
  );
}