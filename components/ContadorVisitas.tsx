"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ehAdmin } from "@/lib/admin";
import { detectar as estaNoAppDaLoja } from "@/lib/appLoja";

// Conta cada página aberta para a aba "Visitas" do /admin (anônimo — ver app/api/visitas).
// Não conta: o admin, o próprio /admin e o site rodando no computador de desenvolvimento.
let primeira = true;

export default function ContadorVisitas() {
  const caminho = usePathname();
  const consulta = useSearchParams().toString();

  useEffect(() => {
    if (!caminho || caminho.startsWith("/admin") || location.hostname === "localhost") return;
    const ehPrimeira = primeira;
    primeira = false;
    let cancelado = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelado || ehAdmin(data.session?.user.email)) return;
      fetch("/api/visitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caminho,
          consulta,
          referrer: ehPrimeira ? document.referrer : "",
          primeira: ehPrimeira,
          app: estaNoAppDaLoja(),
        }),
        keepalive: true,
      }).catch(() => {});
    });
    return () => { cancelado = true; };
  }, [caminho, consulta]);

  return null;
}
