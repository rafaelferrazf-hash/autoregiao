"use client";
import { useEffect, useState } from "react";
import { hojeBrasilia } from "@/lib/banners";

// Aba "Visitas" do /admin: quantas pessoas abriram o site e os apps (supabase/fase25, app/api/visitas).
type Par = { visitas: number; pessoas: number };
type Dados = {
  dias: number;
  hoje: Par;
  ontem: Par;
  periodo: Par;
  por_dia: { dia: string; visitas: number; pessoas: number }[];
  por_origem: Partial<Record<"site" | "android" | "iphone", Par>>;
  por_aparelho: Partial<Record<"celular" | "computador", number>>;
  por_fonte: Record<string, number>;
  por_pagina: Record<string, number>;
  buscas: { busca: string; n: number }[];
};

const cartao = { background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 18 } as const;
const titulo = { fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 12 } as const;
const n = (v: number | undefined) => (v ?? 0).toLocaleString("pt-BR");

const NOME_PAGINA: Record<string, string> = {
  inicio: "Página inicial", busca: "Busca", anuncio: "Anúncios", vitrine: "Carros/motos por tipo", loja: "Página de loja",
  lojas: "Lista de lojas", fipe: "Tabela FIPE", anunciar: "Anunciar", painel: "Painel do anunciante", conta: "Entrar/cadastro", outras: "Outras",
};
const NOME_FONTE: Record<string, string> = {
  direto: "Direto (digitou ou app)", google: "Google", instagram: "Instagram", facebook: "Facebook", whatsapp: "WhatsApp",
  "outras buscas": "Outros buscadores", "outros sites": "Outros sites",
};

