"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Icone from "@/components/Icone";

// Último relatório mensal da loja no painel (o mesmo que vai por e-mail/WhatsApp; supabase/fase21).
type Dados = { visualizacoes: number; whatsapp: number; ligacoes: number; mais_visto: { nome: string; visualizacoes: number } | null; vendidos: number };
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export default function RelatorioPainel({ lojaId }: { lojaId: string }) {
  const [rel, setRel] = useState<{ mes: string; dados: Dados } | null>(null);
  useEffect(() => {
    let ativo = true;
    supabase.from("relatorios_mensais").select("mes, dados").eq("loja_id", lojaId).order("mes", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { if (ativo && data) setRel(data as { mes: string; dados: Dados }); });
    return () => { ativo = false; };
  }, [lojaId]);
  if (!rel) return null;
  const m = Number(rel.mes.split("-")[1]);
  const d = rel.dados;
  const item = (icone: "olho" | "whatsapp" | "telefone", valor: number, rotulo: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#1A1917" }}>
      <Icone nome={icone} tamanho={16} /> <strong>{valor.toLocaleString("pt-BR")}</strong> <span style={{ color: "#7A7670" }}>{rotulo}</span>
    </div>
  );
  return (
    <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <Icone nome="grafico" tamanho={17} /> Seu relatório de {MESES[m - 1]}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
        {item("olho", d.visualizacoes, "visualizações")}
        {item("whatsapp", d.whatsapp, "contatos no WhatsApp")}
        {item("telefone", d.ligacoes, "ligações")}
      </div>
      {d.mais_visto && <div style={{ fontSize: 12.5, color: "#7A7670", marginTop: 8 }}>Anúncio mais visto: <strong style={{ color: "#1A1917" }}>{d.mais_visto.nome}</strong> ({d.mais_visto.visualizacoes.toLocaleString("pt-BR")} visualizações)</div>}
    </div>
  );
}
