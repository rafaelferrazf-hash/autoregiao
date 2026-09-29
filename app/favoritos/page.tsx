"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import BotoesConta from "@/components/BotoesConta";
import CartaoVeiculo from "@/components/CartaoVeiculo";
import Rodape from "@/components/Rodape";
import { buscarVeiculosPorIds } from "@/lib/dados/veiculos";
import { manterFavoritos, useFavoritos } from "@/lib/favoritos";
import type { VeiculoComLoja } from "@/lib/tipos";

// Anúncios que o visitante salvou com a estrela (guardados no navegador, sem conta).
export default function Favoritos() {
  const ids = useFavoritos();
  const chave = ids.join(",");
  const [resultado, setResultado] = useState<{ chave: string; veiculos: VeiculoComLoja[]; removidos: number } | null>(null);

  useEffect(() => {
    if (!chave) return;
    let cancelado = false;
    const lista = chave.split(",");
    buscarVeiculosPorIds(lista).then(({ veiculos, error }) => {
      if (cancelado || error) return;
      setResultado({ chave, veiculos, removidos: lista.length - veiculos.length });
      // Anúncio vendido/removido sai da lista salva.
      if (veiculos.length < lista.length) manterFavoritos(veiculos.map(v => v.id));
    });
    return () => { cancelado = true; };
  }, [chave]);

  // Enquanto busca a lista nova, mostra os cards que continuam salvos (tirar uma estrela não "pisca").
  const veiculos = (resultado?.veiculos ?? []).filter(v => ids.includes(v.id));
  const carregando = !!chave && !resultado;

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>
      <style>{`
        .fav-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        @media (max-width: 900px) { .fav-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .fav-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .fav-nav-links { display: none !important; } }
        @media (max-width: 480px) { .fav-grid { grid-template-columns: 1fr; } }
      `}</style>

      <nav style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/logo.png" alt="AutoRegião" width={32} height={32} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: "#1A1917" }}>
            <span style={{ color: "#E85D26" }}>Auto</span>Região
          </span>
        </Link>
        <div className="fav-nav-links" style={{ display: "flex", gap: 24 }}>
          <Link href="/veiculos" style={{ textDecoration: "none", color: "#7A7670", fontSize: 13.5, fontWeight: 500 }}>Buscar veículos</Link>
          <Link href="/anunciar" style={{ textDecoration: "none", color: "#7A7670", fontSize: 13.5, fontWeight: 500 }}>Anunciar</Link>
        </div>
        <div style={{ display: "flex", gap: 8 }}><BotoesConta /></div>
      </nav>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 16px 60px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 4 }}>★ Meus favoritos</h1>
        <p style={{ fontSize: 13, color: "#7A7670", marginBottom: 20 }}>Os anúncios que você salvou ficam guardados neste aparelho.</p>

        {resultado && resultado.removidos > 0 && (
          <div style={{ background: "#FFF7ED", border: "1.5px solid #FED7AA", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#9A3412", marginBottom: 16 }}>
            {resultado.removidos === 1 ? "1 anúncio salvo foi vendido ou removido pelo vendedor." : `${resultado.removidos} anúncios salvos foram vendidos ou removidos pelo vendedor.`}
          </div>
        )}

        {carregando ? (
          <div style={{ fontSize: 14, color: "#7A7670", padding: "40px 0", textAlign: "center" }}>Carregando seus favoritos...</div>
        ) : veiculos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 12, border: "1.5px solid #E8E6E1" }}>
            <div style={{ fontSize: 40, marginBottom: 12, color: "#E85D26" }}>☆</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1917", marginBottom: 6 }}>Nenhum favorito ainda</div>
            <div style={{ fontSize: 13, color: "#7A7670", marginBottom: 18 }}>Toque na estrela ☆ de um anúncio para salvar e ver depois.</div>
            <Link href="/veiculos" style={{ display: "inline-block", padding: "11px 20px", background: "#E85D26", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Buscar veículos</Link>
          </div>
        ) : (
          <div className="fav-grid">
            {veiculos.map(car => <CartaoVeiculo key={car.id} car={car} />)}
          </div>
        )}
      </div>
      <Rodape />
    </main>
  );
}
