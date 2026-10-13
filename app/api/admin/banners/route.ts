import { exigirAdmin } from "@/lib/admin-servidor";
import { lotacaoNoPeriodo, normalizarLinkBanner, VAGAS_BANNER } from "@/lib/banners";

// Aba "Banners" do /admin (supabase/fase22-banners.sql).
//  GET  → todos os banners (mais recentes primeiro)
//  POST (FormData) → cria um banner: campos de texto + "imagem" (já reduzida no navegador)
export const dynamic = "force-dynamic";
const DATA = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  const { data, error } = await r.admin.from("banners").select("*").order("fim", { ascending: false });
  if (error) return Response.json({ erro: error.message }, { status: 500 });
  return Response.json({ banners: data ?? [], vagas: VAGAS_BANNER });
}

export async function POST(request: Request) {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  let form: FormData;
  try { form = await request.formData(); } catch { return Response.json({ erro: "Pedido inválido." }, { status: 400 }); }
  const campo = (n: string, max: number) => String(form.get(n) ?? "").trim().slice(0, max);

  const anunciante = campo("anunciante", 80), titulo = campo("titulo", 70), destaque = campo("destaque", 40);
  const texto = campo("texto", 140), botao = campo("botao", 24) || "Saiba mais", telefone = campo("telefone", 20);
  const inicio = campo("inicio", 10), fim = campo("fim", 10);
  const valor = Number(String(form.get("valor") ?? "").replace(/\./g, "").replace(",", ".")) || null;
  const link = normalizarLinkBanner(campo("link", 300));
  const imagem = form.get("imagem");

  if (!anunciante || !titulo) return Response.json({ erro: "Preencha o anunciante e a frase principal." }, { status: 400 });
  if (destaque && !titulo.includes(destaque)) return Response.json({ erro: "A parte em laranja precisa estar escrita igual dentro da frase principal." }, { status: 400 });
  if (!link) return Response.json({ erro: "Link inválido. Use o WhatsApp (com DDD), uma página do site (/loja/...) ou um endereço https://." }, { status: 400 });
  if (!DATA.test(inicio) || !DATA.test(fim) || fim < inicio) return Response.json({ erro: "Confira as datas de início e fim." }, { status: 400 });
  if (!(imagem instanceof Blob) || imagem.size === 0) return Response.json({ erro: "Escolha a foto do banner." }, { status: 400 });
  if (imagem.size > 3_000_000 || !/^image\/(jpeg|png|webp)$/.test(imagem.type)) return Response.json({ erro: "A foto precisa ser JPG, PNG ou WEBP de até 3 MB." }, { status: 400 });

  // 4 vagas: conta os banners ativos que se cruzam com o período.
  const { data: outros } = await r.admin.from("banners").select("inicio, fim").eq("ativo", true).lte("inicio", fim).gte("fim", inicio);
  if (lotacaoNoPeriodo(outros ?? [], inicio, fim) >= VAGAS_BANNER) {
    return Response.json({ erro: `Já há ${VAGAS_BANNER} banners no ar em parte desse período. Escolha outras datas ou pause um banner.` }, { status: 400 });
  }

  const extensao = imagem.type === "image/png" ? "png" : imagem.type === "image/webp" ? "webp" : "jpg";
  const caminho = `banners/${crypto.randomUUID()}.${extensao}`;
  const envio = await r.admin.storage.from("veiculos").upload(caminho, imagem, { contentType: imagem.type });
  if (envio.error) return Response.json({ erro: `Erro ao enviar a foto: ${envio.error.message}` }, { status: 500 });
  const imagem_url = r.admin.storage.from("veiculos").getPublicUrl(caminho).data.publicUrl;

  const { data, error } = await r.admin.from("banners").insert({
    anunciante, telefone: telefone || null, titulo, destaque: destaque || null, texto: texto || null,
    botao, link, imagem_url, inicio, fim, valor,
  }).select("*").single();
  if (error) {
    await r.admin.storage.from("veiculos").remove([caminho]);
    return Response.json({ erro: error.message }, { status: 500 });
  }
  return Response.json({ ok: true, banner: data });
}
