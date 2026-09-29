import { criarClienteAdmin, criarClienteAnonimo } from "@/lib/supabase-servidor";
import { reconciliarPendentes } from "@/lib/mercadopago";

// Chamado 1x por dia pelo Cron da Vercel (ver vercel.json).
// 1. O Supabase no plano gratuito pausa o projeto após ~7 dias sem uso; uma consulta
//    leve por dia conta como atividade e evita a pausa.
// 2. Apaga visualizações/cliques com mais de 12 meses (prazo prometido em /privacidade).
// 3. Confere no Mercado Pago pagamentos ainda pendentes (caso algum aviso tenha falhado).
export const dynamic = "force-dynamic";

const RETENCAO_EVENTOS_DIAS = 365;

export async function GET() {
  const { count, error } = await criarClienteAnonimo()
    .from("veiculos")
    .select("id", { count: "exact", head: true });

  if (error) {
    return Response.json({ ok: false, erro: error.message }, { status: 500 });
  }

  const limite = new Date(Date.now() - RETENCAO_EVENTOS_DIAS * 86_400_000).toISOString();
  const { count: apagados, error: erroLimpeza } = await criarClienteAdmin()
    .from("eventos_veiculo")
    .delete({ count: "exact" })
    .lt("criado_em", limite);

  let pagamentos: { conferidos: number; processados: number } | null = null;
  if (process.env.MP_ACCESS_TOKEN) {
    try { pagamentos = await reconciliarPendentes(); } catch (e) { console.error("reconciliar pagamentos:", e); }
  }

  return Response.json({
    ok: true,
    veiculos: count,
    pagamentos,
    eventos_antigos_apagados: erroLimpeza ? null : apagados ?? 0,
    em: new Date().toISOString(),
  });
}
