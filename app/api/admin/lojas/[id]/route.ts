import { exigirAdmin, UUID } from "@/lib/admin-servidor";
import { ehVitalicio } from "@/lib/planos";

// Ações do admin sobre uma loja:
//  { acao: "estender", dias: 30 }  → soma dias ao vencimento (a partir de hoje, se já venceu)
//  { acao: "desativar" }           → loja e anúncios somem do site (policy veiculos_select_public)
//  { acao: "reativar" }
// Loja vitalícia (conta do dono) não aceita nenhuma ação.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ erro: "Loja inválida." }, { status: 400 });

  let corpo: { acao?: string; dias?: number };
  try { corpo = await request.json(); } catch { return Response.json({ erro: "Pedido inválido." }, { status: 400 }); }

  const { data: loja } = await r.admin.from("lojas").select("id, plano, expira_em, ativo").eq("id", id).maybeSingle();
  if (!loja) return Response.json({ erro: "Loja não encontrada." }, { status: 404 });
  if (ehVitalicio(loja.plano)) return Response.json({ erro: "A loja vitalícia do dono não pode ser alterada por aqui." }, { status: 400 });

  let mudanca: Record<string, unknown>;
  if (corpo.acao === "estender") {
    const dias = Number(corpo.dias);
    if (!Number.isInteger(dias) || dias < 1 || dias > 365) return Response.json({ erro: "Informe de 1 a 365 dias." }, { status: 400 });
    const base = Math.max(loja.expira_em ? new Date(loja.expira_em).getTime() : 0, Date.now());
    mudanca = { expira_em: new Date(base + dias * 86_400_000).toISOString() };
  } else if (corpo.acao === "desativar") {
    mudanca = { ativo: false };
  } else if (corpo.acao === "reativar") {
    mudanca = { ativo: true };
  } else {
    return Response.json({ erro: "Ação desconhecida." }, { status: 400 });
  }

  const { data, error } = await r.admin.from("lojas").update(mudanca).eq("id", id).select("id, ativo, expira_em").single();
  if (error) return Response.json({ erro: error.message }, { status: 500 });
  return Response.json({ ok: true, loja: data });
}
