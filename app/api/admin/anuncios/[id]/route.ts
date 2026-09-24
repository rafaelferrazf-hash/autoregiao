import { exigirAdmin, UUID } from "@/lib/admin-servidor";

// Moderação de anúncios pelo admin.
//  PATCH { acao: "pausar" | "reativar" }
//  DELETE → remove o anúncio e as fotos dele do Storage
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ erro: "Anúncio inválido." }, { status: 400 });

  let corpo: { acao?: string };
  try { corpo = await request.json(); } catch { return Response.json({ erro: "Pedido inválido." }, { status: 400 }); }
  if (corpo.acao !== "pausar" && corpo.acao !== "reativar") return Response.json({ erro: "Ação desconhecida." }, { status: 400 });

  const ativo = corpo.acao === "reativar";
  const { data, error } = await r.admin
    .from("veiculos")
    .update({ ativo, status: ativo ? "ativo" : "pausado" })
    .eq("id", id)
    .select("id, ativo")
    .maybeSingle();
  if (error) return Response.json({ erro: error.message }, { status: 500 });
  if (!data) return Response.json({ erro: "Anúncio não encontrado." }, { status: 404 });
  return Response.json({ ok: true, anuncio: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ erro: "Anúncio inválido." }, { status: 400 });

  const { data, error } = await r.admin.from("veiculos").delete().eq("id", id).select("id, fotos");
  if (error) return Response.json({ erro: error.message }, { status: 500 });
  if (!data?.length) return Response.json({ erro: "Anúncio não encontrado." }, { status: 404 });

  const marcador = "/object/public/veiculos/";
  const caminhos = ((data[0].fotos as string[] | null) ?? [])
    .map(url => (url.includes(marcador) ? decodeURIComponent(url.split(marcador)[1].split("?")[0]) : null))
    .filter((c): c is string => !!c);
  if (caminhos.length) await r.admin.storage.from("veiculos").remove(caminhos);
  return Response.json({ ok: true });
}
