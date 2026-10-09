"use client";
import Link from "next/link";
import { useAppNativo } from "@/lib/nativo";

// TEMPORÁRIO: link para /diagnostico-app no rodapé, só dentro do app de iPhone.
export default function LinkDiagnostico({ estilo }: { estilo: React.CSSProperties }) {
  return useAppNativo() ? <Link href="/diagnostico-app" style={estilo}>Diagnóstico do app</Link> : null;
}
