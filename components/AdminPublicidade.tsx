"use client";
import { useState } from "react";
import AdminBanners from "@/components/AdminBanners";
import AdminFlutuantes from "@/components/AdminFlutuantes";
import { VAGAS_BANNER, VAGAS_FLUTUANTE } from "@/lib/banners";

// Aba "Banners" do /admin: escolhe entre os banners do carrossel e o anúncio flutuante.
export default function AdminPublicidade() {
  const [tipo, setTipo] = useState<"carrossel" | "flutuante">("carrossel");
  const opcao = (t: typeof tipo, texto: string) => (
    <button type="button" onClick={() => setTipo(t)}
      style={{ padding: "9px 16px", borderRadius: 20, border: "1.5px solid", borderColor: tipo === t ? "#FF6600" : "#E8E6E1", background: tipo === t ? "#FFF7ED" : "#fff", color: tipo === t ? "#FF6600" : "#1A1917", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
      {texto}
    </button>
  );
  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {opcao("carrossel", `Banners do carrossel (${VAGAS_BANNER} vagas)`)}
        {opcao("flutuante", `Anúncio flutuante (${VAGAS_FLUTUANTE} vagas)`)}
      </div>
      {tipo === "carrossel" ? <AdminBanners /> : <AdminFlutuantes />}
    </>
  );
}
