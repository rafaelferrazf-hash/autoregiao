import type { User } from "@supabase/supabase-js";
import { criarClienteAdmin, criarClienteServidor } from "@/lib/supabase-servidor";
import { ehAdmin } from "@/lib/admin";
import { consultarValor, tipoFipeValido } from "@/lib/fipe";
import { LIMITE_REPASSE_ATIVOS, MAX_FOTOS_REPASSE, type AcessoRepasse } from "@/lib/repasse";

// Repasse (supabase/fase34) — regras do lado do servidor. Toda gravação passa por aqui (service key).

export const LOJA_TESTE_REPASSE = "9c29ad84-1ab6-4e16-8c72-a5916185cabc"; // Auto Paulista: sempre liberada

type LojaAcesso = { id: string; usuario_id: string | null; cidade: string | null; cnpj: string | null; plano: string | null; expira_em: string | null; ativo: boolean | null; demonstracao: boolean | null };

function emDia(l: LojaAcesso): boolean {
  if (l.ativo === false) return false;
  if (l.plano === "vitalicio") return true;
  return !!l.expira_em && new Date(l.expira_em).getTime() + 3 * 86_400_000 > Date.now();
}

export async function repasseLiberado(): Promise<boolean> {
  const { data } = await criarClienteAdmin().from("site_config").select("valor").eq("chave", "repasse_liberado").maybeSingle();
  return data?.valor === true;
}

export async function usuarioLogado(): Promise<User | null> {
  const { data: { user } } = await (await criarClienteServidor()).auth.getUser();
  return user;
}

// O mesmo critério de public.pode_ver_repasse(), mais "pode publicar" (precisa ter loja).
export async function acessoDoUsuario(user: User | null): Promise<{ acesso: AcessoRepasse; loja: LojaAcesso | null }> {
  const liberado = await repasseLiberado();
  if (!user) return { acesso: { logado: false, pode: false, podePublicar: false, liberado }, loja: null };
  const { data: loja } = await criarClienteAdmin().from("lojas")
    .select("id, usuario_id, cidade, cnpj, plano, expira_em, ativo, demonstracao").eq("usuario_id", user.id).maybeSingle();
  const admin = ehAdmin(user.email);
  const teste = loja?.id === LOJA_TESTE_REPASSE;
  if (teste) return { acesso: { logado: true, pode: true, podePublicar: true, liberado }, loja };
  if (!loja) return { acesso: { logado: true, pode: admin, podePublicar: false, liberado, motivo: admin ? undefined : "sem_loja" }, loja: null };
  if (!liberado) return { acesso: { logado: true, pode: admin, podePublicar: false, liberado, motivo: "fechado" }, loja };
  if (!loja.cnpj || loja.demonstracao) return { acesso: { logado: true, pode: admin, podePublicar: false, liberado, motivo: "sem_cnpj" }, loja };
  if (!emDia(loja)) return { acesso: { logado: true, pode: admin, podePublicar: false, liberado, motivo: "plano_vencido" }, loja };
  return { acesso: { logado: true, pode: true, podePublicar: true, liberado }, loja };
}

const texto = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const numeroTexto = (v: unknown) => { const n = parseInt(String(v ?? "").replace(/\D/g, ""), 10); return Number.isNaN(n) ? null : String(n); };

