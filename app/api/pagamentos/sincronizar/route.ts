import { criarClienteServidor } from "@/lib/supabase-servidor";
import { reconciliarPendentes } from "@/lib/mercadopago";

// Chamado ao abrir /painel/planos: confere no Mercado Pago os pagamentos pendentes do
// lojista logado e ativa os já aprovados (caso o aviso/webhook tenha atrasado ou falhado).
export async function POST() {
  const sessao = await criarClienteServidor();
  const { data: { user } } = await sessao.auth.getUser();
  if (!user) return Response.json({ erro: "Não autenticado." }, { status: 401 });
  const resultado = await reconciliarPendentes(user.id);
  return Response.json(resultado);
}
