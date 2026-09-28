import { criarClienteServidor } from "@/lib/supabase-servidor";
import { processarPagamento } from "@/lib/mercadopago";

// Chamado pela página de retorno do checkout: não depende do aviso (webhook) chegar primeiro.
// Só o dono do pagamento pode pedir a conferência.
export async function POST(request: Request) {
  const sessao = await criarClienteServidor();
  const { data: { user } } = await sessao.auth.getUser();
  if (!user) return Response.json({ erro: "Não autenticado." }, { status: 401 });

  let corpo: { payment_id?: string };
  try { corpo = await request.json(); } catch { return Response.json({ erro: "Pedido inválido." }, { status: 400 }); }
  const id = String(corpo.payment_id ?? "");
  if (!/^\d+$/.test(id)) return Response.json({ erro: "Pagamento inválido." }, { status: 400 });

  const resultado = await processarPagamento(id);
  if (!resultado.ok) return Response.json({ status: "desconhecido", erro: resultado.motivo }, { status: 404 });

  // Confere que o pagamento é deste usuário (RLS: só enxerga os próprios).
  const { data: meu } = await sessao.from("pagamentos").select("id").eq("id", resultado.pagamentoId).maybeSingle();
  if (!meu) return Response.json({ erro: "Pagamento de outra conta." }, { status: 403 });

  return Response.json({ status: resultado.status, aplicado: resultado.aplicado });
}
