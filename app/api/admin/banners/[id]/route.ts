import { exigirAdmin, UUID } from "@/lib/admin-servidor";
import { lotacaoNoPeriodo, VAGAS_BANNER } from "@/lib/banners";

// Ações do admin num banner:
//  PATCH { acao: "pausar" | "reativar" }
//  PATCH { acao: "datas", inicio, fim }   → renovar/estender (confere as 4 vagas)
//  DELETE → apaga o banner e a foto
const DATA = /^\d{4}-\d{2}-\d{2}$/;
const PREFIXO_FOTO = "/storage/v1/object/public/veiculos/";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ erro: "Banner inválido." }, { status: 400 });
  let corpo: { acao?: string; inicio?: string; fim?: string };
  try { corpo = await request.json(); } catch { return Response.json({ erro: "Pedido inválido." }, { status: 400 }); }

  const { data: banner } = await r.admin.from("banners").select("inicio, fim").eq("id", id).maybeSingle();
  if (!banner) return Response.json({ erro: "Banner não encontrado." }, { status: 404 });

  let mudanca: Record<string, unknown>;
  let inicio = banner.inicio as string, fim = banner.fim as string;
  if (corpo.acao === "pausar") mudanca = { ativo: false };
  else if (corpo.acao === "reativar") mudanca = { ativo: true };
  else if (corpo.acao === "datas") {
    if (!corpo.inicio || !corpo.fim || !DATA.test(corpo.inicio) || !DATA.test(corpo.fim) || corpo.fim < corpo.inicio) {
      return Response.json({ erro: "Confira as datas de início e fim." }, { status: 400 });
    }
    inicio = corpo.inicio; fim = corpo.fim;
    mudanca = { inicio, fim, ativo: true };
  } else return Response.json({ erro: "Ação desconhecida." }, { status: 400 });

  // Ao voltar ao ar ou mudar as datas, as 4 vagas precisam caber.
  if (mudanca.ativo) {
    const { data: outros } = await r.admin.from("banners").select("inicio, fim").eq("ativo", true).neq("id", id).lte("inicio", fim).gte("fim", inicio);
    if (lotacaoNoPeriodo(outros ?? [], inicio, fim) >= VAGAS_BANNER) {
      return Response.json({ erro: `Já há ${VAGAS_BANNER} banners no ar em parte desse período.` }, { status: 400 });
    }
  }
  const { error } = await r.admin.from("banners").update(mudanca).eq("id", id);
  if (error) return Response.json({ erro: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ erro: "Banner inválido." }, { status: 400 });
  const { data: banner } = await r.admin.from("banners").select("imagem_url").eq("id", id).maybeSingle();
  if (!banner) return Response.json({ erro: "Banner não encontrado." }, { status: 404 });
  const { error } = await r.admin.from("banners").delete().eq("id", id);
  if (error) return Response.json({ erro: error.message }, { status: 500 });
  const i = (banner.imagem_url as string).indexOf(PREFIXO_FOTO);
  if (i >= 0) await r.admin.storage.from("veiculos").remove([(banner.imagem_url as string).slice(i + PREFIXO_FOTO.length)]);
  return Response.json({ ok: true });
}
