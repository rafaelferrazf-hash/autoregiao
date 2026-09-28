import { assinaturaValida, processarPagamento } from "@/lib/mercadopago";

// Aviso do Mercado Pago quando um pagamento muda de status.
// Configurar no painel do Mercado Pago: Webhooks → URL https://www.autoregiao.com.br/api/pagamentos/webhook
// evento "Pagamentos". O status real é sempre confirmado na API do Mercado Pago.
export async function POST(request: Request) {
  const url = new URL(request.url);
  let corpo: { type?: string; action?: string; data?: { id?: string | number } } = {};
  try { corpo = await request.json(); } catch { /* avisos antigos (IPN) vêm só na URL */ }

  const tipo = corpo.type || url.searchParams.get("type") || url.searchParams.get("topic");
  const id = String(corpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");

  // Só interessam avisos de pagamento; o resto recebe 200 para o Mercado Pago não reenviar.
  if (tipo !== "payment" || !/^\d+$/.test(id)) return Response.json({ ok: true, ignorado: true });

  if (!assinaturaValida(request, id)) return Response.json({ ok: false }, { status: 401 });

  const resultado = await processarPagamento(id);
  if (!resultado.ok) console.warn("webhook MP:", id, resultado.motivo);
  // 200 mesmo em pagamento desconhecido: reenviar não resolveria.
  return Response.json({ ok: true });
}
