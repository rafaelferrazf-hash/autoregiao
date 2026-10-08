"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PaginaSimples from "@/components/PaginaSimples";
import Icone from "@/components/Icone";
import FotoCard from "@/components/FotoCard";
import { SeloPreco } from "@/components/CartaoVeiculo";
import { alternarComparar, limparComparar, useComparar } from "@/lib/comparar";
import { buscarVeiculosPorIds } from "@/lib/dados/veiculos";
import { formatarKm, formatarPreco } from "@/lib/formatar";
import { ENTRADA_PADRAO, parcelaMensal } from "@/lib/financiamento";
import { linkDoVeiculo } from "@/lib/linkVeiculo";
import type { VeiculoComLoja } from "@/lib/tipos";

// Comparação lado a lado (até 3 anúncios escolhidos com o botão "Comparar" dos cards).
// O melhor valor de cada linha (menor preço, menor km, ano mais novo...) fica destacado em verde.
export default function Comparar() {
  const ids = useComparar();
  const [carros, setCarros] = useState<VeiculoComLoja[] | null>(null);
  const chave = ids.join(",");

  useEffect(() => {
    let cancelado = false;
    buscarVeiculosPorIds(chave ? chave.split(",") : []).then(({ veiculos }) => { if (!cancelado) setCarros(veiculos); });
    return () => { cancelado = true; };
  }, [chave]);

  const lista = carros ?? [];
  const num = (v: string | null | undefined) => { const n = parseInt(String(v ?? "").replace(/\D/g, ""), 10); return Number.isNaN(n) ? null : n; };
  const melhor = (valores: (number | null)[], menor: boolean) => {
    const ok = valores.filter((v): v is number => v !== null);
    if (ok.length < 2) return null;
    return menor ? Math.min(...ok) : Math.max(...ok);
  };
  const precoMelhor = melhor(lista.map(c => c.preco), true);
  const kmMelhor = melhor(lista.map(c => num(c.km)), true);
  const anoMelhor = melhor(lista.map(c => num(c.ano)), false);
  const opcMelhor = melhor(lista.map(c => c.opcionais?.length ?? 0), false);
  const destaque = (bom: boolean) => (bom ? { color: "#15803D", fontWeight: 800 } : {});

  const linhas: { rotulo: string; valor: (c: VeiculoComLoja) => React.ReactNode }[] = [
    { rotulo: "Preço", valor: c => <span style={{ fontSize: 16, fontWeight: 800, ...destaque(c.preco === precoMelhor) }}>{formatarPreco(c.preco)}</span> },
    { rotulo: "Tabela FIPE", valor: c => <SeloPreco v={c} /> },
    { rotulo: "Parcela (simulação)", valor: c => (c.preco ? `≈ R$ ${parcelaMensal(c.preco * (1 - ENTRADA_PADRAO)).toLocaleString("pt-BR")}/mês` : "—") },
    { rotulo: "Ano", valor: c => <span style={destaque(num(c.ano) === anoMelhor)}>{c.ano ?? "—"}</span> },
    { rotulo: "Quilometragem", valor: c => <span style={destaque(num(c.km) === kmMelhor)}>{formatarKm(c.km) || "—"}</span> },
    { rotulo: "Câmbio", valor: c => c.cambio || "—" },
    { rotulo: "Combustível", valor: c => c.combustivel || "—" },
    { rotulo: "Carroceria", valor: c => c.carroceria || "—" },
    { rotulo: "Cor", valor: c => c.cor || "—" },
    { rotulo: "Portas", valor: c => c.portas || "—" },
    { rotulo: "Situação", valor: c => (c.condicoes?.length ? c.condicoes.join(" · ") : "—") },
    { rotulo: "Aceita troca", valor: c => (c.aceita_troca ? "Sim" : "Não") },
    { rotulo: "Opcionais", valor: c => <span><strong style={destaque((c.opcionais?.length ?? 0) === opcMelhor)}>{c.opcionais?.length ?? 0}</strong>{c.opcionais?.length ? <span style={{ display: "block", fontSize: 11.5, color: "#7A7670", marginTop: 4, lineHeight: 1.5 }}>{c.opcionais.join(" · ")}</span> : null}</span> },
    { rotulo: "Vendedor", valor: c => [c.lojas?.nome || "Particular", c.lojas?.cidade || c.cidade].filter(Boolean).join(" · ") },
  ];

  return (
    <PaginaSimples>
      <nav aria-label="Caminho" style={{ fontSize: 12, color: "#7A7670", marginBottom: 12 }}>
        <Link href="/" style={{ color: "#7A7670", textDecoration: "none" }}>Início</Link> › <span style={{ color: "#1A1917" }}>Comparar veículos</span>
      </nav>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1A1917", margin: 0 }}>Comparar veículos</h1>
        {lista.length > 0 && <button type="button" onClick={limparComparar} style={{ background: "none", border: "none", color: "#7A7670", fontSize: 13, cursor: "pointer" }}>Limpar comparação</button>}
      </div>

      {carros === null ? (
        <div style={{ fontSize: 13, color: "#7A7670" }}>Carregando...</div>
      ) : lista.length === 0 ? (
        <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 32, textAlign: "center" }}>
          <div style={{ color: "#C9C5BE", marginBottom: 8 }}><Icone nome="comparar" tamanho={36} traco={1.5} /></div>
          <div style={{ fontSize: 14, color: "#1A1917", fontWeight: 700, marginBottom: 6 }}>Nenhum veículo para comparar</div>
          <div style={{ fontSize: 13, color: "#7A7670", marginBottom: 14 }}>Na busca, toque em <strong>Comparar</strong> na foto de até 3 carros.</div>
          <Link href="/veiculos" style={{ padding: "9px 16px", background: "#FF6600", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Buscar veículos</Link>
        </div>
      ) : (
        <div style={{ overflowX: "auto", background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12 }}>
          <table style={{ width: "100%", minWidth: 140 + lista.length * 210, tableLayout: "fixed", borderCollapse: "collapse", fontSize: 13, color: "#1A1917" }}>
            <thead>
              <tr>
                <th style={{ width: 140 }} />
                {lista.map(c => (
                  <th key={c.id} style={{ padding: 12, verticalAlign: "top", textAlign: "left", borderLeft: "1px solid #F0EEE9" }}>
                    <Link href={linkDoVeiculo(c)} style={{ textDecoration: "none", color: "#1A1917" }}>
                      <div style={{ position: "relative", width: "100%", maxWidth: 240, aspectRatio: "4 / 3", borderRadius: 8, overflow: "hidden", background: "#F7F6F3", marginBottom: 8 }}>
                        {c.fotos?.[0] && <FotoCard src={c.fotos[0]} alt={c.nome ?? "Veículo"} />}
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, lineHeight: 1.3 }}>{c.nome}</div>
                    </Link>
                    <button type="button" onClick={() => alternarComparar(c.id)} style={{ marginTop: 6, background: "none", border: "none", padding: 0, color: "#B91C1C", fontSize: 12, cursor: "pointer" }}>
                      <Icone nome="fechar" tamanho={12} /> Tirar
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map(l => (
                <tr key={l.rotulo} style={{ borderTop: "1px solid #F0EEE9" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11.5, fontWeight: 700, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.3, verticalAlign: "top", background: "#FAFAF8" }}>{l.rotulo}</th>
                  {lista.map(c => <td key={c.id} style={{ padding: "10px 12px", verticalAlign: "top", borderLeft: "1px solid #F0EEE9" }}>{l.valor(c)}</td>)}
                </tr>
              ))}
              <tr style={{ borderTop: "1px solid #F0EEE9" }}>
                <th />
                {lista.map(c => (
                  <td key={c.id} style={{ padding: 12, borderLeft: "1px solid #F0EEE9" }}>
                    <Link href={linkDoVeiculo(c)} style={{ display: "block", textAlign: "center", padding: "9px 10px", background: "#FF6600", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Ver anúncio</Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {lista.length === 1 && <div style={{ fontSize: 12.5, color: "#7A7670", marginTop: 10 }}>Escolha mais um carro na <Link href="/veiculos" style={{ color: "#FF6600" }}>busca</Link> para comparar.</div>}
    </PaginaSimples>
  );
}
