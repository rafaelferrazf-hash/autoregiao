import { exigirAdmin } from "@/lib/admin-servidor";
import { lotacaoNoPeriodo, normalizarLinkBanner, VAGAS_FLUTUANTE } from "@/lib/banners";

// Aba "Banners" do /admin → "Anúncio flutuante" (supabase/fase28-anuncio-flutuante.sql).
//  GET  → todos (mais recentes primeiro)
//  POST (FormData) → cria: campos de texto + "logo" (já reduzida no navegador)
export const dynamic = "force-dynamic";
const DATA = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  const { data, error } = await r.admin.from("anuncios_flutuantes").select("*").order("fim", { ascending: false });
  if (error) return Response.json({ erro: error.message }, { status: 500 });
  return Response.json({ flutuantes: data ?? [], vagas: VAGAS_FLUTUANTE });
}

export async function POST(request: Request) {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  let form: FormData;
  try { form = await request.formData(); } catch { return Response.json({ erro: "Pedido inválido." }, { status: 400 }); }
  const campo = (n: string, max: number) => String(form.get(n) ?? "").trim().slice(0, max);

  const anunciante = campo("anunciante", 60), titulo = campo("titulo", 60), selo = campo("selo", 8);
  const texto = campo("texto", 50), botao = campo("botao", 24) || "Chamar no WhatsApp", telefone = campo("telefone", 20);
  const inicio = campo("inicio", 10), fim = campo("fim", 10);
  const valor = Number(String(form.get("valor") ?? "").replace(/\./g, "").replace(",", ".")) || null;
  const link = normalizarLinkBanner(campo("link", 300));
  const logo = form.get("logo");

  if (!anunciante || !titulo) return Response.json({ erro: "Preencha o anunciante e a frase principal." }, { status: 400 });
  if (!link) return Response.json({ erro: "Link inválido. Use o WhatsApp (com DDD), uma página do site (/loja/...) ou um endereço https://." }, { status: 400 });
  if (!DATA.test(inicio) || !DATA.test(fim) || fim < inicio) return Response.json({ erro: "Confira as datas de início e fim." }, { status: 400 });
  if (!(logo instanceof Blob) || logo.size === 0) return Response.json({ erro: "Escolha a logo do anunciante." }, { status: 400 });
  if (logo.size > 2_000_000 || !/^image\/(jpeg|png|webp)$/.test(logo.type)) return Response.json({ erro: "A logo precisa ser JPG, PNG ou WEBP de até 2 MB." }, { status: 400 });

  const { data: outros } = await r.admin.from("anuncios_flutuantes").select("inicio, fim").eq("ativo", true).lte("inicio", fim).gte("fim", inicio);
  if (lotacaoNoPeriodo(outros ?? [], inicio, fim) >= VAGAS_FLUTUANTE) {
    return Response.json({ erro: `Já há ${VAGAS_FLUTUANTE} anúncios flutuantes no ar em parte desse período. Escolha outras datas ou pause um.` }, { status: 400 });
  }

  const extensao = logo.type === "image/png" ? "png" : logo.type === "image/webp" ? "webp" : "jpg";
  const caminho = `flutuantes/${crypto.randomUUID()}.${extensao}`;
  const envio = await r.admin.storage.from("veiculos").upload(caminho, logo, { contentType: logo.type });
  if (envio.error) return Response.json({ erro: `Erro ao enviar a logo: ${envio.error.message}` }, { status: 500 });
  const logo_url = r.admin.storage.from("veiculos").getPublicUrl(caminho).data.publicUrl;

  const { data, error } = await r.admin.from("anuncios_flutuantes").insert({
    anunciante, telefone: telefone || null, selo: selo || null, titulo, texto: texto || null,
    botao, link, logo_url, inicio, fim, valor,
  }).select("*").single();
  if (error) {
    await r.admin.storage.from("veiculos").remove([caminho]);
    return Response.json({ erro: error.message }, { status: 500 });
  }
  return Response.json({ ok: true, flutuante: data });
}
