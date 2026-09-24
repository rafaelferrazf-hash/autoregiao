import { supabase } from "@/lib/supabase";
import type { Loja } from "@/lib/tipos";

export async function buscarLojaDoUsuario(usuarioId: string) {
  const { data, error } = await supabase
    .from("lojas")
    .select("*")
    .eq("usuario_id", usuarioId)
    .maybeSingle();
  return { loja: data as Loja | null, error };
}
