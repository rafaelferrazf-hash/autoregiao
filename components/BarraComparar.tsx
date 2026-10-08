"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { limparComparar, MAXIMO_COMPARAR, useComparar } from "@/lib/comparar";
import Icone from "@/components/Icone";

// Barra fixa embaixo quando há carros escolhidos para comparar. Some nas páginas que já têm
// barra fixa embaixo (anúncio no celular, painel) e na própria comparação.
const SEM_BARRA = /^\/(veiculo\/|painel|admin|comparar|pagamento|offline)/;

export default function BarraComparar() {
  const ids = useComparar();
  const caminho = usePathname();
  if (!ids.length || SEM_BARRA.test(caminho)) return null;
  const falta = ids.length < 2;

  return (
    <div style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: "calc(14px + env(safe-area-inset-bottom, 0px))", zIndex: 60, display: "flex", alignItems: "center", gap: 10, background: "#1A1A1A", color: "#fff", borderRadius: 40, padding: "8px 8px 8px 16px", boxShadow: "0 6px 20px rgba(0,0,0,0.3)", maxWidth: "calc(100% - 24px)" }}>
      <span style={{ fontSize: 13, whiteSpace: "nowrap" }}>
        <Icone nome="comparar" cor="#FF6600" /> {ids.length} de {MAXIMO_COMPARAR}
      </span>
      <button type="button" onClick={limparComparar} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 12, cursor: "pointer" }}>Limpar</button>
      {falta
        ? <span style={{ fontSize: 12.5, padding: "8px 12px", color: "rgba(255,255,255,0.75)" }}>Escolha mais 1</span>
        : <Link href="/comparar" style={{ padding: "8px 14px", background: "#FF6600", color: "#fff", borderRadius: 30, fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>Comparar →</Link>}
    </div>
  );
}
