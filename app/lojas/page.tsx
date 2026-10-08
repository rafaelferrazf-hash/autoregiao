import type { Metadata } from "next";
import Link from "next/link";
import PaginaSimples from "@/components/PaginaSimples";
import LogoLoja from "@/components/LogoLoja";
import Icone from "@/components/Icone";
import { criarClienteAnonimo } from "@/lib/supabase-servidor";

// "Lojas da região": todas as lojas com veículos à venda (o RLS já esconde anúncios de lojas
// vencidas/desativadas e os de demonstração). Ordem: mais veículos primeiro.
export const metadata: Metadata = {
  title: "Lojas de veículos da região | AutoRegião",
  description: "Conheça as lojas e revendas de carros, motos e utilitários da região: veja o endereço, os veículos à venda e fale direto pelo WhatsApp.",
  alternates: { canonical: "/lojas" },
};

type LojaLista = { id: string; nome: string; cidade: string | null; estado: string | null; endereco: string | null; logo_url: string | null; capa_url: string | null };

export default async function Lojas({ searchParams }: { searchParams: Promise<{ cidade?: string }> }) {
  const { cidade: filtroCidade } = await searchParams;
  const supabase = criarClienteAnonimo();
  const [{ data: lojas }, { data: veiculos }] = await Promise.all([
    supabase.from("lojas").select("id, nome, cidade, estado, endereco, logo_url, capa_url, ativo").neq("ativo", false),
    supabase.from("veiculos").select("loja_id").eq("ativo", true).not("loja_id", "is", null).limit(10000),
  ]);
  const qtd = new Map<string, number>();
  for (const v of veiculos ?? []) qtd.set(v.loja_id as string, (qtd.get(v.loja_id as string) ?? 0) + 1);

  const comVeiculos = ((lojas ?? []) as LojaLista[])
    .filter(l => (qtd.get(l.id) ?? 0) > 0)
    .sort((a, b) => (qtd.get(b.id) ?? 0) - (qtd.get(a.id) ?? 0) || a.nome.localeCompare(b.nome, "pt-BR"));
  const cidades = [...new Set(comVeiculos.map(l => l.cidade?.trim()).filter((c): c is string => !!c))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const lista = filtroCidade ? comVeiculos.filter(l => l.cidade?.trim() === filtroCidade) : comVeiculos;
  const chip = (ativo: boolean) => ({ display: "inline-block", padding: "6px 12px", background: ativo ? "#FFF5F1" : "#fff", border: `1.5px solid ${ativo ? "#FF6600" : "#E8E6E1"}`, borderRadius: 20, fontSize: 12.5, color: ativo ? "#FF6600" : "#1A1917", fontWeight: ativo ? 700 : 500, textDecoration: "none" }) as const;

  return (
    <PaginaSimples>
      <style>{`
        .lojas-grade { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        @media (max-width: 860px) { .lojas-grade { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 520px) { .lojas-grade { grid-template-columns: 1fr; } }
      `}</style>
      <nav aria-label="Caminho" style={{ fontSize: 12, color: "#7A7670", marginBottom: 12 }}>
        <Link href="/" style={{ color: "#7A7670", textDecoration: "none" }}>Início</Link> › <span style={{ color: "#1A1917" }}>Lojas</span>
      </nav>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1A1917", margin: "0 0 6px" }}>Lojas da região</h1>
      <p style={{ fontSize: 14, color: "#7A7670", margin: "0 0 16px", lineHeight: 1.6 }}>
        {lista.length} {lista.length === 1 ? "loja com veículos à venda" : "lojas com veículos à venda"}{filtroCidade ? ` em ${filtroCidade}` : ""}. Veja os carros de cada uma e fale direto pelo WhatsApp.
      </p>

      {cidades.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          <Link href="/lojas" style={chip(!filtroCidade)}>Todas as cidades</Link>
          {cidades.map(c => <Link key={c} href={`/lojas?${new URLSearchParams({ cidade: c })}`} style={chip(filtroCidade === c)}>{c}</Link>)}
        </div>
      )}

      {lista.length === 0 ? (
        <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 32, textAlign: "center", fontSize: 13, color: "#7A7670" }}>
          Nenhuma loja com veículos à venda {filtroCidade ? "nessa cidade" : "ainda"}.
        </div>
      ) : (
        <div className="lojas-grade">
          {lista.map(l => {
            const n = qtd.get(l.id) ?? 0;
            const local = [l.cidade, l.estado].filter(Boolean).join(", ");
            return (
              <Link key={l.id} href={`/loja/${l.id}`} style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 14, overflow: "hidden", textDecoration: "none", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", aspectRatio: "16 / 9", background: "#1A1A1A", overflow: "hidden" }}>
                  {(l.capa_url || l.logo_url)
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={(l.capa_url || l.logo_url)!} alt={`Fachada da ${l.nome}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: l.capa_url ? "cover" : "contain", display: "block" }} />
                    : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><LogoLoja url={null} tamanho={64} raio={14} /></div>}
                </div>
                <div style={{ padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
                  <LogoLoja url={l.logo_url} tamanho={42} raio={10} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: "#1A1917", lineHeight: 1.25 }}>{l.nome}</div>
                    {local && <div style={{ fontSize: 12, color: "#7A7670", marginTop: 2 }}><Icone nome="local" /> {local}</div>}
                  </div>
                </div>
                <div style={{ padding: "0 14px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto" }}>
                  <span style={{ fontSize: 12.5, color: "#1A1917", fontWeight: 600 }}><Icone nome="carro" cor="#FF6600" /> {n} {n === 1 ? "veículo" : "veículos"}</span>
                  <span style={{ fontSize: 12.5, color: "#FF6600", fontWeight: 700 }}>Ver revenda →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PaginaSimples>
  );
}