// Confere e limpa o que veio da tela. Devolve os campos prontos para gravar ou uma mensagem de erro.
export async function validarRepasse(corpo: Record<string, unknown>, user: User): Promise<{ dados: Record<string, unknown> } | { erro: string }> {
  const tipo = ["carro", "moto", "utilitario"].includes(String(corpo.tipo)) ? String(corpo.tipo) : "carro";
  const marca = texto(corpo.marca, 60), modelo = texto(corpo.modelo, 80), versao = texto(corpo.versao, 140);
  const ano = numeroTexto(corpo.ano), km = numeroTexto(corpo.km);
  if (!marca || !modelo) return { erro: "Preencha a marca e o modelo." };
  if (!ano || Number(ano) < 1950 || Number(ano) > new Date().getFullYear() + 1) return { erro: "Confira o ano." };
  if (km === null) return { erro: "Preencha a KM." };
  const preco = Math.round(Number(corpo.preco));
  if (!Number.isFinite(preco) || preco < 500 || preco > 20_000_000) return { erro: "Confira o preço de repasse." };
  const condicao = corpo.condicao === "reparo" ? "reparo" : "pronto";
  const reparos = texto(corpo.reparos, 600);
  if (condicao === "reparo" && !reparos) return { erro: "Conte o que o carro precisa de reparo." };

  const prefixo = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/veiculos/${user.id}/`;
  const fotos = Array.isArray(corpo.fotos) ? corpo.fotos.filter((f): f is string => typeof f === "string") : [];
  if (fotos.length > MAX_FOTOS_REPASSE) return { erro: `No máximo ${MAX_FOTOS_REPASSE} fotos.` };
  if (fotos.some(f => !f.startsWith(prefixo))) return { erro: "Foto inválida. Envie as fotos de novo." };

  const versaoComModelo = versao && versao.toLowerCase().startsWith(modelo.toLowerCase());
  const nome = [marca, versaoComModelo ? null : modelo, versao, ano].filter(Boolean).join(" ").slice(0, 200);

  // FIPE: o valor é consultado aqui no servidor (a tela só manda o modelo escolhido).
  const f = { tipo: texto(corpo.fipe_tipo, 20), marca: texto(corpo.fipe_marca, 20), modelo: texto(corpo.fipe_modelo, 20), ano: texto(corpo.fipe_ano, 20) };
  let fipe = { fipe_tipo: null as string | null, fipe_marca: null as string | null, fipe_modelo: null as string | null, fipe_ano: null as string | null, fipe_nome: null as string | null, fipe_valor: null as number | null, fipe_mes: null as string | null };
  if (tipoFipeValido(f.tipo) && f.marca && f.modelo && f.ano) {
    const valor = await consultarValor(f.tipo, f.marca, f.modelo, f.ano).catch(() => null);
    fipe = { fipe_tipo: f.tipo, fipe_marca: f.marca, fipe_modelo: f.modelo, fipe_ano: f.ano, fipe_nome: texto(corpo.fipe_nome, 200), fipe_valor: valor?.valor ?? null, fipe_mes: valor?.mes ?? null };
  }

  return {
    dados: {
      tipo, nome, marca, modelo, versao, ano, km,
      cambio: texto(corpo.cambio, 30), combustivel: texto(corpo.combustivel, 30), cor: texto(corpo.cor, 30),
      preco, condicao, reparos: condicao === "reparo" ? reparos : null,
      descricao: texto(corpo.descricao, 1500), cidade: texto(corpo.cidade, 60), fotos,
      ...fipe,
    },
  };
}

export async function contarAtivos(lojaId: string, exceto?: string): Promise<number> {
  let q = criarClienteAdmin().from("repasses").select("id", { count: "exact", head: true }).eq("loja_id", lojaId).eq("status", "ativo");
  if (exceto) q = q.neq("id", exceto);
  const { count } = await q;
  return count ?? 0;
}
export const MSG_LIMITE = `Sua loja já tem ${LIMITE_REPASSE_ATIVOS} carros no repasse. Marque algum como repassado ou pause para colocar outro.`;

// Apaga do Storage as fotos que saíram do repasse — menos as que também estão em anúncios da loja
// (o lojista pode ter usado as fotos de um anúncio).
export async function apagarFotosSoltas(userId: string, urls: string[]) {
  if (!urls.length) return;
  const admin = criarClienteAdmin();
  const { data: anuncios } = await admin.from("veiculos").select("fotos").eq("usuario_id", userId);
  const { data: outros } = await admin.from("repasses").select("fotos").eq("usuario_id", userId);
  const emUso = new Set([...(anuncios ?? []), ...(outros ?? [])].flatMap(v => (v.fotos as string[] | null) ?? []));
  const marcador = "/object/public/veiculos/";
  const caminhos = urls.filter(u => !emUso.has(u) && u.includes(marcador))
    .map(u => decodeURIComponent(u.split(marcador)[1].split("?")[0]))
    .filter(c => c.startsWith(`${userId}/`))
    .flatMap(c => [c, c.replace(/\.[a-z0-9]+$/i, "-card.jpg")]);
  if (caminhos.length) await admin.storage.from("veiculos").remove(caminhos);
}
