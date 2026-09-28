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

// Campos que o lojista pode editar (grant de coluna na Fase 1; plano/expira_em/ativo ficam de fora).
export type PerfilLojaEditavel = Pick<Loja, "nome" | "cidade"> & {
  estado: string; telefone: string; whatsapp: string; endereco: string; horario: string; descricao: string;
};

export async function atualizarPerfilLoja(id: string, perfil: PerfilLojaEditavel) {
  const vazioViraNull = (v: string) => (v.trim() ? v.trim() : null);
  const { data, error } = await supabase
    .from("lojas")
    .update({
      nome: perfil.nome.trim(),
      cidade: perfil.cidade.trim(),
      estado: vazioViraNull(perfil.estado),
      telefone: vazioViraNull(perfil.telefone),
      whatsapp: vazioViraNull(perfil.whatsapp),
      endereco: vazioViraNull(perfil.endereco),
      horario: vazioViraNull(perfil.horario),
      descricao: vazioViraNull(perfil.descricao),
    })
    .eq("id", id)
    .select("*")
    .single();
  return { loja: data as Loja | null, error };
}
