import { criarClienteAdmin, criarClienteAnonimo } from "@/lib/supabase-servidor";
import { reconciliarPendentes } from "@/lib/mercadopago";
import { enviarAlertasDoDia } from "@/lib/alertas";
import { atualizarFipesVencidas } from "@/lib/fipe";

// Chamado 1x por dia pelo Cron da Vercel (ver vercel.json).
// 1. O Supabase no plano gratuito pausa o projeto após ~7 dias sem uso; uma consulta
//    leve por dia conta como atividade e evita a pausa.
// 2. Apaga visualizações/cliques com mais de 12 meses (prazo prometido em /privacidade).
// 3. Confere no Mercado Pago pagamentos ainda pendentes (caso algum aviso tenha falhado).
// 4. Manda os e-mails dos alertas de veículos (anúncios novos do último dia).
// 5. Atualiza o valor da FIPE dos anúncios (a tabela muda todo mês).
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

  let alertas: Awaited<ReturnType<typeof enviarAlertasDoDia>> | null = null;
  if (process.env.RESEND_API_KEY) {
    try { alertas = await enviarAlertasDoDia(); } catch (e) { console.error("alertas:", e); }
  }

  let fipe: Awaited<ReturnType<typeof atualizarFipesVencidas>> | null = null;
  try { fipe = await atualizarFipesVencidas(); } catch (e) { console.error("fipe:", e); }

  return Response.json({
    ok: true,
    alertas,
    fipe,
    veiculos: count,
    pagamentos,
    eventos_antigos_apagados: erroLimpeza ? null : apagados ?? 0,
    em: new Date().toISOString(),
  });
}
