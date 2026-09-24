import { supabase } from "@/lib/supabase";

export type ResultadoResgate = "ok" | "invalido" | "usado" | "ja_resgatado" | "sem_loja" | "nao_logado" | "erro";

// Resgate atômico no banco (função resgatar_cupom, ver supabase/fase1-seguranca.sql).
export async function resgatarCupom(codigo: string): Promise<ResultadoResgate> {
  const { data, error } = await supabase.rpc("resgatar_cupom", { p_codigo: codigo });
  if (error) return "erro";
  return data as ResultadoResgate;
}

// Gera cupom pela rota de admin (a validação de admin acontece no servidor).
export async function gerarCupom(): Promise<{ codigo?: string; erro?: string }> {
  try {
    const resp = await fetch("/api/admin/cupons", { method: "POST" });
    return await resp.json();
  } catch {
    return { erro: "Falha de conexão." };
  }
}
