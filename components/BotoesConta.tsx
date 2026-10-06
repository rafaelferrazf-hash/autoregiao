"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ehAdmin } from "@/lib/admin";
import Icone from "@/components/Icone";

// Botões do topo das páginas públicas: "Entrar / Cadastrar loja" para visitante,
// "Meu painel" para lojista logado e só "Admin" para a conta de admin.
export default function BotoesConta({ celular = false }: { celular?: boolean }) {
  const [conta, setConta] = useState<"carregando" | "visitante" | "lojista" | "admin">("carregando");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setConta(!data.user ? "visitante" : ehAdmin(data.user.email) ? "admin" : "lojista");
    });
  }, []);

  const base = celular
    ? { flex: 1, padding: "10px", borderRadius: 7, fontSize: 14, fontWeight: 500, textDecoration: "none", textAlign: "center" as const }
    : { padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center" };
  const contorno = { ...base, border: "1.5px solid #E8E6E1", background: "transparent", color: "#1A1917" };
  const cheio = { ...base, background: "#FF6600", border: "1.5px solid #FF6600", color: "#fff" };

  // Enquanto confere a sessão, guarda o espaço para o topo não "pular".
  if (conta === "carregando") return <span style={{ ...contorno, visibility: "hidden" }}>Entrar</span>;

  if (conta === "visitante") {
    return (
      <>
        <Link href="/login" style={contorno}>Entrar</Link>
        <Link href="/cadastro" style={cheio}>Cadastrar loja</Link>
      </>
    );
  }

  // Conta de admin é só admin (a loja do dono fica numa conta de lojista separada).
  if (conta === "admin") return <Link href="/admin" style={cheio}><Icone nome="escudo" /> Admin</Link>;
  return <Link href="/painel" style={cheio}>Meu painel</Link>;
}
