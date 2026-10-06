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

// Logo/foto da loja: reduz no aparelho, envia para a pasta do lojista no Storage e grava em lojas.logo_url.
export async function enviarLogoLoja(usuarioId: string, lojaId: string, arquivo: File, logoAnterior?: string | null) {
  const { reduzirImagem } = await import("@/lib/imagem");
  const { blob, extensao, tipo } = await reduzirImagem(arquivo, 600);
  const caminho = `${usuarioId}/loja-logo-${Date.now()}.${extensao}`;
  const envio = await supabase.storage.from("veiculos").upload(caminho, blob, { contentType: tipo });
  if (envio.error) return { url: null, error: envio.error };
  const url = supabase.storage.from("veiculos").getPublicUrl(caminho).data.publicUrl;
  const { error } = await supabase.from("lojas").update({ logo_url: url }).eq("id", lojaId);
  if (error) return { url: null, error };
  if (logoAnterior) await apagarArquivoDoStorage(logoAnterior);
  return { url, error: null };
}

export async function removerLogoLoja(lojaId: string, logoAtual: string | null) {
  const { error } = await supabase.from("lojas").update({ logo_url: null }).eq("id", lojaId);
  if (!error && logoAtual) await apagarArquivoDoStorage(logoAtual);
  return { error };
}

// Foto de capa (fachada): maior que o logo, aparece no topo da página da loja.
export async function enviarCapaLoja(usuarioId: string, lojaId: string, arquivo: File, capaAnterior?: string | null) {
  const { reduzirImagem } = await import("@/lib/imagem");
  const { blob, extensao, tipo } = await reduzirImagem(arquivo, 1600);
  const caminho = `${usuarioId}/loja-capa-${Date.now()}.${extensao}`;
  const envio = await supabase.storage.from("veiculos").upload(caminho, blob, { contentType: tipo });
  if (envio.error) return { url: null, error: envio.error };
  const url = supabase.storage.from("veiculos").getPublicUrl(caminho).data.publicUrl;
  const { error } = await supabase.from("lojas").update({ capa_url: url }).eq("id", lojaId);
  if (error) return { url: null, error };
  if (capaAnterior) await apagarArquivoDoStorage(capaAnterior);
  return { url, error: null };
}

export async function removerCapaLoja(lojaId: string, capaAtual: string | null) {
  const { error } = await supabase.from("lojas").update({ capa_url: null }).eq("id", lojaId);
  if (!error && capaAtual) await apagarArquivoDoStorage(capaAtual);
  return { error };
}

async function apagarArquivoDoStorage(url: string) {
  const marca = "/storage/v1/object/public/veiculos/";
  const i = url.indexOf(marca);
  if (i >= 0) await supabase.storage.from("veiculos").remove([url.slice(i + marca.length)]);
}
