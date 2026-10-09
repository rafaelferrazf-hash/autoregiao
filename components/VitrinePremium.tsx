"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import CartaoVeiculo from "@/components/CartaoVeiculo";
import Icone from "@/components/Icone";
import { listarVitrinePremium } from "@/lib/dados/veiculos";
import type { VeiculoComLoja } from "@/lib/tipos";

// Faixa "Ofertas em destaque" no topo da página inicial: só anúncios de lojas Premium,
// lado a lado (arrasta no celular). Some quando não há nenhum.
export default function VitrinePremium() {
  const [carros, setCarros] = useState<VeiculoComLoja[]>([]);
  useEffect(() => { listarVitrinePremium().then(setCarros); }, []);
  if (!carros.length) return null;

  return (
    <section style={{ background: "linear-gradient(180deg, #1A1917 0%, #2A2622 100%)", padding: "4px 0 22px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 6, margin: 0 }}><Icone nome="coroa" cor="#FF6600" tamanho={20} /> Ofertas em destaque</h2>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>Selecionadas das lojas Premium da região</div>
          </div>
          <Link href="/veiculos" style={{ fontSize: 12.5, color: "#FF8A3D", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>Ver todas →</Link>
        </div>
        <div className="vitrine-premium" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6, scrollSnapType: "x mandatory" }}>
          {carros.map(car => (
            <div key={car.id} style={{ scrollSnapAlign: "start", flexShrink: 0, display: "flex" }}>
              <CartaoVeiculo car={car} largura={270} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
