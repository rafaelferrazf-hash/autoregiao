import { createHmac, timingSafeEqual } from "node:crypto";
import { criarClienteAdmin } from "@/lib/supabase-servidor";

// Integração com o Mercado Pago (Checkout Pro). Só roda no servidor.
// Credenciais: MP_ACCESS_TOKEN (obrigatória) e MP_WEBHOOK_SECRET (assinatura dos avisos).

const API = "https://api.mercadopago.com";

function token() {
  const t = process.env.MP_ACCESS_TOKEN;
  if (!t) throw new Error("MP_ACCESS_TOKEN não configurado");
  return t;
}

export type NovaPreferencia = {
  pagamentoId: string;
  titulo: string;
  valor: number;
  emailPagador?: string | null;
  urlSite: string;
};

// Cria a cobrança no Mercado Pago e devolve o link do checkout.
export async function criarPreferencia(p: NovaPreferencia) {
  const resp = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": p.pagamentoId,
    },
    body: JSON.stringify({
      items: [{ id: p.pagamentoId, title: p.titulo, quantity: 1, unit_price: p.valor, currency_id: "BRL" }],
      external_reference: p.pagamentoId,
      ...(p.emailPagador ? { payer: { email: p.emailPagador } } : {}),
      back_urls: {
        success: `${p.urlSite}/painel/planos/retorno`,
        pending: `${p.urlSite}/painel/planos/retorno`,
        failure: `${p.urlSite}/painel/planos/retorno`,
      },
      auto_return: "approved",
      notification_url: `${p.urlSite}/api/pagamentos/webhook`,
      statement_descriptor: "AUTOREGIAO",
      // Link do checkout vale por 3 dias (boleto/Pix gerados depois disso seguem o prazo próprio).
      expires: true,
      expiration_date_to: new Date(Date.now() + 3 * 86_400_000).toISOString(),
    }),
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(`Mercado Pago recusou a preferência: ${json.message || resp.status}`);
  return { id: json.id as string, link: (json.init_point || json.sandbox_init_point) as string };
}

type PagamentoMP = {
  id: number;
  status: string;
  external_reference: string | null;
  transaction_amount: number;
  currency_id: string;
  payment_type_id: string;
};

async function buscarPagamento(id: string): Promise<PagamentoMP | null> {
  const resp = await fetch(`${API}/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token()}` },
    cache: "no-store",
  });
  if (!resp.ok) return null;
  return resp.json();
}

// Confere a assinatura do aviso (x-signature) quando MP_WEBHOOK_SECRET estiver configurado.
// Aviso SEM assinatura é aceito: o Mercado Pago manda avisos no formato antigo (IPN) para o
// notification_url da preferência sem x-signature. É seguro porque processarPagamento() nunca
// confia no aviso — sempre consulta o pagamento na API do Mercado Pago e confere valor/referência.
// Aviso COM assinatura inválida é recusado (alguém tentando se passar pelo Mercado Pago).
export function assinaturaValida(request: Request, dataId: string): boolean {
  const segredo = process.env.MP_WEBHOOK_SECRET;
  if (!segredo) return true;
  const assinatura = request.headers.get("x-signature") || "";
  if (!assinatura) return true;
  const requestId = request.headers.get("x-request-id") || "";
  const partes = Object.fromEntries(assinatura.split(",").map(p => p.trim().split("=") as [string, string]));
  if (!partes.ts || !partes.v1) return false;
  const manifesto = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${partes.ts};`;
  const esperado = createHmac("sha256", segredo).update(manifesto).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(esperado), Buffer.from(partes.v1));
  } catch {
    return false;
  }
}

export type ResultadoProcessamento =
  | { ok: true; status: string; aplicado: string | null; pagamentoId: string }
  | { ok: false; motivo: string };

// Consulta o pagamento no Mercado Pago, atualiza o histórico e, se aprovado, ativa o plano.
// Usado pelo webhook e pela página de retorno do checkout (o que chegar primeiro).
export async function processarPagamento(mpPaymentId: string): Promise<ResultadoProcessamento> {
  const pag = await buscarPagamento(mpPaymentId);
  if (!pag) return { ok: false, motivo: "pagamento não encontrado no Mercado Pago" };
  if (!pag.external_reference) return { ok: false, motivo: "pagamento sem referência do AutoRegião" };

  const admin = criarClienteAdmin();
  const { data: registro } = await admin
    .from("pagamentos")
    .select("id, valor, aplicado")
    .eq("id", pag.external_reference)
    .maybeSingle();
  if (!registro) return { ok: false, motivo: "referência desconhecida" };

  // O valor pago tem que bater com o valor cobrado (evita pagamento adulterado).
  if (pag.currency_id !== "BRL" || Math.abs(Number(pag.transaction_amount) - Number(registro.valor)) > 0.01) {
    await admin.from("pagamentos").update({ status: "valor_divergente", mp_payment_id: String(pag.id), atualizado_em: new Date().toISOString() }).eq("id", registro.id);
    return { ok: false, motivo: "valor divergente" };
  }

  await admin
    .from("pagamentos")
    .update({
      status: pag.status,
      mp_payment_id: String(pag.id),
      metodo: pag.payment_type_id,
      atualizado_em: new Date().toISOString(),
      ...(pag.status === "approved" ? { aprovado_em: new Date().toISOString() } : {}),
    })
    .eq("id", registro.id);

  let aplicado: string | null = null;
  if (pag.status === "approved") {
    const { data, error } = await admin.rpc("aplicar_pagamento_aprovado", { p_pagamento: registro.id });
    aplicado = error ? `erro: ${error.message}` : (data as string);
  }
  return { ok: true, status: pag.status, aplicado, pagamentoId: registro.id };
}
