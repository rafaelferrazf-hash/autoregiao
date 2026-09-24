import { supabase } from "@/lib/supabase";
import type { NovoVeiculo, Veiculo, VeiculoComLoja } from "@/lib/tipos";

export async function listarVeiculosAtivos() {
  const { data, error, count } = await supabase
    .from("veiculos")
    .select("*, lojas(nome, cidade)", { count: "exact" })
    .eq("ativo", true)
    .order("criado_em", { ascending: false });
  return { veiculos: (data ?? []) as VeiculoComLoja[], total: count ?? data?.length ?? 0, error };
}

export async function buscarVeiculo(id: string) {
  const { data, error } = await supabase
    .from("veiculos")
    .select("*, lojas(nome, cidade)")
    .eq("id", id)
    .single();
  return { veiculo: data as VeiculoComLoja | null, error };
}

// Anúncios do lojista: os criados pelo usuário e os vinculados à loja dele.
export async function listarVeiculosDoUsuario(usuarioId: string, lojaId?: string | null) {
  const filtro = `usuario_id.eq.${usuarioId}${lojaId ? `,loja_id.eq.${lojaId}` : ""}`;
  const { data, error } = await supabase
    .from("veiculos")
    .select("id, nome, ano, km, preco, status, fotos, destaque")
    .or(filtro)
    .order("criado_em", { ascending: false });
  type Resumo = Pick<Veiculo, "id" | "nome" | "ano" | "km" | "preco" | "status" | "fotos" | "destaque">;
  return { veiculos: (data ?? []) as Resumo[], error };
}

export async function criarVeiculo(veiculo: NovoVeiculo) {
  return supabase.from("veiculos").insert(veiculo);
}

// Envia a foto para o bucket "veiculos" e devolve a URL pública (ou null se falhar).
export async function enviarFotoVeiculo(usuarioId: string, arquivo: File) {
  const ext = arquivo.name.split(".").pop();
  const caminho = `${usuarioId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("veiculos")
    .upload(caminho, arquivo, { contentType: arquivo.type });
  if (error) return null;
  return supabase.storage.from("veiculos").getPublicUrl(caminho).data.publicUrl;
}