function diasAte(hoje: string, quantos: number) {
  const lista: string[] = [];
  for (let i = quantos - 1; i >= 0; i--) {
    const d = new Date(`${hoje}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i);
    lista.push(d.toISOString().slice(0, 10));
  }
  return lista;
}

function Barras({ itens, total }: { itens: [string, number][]; total: number }) {
  if (!itens.length) return <div style={{ fontSize: 13, color: "#7A7670" }}>Ainda sem dados.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {itens.map(([nome, v]) => {
        const pct = total ? Math.round((v / total) * 100) : 0;
        return (
          <div key={nome}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1A1917", marginBottom: 3 }}>
              <span>{nome}</span><span style={{ color: "#7A7670" }}>{n(v)} · {pct}%</span>
            </div>
            <div style={{ height: 7, background: "#F0EEEA", borderRadius: 4 }}>
              <div style={{ width: `${Math.max(pct, 1)}%`, height: "100%", background: "#FF6600", borderRadius: 4 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminVisitas() {
  const [dias, setDias] = useState(30);
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    fetch(`/api/admin/visitas?dias=${dias}`, { cache: "no-store" })
      .then(async x => { const r = await x.json(); if (!x.ok) throw new Error(r?.erro || "erro"); return r as Dados; })
      .then(r => { if (ativo) { setDados(r); setErro(""); } })
      .catch(e => { if (ativo) setErro(String(e.message || e)); });
    return () => { ativo = false; };
  }, [dias]);

  if (erro) return <div style={{ ...cartao, fontSize: 14, color: "#B91C1C" }}>Não foi possível carregar as visitas: {erro}</div>;
  if (!dados) return <div style={{ fontSize: 13, color: "#7A7670" }}>Carregando...</div>;

  const porDia = new Map(dados.por_dia.map(d => [d.dia, d]));
  const serie = diasAte(hojeBrasilia(), dados.dias).map(d => ({ dia: d, pessoas: porDia.get(d)?.pessoas ?? 0, visitas: porDia.get(d)?.visitas ?? 0 }));
  const maximo = Math.max(1, ...serie.map(s => s.pessoas));
  const o = dados.por_origem;
  const totalOrigem = (o.site?.pessoas ?? 0) + (o.android?.pessoas ?? 0) + (o.iphone?.pessoas ?? 0);
  const ordenar = (r: Record<string, number>, nomes: Record<string, string>) =>
    Object.entries(r).sort((a, b) => b[1] - a[1]).map(([k, v]) => [nomes[k] ?? k, v] as [string, number]);
  const soma = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {[7, 30, 90].map(d => (
          <button key={d} onClick={() => setDias(d)}
            style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid", borderColor: dias === d ? "#FF6600" : "#E8E6E1", background: dias === d ? "#FFF7ED" : "#fff", color: dias === d ? "#FF6600" : "#1A1917", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            {d} dias
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {[
          ["Pessoas hoje", dados.hoje.pessoas, `${n(dados.hoje.visitas)} páginas abertas`],
          ["Pessoas ontem", dados.ontem.pessoas, `${n(dados.ontem.visitas)} páginas abertas`],
          [`Pessoas em ${dados.dias} dias`, dados.periodo.pessoas, `${n(dados.periodo.visitas)} páginas abertas`],
          ["Média por dia", Math.round(dados.periodo.pessoas / dados.dias), "pessoas"],
        ].map(([rot, v, sub]) => (
          <div key={rot as string} style={cartao}>
            <div style={{ fontSize: 12, color: "#7A7670", marginBottom: 4 }}>{rot}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1A1917" }}>{n(v as number)}</div>
            <div style={{ fontSize: 12, color: "#7A7670" }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={cartao}>
        <div style={titulo}>Pessoas por dia</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: dados.dias > 30 ? 1 : 3, height: 140 }}>
          {serie.map(s => (
            <div key={s.dia} title={`${s.dia.split("-").reverse().join("/")}: ${s.pessoas} pessoas, ${s.visitas} páginas`}
              style={{ flex: 1, minWidth: 0, height: `${Math.max((s.pessoas / maximo) * 100, s.pessoas ? 3 : 1)}%`, background: s.pessoas ? "#FF6600" : "#F0EEEA", borderRadius: "3px 3px 0 0" }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7A7670", marginTop: 6 }}>
          <span>{serie[0].dia.split("-").reverse().slice(0, 2).join("/")}</span>
          <span>hoje</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
        <div style={cartao}>
          <div style={titulo}>Site × apps</div>
          <Barras total={totalOrigem} itens={([
            ["Site (navegador)", o.site?.pessoas ?? 0],
            ["App Android", o.android?.pessoas ?? 0],
            ["App iPhone", o.iphone?.pessoas ?? 0],
          ] as [string, number][]).filter(([, v]) => v > 0)} />
        </div>
        <div style={cartao}>
          <div style={titulo}>Aparelho</div>
          <Barras total={soma(dados.por_aparelho as Record<string, number>)} itens={ordenar(dados.por_aparelho as Record<string, number>, { celular: "Celular", computador: "Computador" })} />
        </div>
        <div style={cartao}>
          <div style={titulo}>De onde vieram</div>
          <Barras total={soma(dados.por_fonte)} itens={ordenar(dados.por_fonte, NOME_FONTE)} />
        </div>
        <div style={cartao}>
          <div style={titulo}>Páginas mais abertas</div>
          <Barras total={soma(dados.por_pagina)} itens={ordenar(dados.por_pagina, NOME_PAGINA)} />
        </div>
        <div style={cartao}>
          <div style={titulo}>O que mais procuram</div>
          {dados.buscas.length ? (
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#1A1917", lineHeight: 1.9 }}>
              {dados.buscas.map(b => <li key={b.busca} style={{ textTransform: "capitalize" }}>{b.busca} <span style={{ color: "#7A7670" }}>· {n(b.n)}</span></li>)}
            </ol>
          ) : <div style={{ fontSize: 13, color: "#7A7670" }}>Ainda sem buscas.</div>}
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#7A7670", lineHeight: 1.6 }}>
        &quot;Pessoas&quot; = aparelhos diferentes em cada dia (a mesma pessoa em dias diferentes conta de novo). Contagem anônima:
        sem nome, e-mail ou IP. Suas visitas como admin não contam. Começou a contar em 15/10/2026.
      </div>
    </div>
  );
}
