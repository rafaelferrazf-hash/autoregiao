"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Icone from "@/components/Icone";

// Admin → Lojas: chave que abre/fecha o Repasse para os lojistas (site_config.repasse_liberado).
type Info = { liberado: boolean; ativos: number; repassados: number; lojas: number };

export default function AdminRepasse() {
  const [info, setInfo] = useState<Info | null>(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/admin/repasse", { cache: "no-store" }).then(async r => {
      const j = await r.json().catch(() => ({}));
      if (r.ok) setInfo(j); else setErro("Repasse indisponível (o SQL da fase34 já foi rodado?).");
    }).catch(() => setErro("Não foi possível carregar o Repasse."));
  }, []);

  async function alternar() {
    if (!info) return;
    const liberar = !info.liberado;
    const pergunta = liberar
      ? "Liberar o Repasse para TODAS as lojas com CNPJ e plano em dia?"
      : "Fechar o Repasse? As lojas deixam de ver a página (os carros cadastrados continuam guardados).";
    if (!confirm(pergunta)) return;
    setSalvando(true);
    const r = await fetch("/api/admin/repasse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ liberado: liberar }) });
    const j = await r.json().catch(() => ({}));
    setSalvando(false);
    if (!r.ok) return alert(j.erro || "Não foi possível salvar.");
    setInfo({ ...info, liberado: j.liberado });
  }

  return (
    <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: "#1A1A1A", color: "#FF6600", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icone nome="repasse" tamanho={22} /></span>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "#1A1917" }}>
          Repasse entre lojistas{" "}
          {info && (
            <span style={{ marginLeft: 4, padding: "2px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 700, background: info.liberado ? "#DCFCE7" : "#F3F4F6", color: info.liberado ? "#166534" : "#4B5563" }}>
              {info.liberado ? "Liberado" : "Fechado"}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: "#7A7670", marginTop: 2 }}>
          {erro || (info
            ? `${info.ativos} carros no repasse · ${info.lojas} lojas oferecendo · ${info.repassados} repassados. ${info.liberado ? "Lojas com CNPJ e plano em dia estão vendo." : "Só você e a Auto Paulista veem."}`
            : "Carregando...")}
        </div>
      </div>
      <Link href="/repasse" style={{ padding: "9px 14px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#1A1917", textDecoration: "none" }}>Ver página</Link>
      {info && (
        <button onClick={alternar} disabled={salvando} style={{ padding: "9px 14px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#fff", background: info.liberado ? "#B91C1C" : "#16A34A" }}>
          {salvando ? "Salvando..." : info.liberado ? "Fechar para os lojistas" : "Liberar para os lojistas"}
        </button>
      )}
    </div>
  );
}
