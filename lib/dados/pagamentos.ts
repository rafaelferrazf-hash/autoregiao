import { supabase } from "@/lib/supabase";
import type { IdPlanoPago, MesesPeriodo } from "@/lib/planos";

export type PagamentoHistorico = {
  id: string;
  plano: IdPlanoPago;
  meses: number;
  valor: number;
  status: string;
  metodo: string | null;
  criado_em: string;
  aprovado_em: string | null;
};

// Histórico do próprio lojista (RLS: pagamentos_select_dono).
export async function listarMeusPagamentos() {
  const { data } = await supabase
    .from("pagamentos")
    .select("id, plano, meses, valor, status, metodo, criado_em, aprovado_em")
    // "pendente" = abriu o Mercado Pago e voltou sem pagar: não é pagamento, não aparece para o lojista.
    // Se virar pagamento depois, o aviso do Mercado Pago muda a situação e ele passa a aparecer.
    .neq("status", "pendente")
    .order("criado_em", { ascending: false })
    .limit(20);
  return (data ?? []) as PagamentoHistorico[];
}

// Cria o checkout no servidor e devolve o link do Mercado Pago.
export async function iniciarPagamento(plano: IdPlanoPago, meses: MesesPeriodo): Promise<{ link?: string; erro?: string }> {
  try {
    const resp = await fetch("/api/pagamentos/criar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plano, meses }),
    });
    return await resp.json();
  } catch {
    return { erro: "Falha de conexão. Tente de novo." };
  }
}

export async function verificarPagamento(paymentId: string): Promise<{ status?: string; aplicado?: string | null; erro?: string }> {
  try {
    const resp = await fetch("/api/pagamentos/verificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id: paymentId }),
    });
    return await resp.json();
  } catch {
    return { erro: "Falha de conexão." };
  }
}

export function rotuloStatusPagamento(status: string): { texto: string; cor: string } {
  switch (status) {
    case "approved": return { texto: "Aprovado", cor: "#16A34A" };
    case "pending":
    case "in_process":
    case "authorized": return { texto: "Aguardando pagamento", cor: "#92400E" };
    case "pendente": return { texto: "Não concluído", cor: "#7A7670" };
    case "rejected": return { texto: "Recusado", cor: "#DC2626" };
    case "cancelled": return { texto: "Cancelado", cor: "#7A7670" };
    case "refunded":
    case "charged_back": return { texto: "Estornado", cor: "#7A7670" };
    default: return { texto: status, cor: "#7A7670" };
  }
}

export function rotuloMetodo(metodo: string | null): string {
  switch (metodo) {
    case "bank_transfer": return "Pix";
    case "credit_card": return "Cartão de crédito";
    case "debit_card": return "Cartão de débito";
    case "ticket": return "Boleto";
    case "account_money": return "Saldo Mercado Pago";
    default: return metodo ? metodo : "—";
  }
}
