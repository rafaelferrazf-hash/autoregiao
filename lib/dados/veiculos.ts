import { supabase } from "@/lib/supabase";
import { COLUNAS_CARD, type NovoVeiculo, type Veiculo, type VeiculoComLoja } from "@/lib/tipos";
import { aplicarFiltros, escaparLike, type Filtros } from "@/lib/busca";

export async function listarVeiculosAtivos() {
  const { data, error, count } = await supabase
    .from("veiculos")
    .select(COLUNAS_CARD, { count: "exact" })
    .eq("ativo", true)
    .order("prioridade", { ascending: false })
    .order("criado_em", { ascending: false });
  return { veiculos: (data ?? []) as VeiculoComLoja[], total: count ?? data?.length ?? 0, error };
}

// Busca com filtros (página /veiculos). O RLS já restringe a anúncios ativos de lojas ativas.
export async function buscarVeiculosFiltrados(f: Filtros) {
  let consulta = supabase
    .from("veiculos")
    .select(COLUNAS_CARD, { count: "exact" })
    .eq("ativo", true);

  consulta = aplicarFiltros(consulta, f);

  switch (f.ordem) {
    case "menor_preco": consulta = consulta.order("preco", { ascending: true, nullsFirst: false }); break;
    case "maior_preco": consulta = consulta.order("preco", { ascending: false, nullsFirst: false }); break;
    case "menor_km": consulta = consulta.order("km_num", { ascending: true, nullsFirst: false }); break;
    default: consulta = consulta.order("prioridade", { ascending: false }); // Premium > Profissional > Básico
  }
  consulta = consulta.order("criado_em", { ascending: false });

  const { data, error, count } = await consulta;
  return { veiculos: (data ?? []) as VeiculoComLoja[], total: count ?? data?.length ?? 0, error };
}

// Vitrine "Ofertas em destaque" da página inicial: anúncios de lojas Premium (prioridade 2),
// em ordem aleatória a cada visita para todas as lojas Premium terem a mesma chance.
export async function listarVitrinePremium(quantos = 8) {
  const { data } = await supabase.from("veiculos").select(COLUNAS_CARD).eq("ativo", true).eq("prioridade", 2)
    .order("criado_em", { ascending: false }).limit(40);
  const lista = [...((data ?? []) as VeiculoComLoja[])];
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista.slice(0, quantos);
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
    .select("*, lojas(nome, cidade, estado, endereco, criado_em, whatsapp, telefone, logo_url)")
    .eq("id", id)
    .single();
  return { veiculo: data as VeiculoComLoja | null, error };
}

// "Veículos parecidos" no fim do anúncio: primeiro o mesmo modelo, depois a mesma marca, e por
// fim o mesmo tipo (carro/moto/utilitário) numa faixa de preço próxima (±30%).
export async function buscarSemelhantes(v: Veiculo, limite = 6) {
  const achados: VeiculoComLoja[] = [];
  const base = () => supabase.from("veiculos").select(COLUNAS_CARD).eq("ativo", true).neq("id", v.id);
  const juntar = (lista: unknown[] | null) => {
    for (const item of (lista ?? []) as VeiculoComLoja[]) {
      if (achados.length < limite && !achados.some(a => a.id === item.id)) achados.push(item);
    }
  };

  if (v.marca && v.modelo) {
    const { data } = await base().ilike("marca", escaparLike(v.marca)).ilike("modelo", escaparLike(v.modelo)).order("criado_em", { ascending: false }).limit(limite);
    juntar(data);
  }
  if (achados.length < limite && v.marca) {
    const { data } = await base().ilike("marca", escaparLike(v.marca)).order("criado_em", { ascending: false }).limit(limite);
    juntar(data);
  }
  if (achados.length < limite) {
    let consulta = base();
    if (v.tipo === "moto" || v.tipo === "utilitario") consulta = consulta.eq("tipo", v.tipo);
    else consulta = consulta.or("tipo.eq.carro,tipo.is.null");
    if (v.preco) consulta = consulta.gte("preco", Math.round(v.preco * 0.7)).lte("preco", Math.round(v.preco * 1.3));
    const { data } = await consulta.order("criado_em", { ascending: false }).limit(limite * 2);
    juntar(data);
  }
  return achados;
}

