import { supabase } from "@/lib/supabase";
import type { NovoVeiculo, Veiculo, VeiculoComLoja } from "@/lib/tipos";
import { escaparLike, limparTextoBusca, type Filtros } from "@/lib/busca";

export async function listarVeiculosAtivos() {
  const { data, error, count } = await supabase
    .from("veiculos")
    .select("*, lojas(nome, cidade)", { count: "exact" })
    .eq("ativo", true)
    .order("criado_em", { ascending: false });
  return { veiculos: (data ?? []) as VeiculoComLoja[], total: count ?? data?.length ?? 0, error };
}

// Busca com filtros (página /veiculos). O RLS já restringe a anúncios ativos de lojas ativas.
export async function buscarVeiculosFiltrados(f: Filtros) {
  let consulta = supabase
    .from("veiculos")
    .select("*, lojas(nome, cidade)", { count: "exact" })
    .eq("ativo", true);

  if (f.q) {
    const termo = limparTextoBusca(f.q);
    if (termo) consulta = consulta.or(["nome", "marca", "modelo", "versao"].map(c => `${c}.ilike.%${termo}%`).join(","));
  }
  // Anúncio antigo sem tipo conta como carro.
  if (f.tipo === "carro") consulta = consulta.or("tipo.eq.carro,tipo.is.null");
  else if (f.tipo) consulta = consulta.eq("tipo", f.tipo);
  if (f.marca) consulta = consulta.ilike("marca", escaparLike(f.marca));
  if (f.cidade) consulta = consulta.ilike("cidade", escaparLike(f.cidade));
  if (f.cambio) consulta = consulta.ilike("cambio", escaparLike(f.cambio));
  if (f.combustivel) consulta = consulta.ilike("combustivel", escaparLike(f.combustivel));
  if (f.ano_min) consulta = consulta.gte("ano_num", f.ano_min);
  if (f.preco_min) consulta = consulta.gte("preco", f.preco_min);
  if (f.preco_max) consulta = consulta.lte("preco", f.preco_max);
  if (f.km_max) consulta = consulta.lte("km_num", f.km_max);

  switch (f.ordem) {
    case "menor_preco": consulta = consulta.order("preco", { ascending: true, nullsFirst: false }); break;
    case "maior_preco": consulta = consulta.order("preco", { ascending: false, nullsFirst: false }); break;
    case "menor_km": consulta = consulta.order("km_num", { ascending: true, nullsFirst: false }); break;
  }
  consulta = consulta.order("criado_em", { ascending: false });

  const { data, error, count } = await consulta;
  return { veiculos: (data ?? []) as VeiculoComLoja[], total: count ?? data?.length ?? 0, error };
}

// Opções dos filtros a partir dos anúncios que existem (sem marca/cidade "fantasma").
export async function opcoesDeFiltro() {
  const { data } = await supabase
    .from("veiculos")
    .select("marca, cidade, cambio, combustivel")
    .eq("ativo", true);
  const unicos = (campo: "marca" | "cidade" | "cambio" | "combustivel") => {
    const vistos = new Map<string, string>();
    for (const linha of data ?? []) {
      const v = (linha[campo] as string | null)?.trim();
      if (v && !vistos.has(v.toLowerCase())) vistos.set(v.toLowerCase(), v);
    }
    return [...vistos.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
  };
  return { marcas: unicos("marca"), cidades: unicos("cidade"), cambios: unicos("cambio"), combustiveis: unicos("combustivel") };
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
    .select("id, nome, ano, km, preco, status, ativo, fotos, destaque")
    .or(filtro)
    .order("criado_em", { ascending: false });
  type Resumo = Pick<Veiculo, "id" | "nome" | "ano" | "km" | "preco" | "status" | "ativo" | "fotos" | "destaque">;
  return { veiculos: (data ?? []) as Resumo[], error };
}

export async function criarVeiculo(veiculo: NovoVeiculo) {
  return supabase.from("veiculos").insert(veiculo);
}

// Anúncio completo para o dono editar (inclui pausados, pela policy veiculos_select_owner).
export async function buscarVeiculoDoDono(id: string, usuarioId: string) {
  const { data } = await supabase.from("veiculos").select("*").eq("id", id).eq("usuario_id", usuarioId).maybeSingle();
  return data as Veiculo | null;
}

// Edição pelo dono (RLS: só altera anúncio com usuario_id = auth.uid()).
export async function atualizarVeiculo(id: string, dados: Partial<NovoVeiculo>) {
  return supabase.from("veiculos").update(dados).eq("id", id).select("id").single();
}

// Pausar tira o anúncio do site sem apagar; reativar devolve.
export async function definirAnuncioAtivo(id: string, ativo: boolean) {
  return supabase
    .from("veiculos")
    .update({ ativo, status: ativo ? "ativo" : "pausado" })
    .eq("id", id)
    .select("id")
    .single();
}

// Exclui o anúncio e tenta apagar as fotos do Storage (se falhar, o anúncio já saiu do ar).
export async function excluirVeiculo(id: string, fotos: string[] | null) {
  // .select() confirma que a linha saiu mesmo (com RLS, um delete barrado não dá erro, só apaga 0 linhas).
  const { data, error } = await supabase.from("veiculos").delete().eq("id", id).select("id");
  if (error) return { error };
  if (!data?.length) return { error: { message: "Anúncio não encontrado ou sem permissão." } };
  await apagarFotos(fotos ?? []);
  return { error: null };
}

// Apaga fotos do Storage a partir das URLs públicas. Só funciona na pasta do próprio usuário
// (policy veiculos_fotos_delete_propria_pasta); falha em silêncio — nunca bloqueia o lojista.
export async function apagarFotos(urls: string[]) {
  const marcador = "/object/public/veiculos/";
  const caminhos = urls
    .map(url => (url.includes(marcador) ? decodeURIComponent(url.split(marcador)[1].split("?")[0]) : null))
    .filter((c): c is string => !!c);
  if (caminhos.length) await supabase.storage.from("veiculos").remove(caminhos);
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
