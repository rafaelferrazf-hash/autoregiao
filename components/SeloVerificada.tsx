import Icone from "@/components/Icone";

// Selo "Loja verificada" (supabase/fase21): o admin conferiu CNPJ, endereço e telefone da loja.
// "icone": só o escudo (ao lado do nome, nos cards); "etiqueta": escudo + texto.
export default function SeloVerificada({ tipo = "etiqueta", claro = false }: { tipo?: "icone" | "etiqueta"; claro?: boolean }) {
  const titulo = "Loja verificada pelo AutoRegião: CNPJ, endereço e telefone conferidos";
  if (tipo === "icone") {
    return <span title={titulo} aria-label="Loja verificada" style={{ display: "inline-flex", color: claro ? "#93C5FD" : "#1D4ED8", flexShrink: 0 }}><Icone nome="escudo" tamanho={14} traco={2.2} /></span>;
  }
  return (
    <span title={titulo} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap",
      color: claro ? "#DBEAFE" : "#1D4ED8", background: claro ? "rgba(59,130,246,0.25)" : "#EFF6FF", border: `1px solid ${claro ? "rgba(147,197,253,0.5)" : "#BFDBFE"}` }}>
      <Icone nome="escudo" tamanho={13} traco={2.2} /> Loja verificada
    </span>
  );
}