// Página /favoritos: só os anúncios que ainda estão ativos.
export async function buscarVeiculosPorIds(ids: string[]) {
  if (!ids.length) return { veiculos: [] as VeiculoComLoja[], error: null };
  const { data, error } = await supabase.from("veiculos").select(COLUNAS_CARD).eq("ativo", true).in("id", ids.slice(0, 100));
  const porId = new Map(((data ?? []) as VeiculoComLoja[]).map(v => [v.id, v]));
  // Mantém a ordem em que foram salvos (o mais recente primeiro).
  return { veiculos: ids.map(id => porId.get(id)).filter((v): v is VeiculoComLoja => !!v), error };
}

// Anúncios do lojista: os criados pelo usuário e os vinculados à loja dele.
export async function listarVeiculosDoUsuario(usuarioId: string, lojaId?: string | null) {
  const filtro = `usuario_id.eq.${usuarioId}${lojaId ? `,loja_id.eq.${lojaId}` : ""}`;
  const { data, error } = await supabase
    .from("veiculos")
    .select("id, nome, ano, km, preco, status, ativo, fotos, destaque, fipe_valor, fipe_ano")
    .or(filtro)
    .order("criado_em", { ascending: false });
  type Resumo = Pick<Veiculo, "id" | "nome" | "ano" | "km" | "preco" | "status" | "ativo" | "fotos" | "destaque" | "fipe_valor" | "fipe_ano">;
  return { veiculos: (data ?? []) as Resumo[], error };
}

export async function criarVeiculo(veiculo: NovoVeiculo) {
  return supabase.from("veiculos").insert(veiculo).select("id").single();
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
// "Finalizar": vendido. O banco tira do ar e não deixa voltar (supabase/fase15).
export async function marcarVendido(id: string) {
  return supabase.from("veiculos").update({ status: "vendido", ativo: false }).eq("id", id).select("id").single();
}

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
  // Junto com cada foto vai a versão do card ("-card.jpg"), se existir.
  const comCard = caminhos.flatMap(c => [c, c.replace(/\.[a-z0-9]+$/i, "-card.jpg")]);
  if (comCard.length) await supabase.storage.from("veiculos").remove(comCard);
}

// Envia a foto para o bucket "veiculos" e devolve a URL pública (ou null se falhar).
// Antes de enviar, reduz no próprio aparelho (foto de câmera: 3–8 MB → ~400–600 KB, lado maior 2048 px — sem perda visível),
// para economizar o espaço do Storage e carregar rápido. Se o aparelho não conseguir reduzir, envia a original.
export async function enviarFotoVeiculo(usuarioId: string, arquivo: File) {
  let corpo: Blob = arquivo, ext = arquivo.name.split(".").pop() || "jpg", tipo = arquivo.type;
  try {
    const { reduzirImagem } = await import("@/lib/imagem");
    const r = await reduzirImagem(arquivo, 2048, { jpeg: true, qualidade: 0.88 });
    if (r.blob.size < arquivo.size) { corpo = r.blob; ext = r.extensao; tipo = r.tipo; }
  } catch { /* formato que o navegador não abre: vai a original */ }
  const base = `${usuarioId}/${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const caminho = `${base}.${ext}`;
  const { error } = await supabase.storage
    .from("veiculos")
    .upload(caminho, corpo, { contentType: tipo });
  if (error) return null;
  // Versão do card (800 px). Se falhar, o card usa a foto grande — o anúncio não é prejudicado.
  try {
    const { reduzirImagem } = await import("@/lib/imagem");
    const card = await reduzirImagem(arquivo, 800, { jpeg: true, qualidade: 0.85 });
    await supabase.storage.from("veiculos").upload(`${base}-card.jpg`, card.blob, { contentType: "image/jpeg" });
  } catch { /* sem versão do card */ }
  return supabase.storage.from("veiculos").getPublicUrl(caminho).data.publicUrl;
}
