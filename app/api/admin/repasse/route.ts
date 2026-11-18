import { exigirAdmin } from "@/lib/admin-servidor";

// Admin: liga/desliga o Repasse para os lojistas (site_config.repasse_liberado) e mostra os números.
export const dynamic = "force-dynamic";

export async function GET() {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  const [{ data: cfg }, { data: carros }] = await Promise.all([
    r.admin.from("site_config").select("valor").eq("chave", "repasse_liberado").maybeSingle(),
    r.admin.from("repasses").select("loja_id, status"),
  ]);
  const ativos = (carros ?? []).filter(c => c.status === "ativo");
  return Response.json({
    liberado: cfg?.valor === true,
    ativos: ativos.length,
    repassados: (carros ?? []).filter(c => c.status === "repassado").length,
    lojas: new Set(ativos.map(c => c.loja_id)).size,
  });
}

export async function POST(request: Request) {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  const { liberado } = await request.json().catch(() => ({}));
  if (typeof liberado !== "boolean") return Response.json({ erro: "Pedido inválido." }, { status: 400 });
  const { error } = await r.admin.from("site_config")
    .upsert({ chave: "repasse_liberado", valor: liberado, atualizado_em: new Date().toISOString() });
  if (error) return Response.json({ erro: error.message }, { status: 500 });
  return Response.json({ ok: true, liberado });
}
