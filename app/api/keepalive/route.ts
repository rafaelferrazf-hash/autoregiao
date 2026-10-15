import { criarClienteAdmin, criarClienteAnonimo } from "@/lib/supabase-servidor";
import { reconciliarPendentes } from "@/lib/mercadopago";
import { enviarAlertasDoDia } from "@/lib/alertas";
import { atualizarFipesVencidas } from "@/lib/fipe";
import { diaDoMesBrasilia, mesAnterior, prepararRelatorios } from "@/lib/relatorioMensal";
import { avisarBannersVencendo } from "@/lib/avisosBanners";

// Chamado 1x por dia pelo Cron da Vercel (ver vercel.json).
// 1. O Supabase no plano gratuito pausa o projeto após ~7 dias sem uso; uma consulta
//    leve por dia conta como atividade e evita a pausa.
// 2. Apaga visualizações/cliques com mais de 12 meses (prazo prometido em /privacidade).
// 3. Confere no Mercado Pago pagamentos ainda pendentes (caso algum aviso tenha falhado).
// 4. Manda os e-mails dos alertas de veículos (anúncios novos do último dia).
// 5. Atualiza o valor da FIPE dos anúncios (a tabela muda todo mês).
// 6. Dia 1º: relatório do mês anterior de cada loja, por e-mail (o WhatsApp é pelo /admin).
// 7. Banners pagos que vencem em 3 dias: e-mail para o admin oferecer a renovação.
// 8. Anúncios de pessoa física vencidos (60 dias grátis / avulso) saem do ar (supabase/fase24).
// 9. Visitas com mais de 90 dias: guarda os totais do dia e apaga o detalhe (supabase/fase25).
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

  // Plano menor pago antes da hora começa quando o anterior termina (supabase/fase15).
  const { data: planosVirados, error: erroPlanos } = await criarClienteAdmin().rpc("virar_planos_agendados");
  if (erroPlanos) console.error("planos agendados:", erroPlanos.message);

  let alertas: Awaited<ReturnType<typeof enviarAlertasDoDia>> | null = null;
  if (process.env.RESEND_API_KEY) {
    try { alertas = await enviarAlertasDoDia(); } catch (e) { console.error("alertas:", e); }
  }

  let fipe: Awaited<ReturnType<typeof atualizarFipesVencidas>> | null = null;
  try { fipe = await atualizarFipesVencidas(); } catch (e) { console.error("fipe:", e); }

  let relatorios: Awaited<ReturnType<typeof prepararRelatorios>> | null = null;
  if (diaDoMesBrasilia() === 1 && process.env.RESEND_API_KEY) {
    try { relatorios = await prepararRelatorios(mesAnterior(), true); } catch (e) { console.error("relatórios:", e); }
  }

  const { count: particularesVencidos } = await criarClienteAdmin().from("veiculos")
    .update({ ativo: false, status: "pausado" }, { count: "exact" })
    .is("loja_id", null).eq("ativo", true).lt("expira_em", new Date().toISOString());

  const { data: visitasApagadas, error: erroVisitas } = await criarClienteAdmin().rpc("limpar_visitas");
  if (erroVisitas) console.error("visitas:", erroVisitas.message);

  let bannersVencendo: number | null = null;
  if (process.env.RESEND_API_KEY) {
    try { bannersVencendo = await avisarBannersVencendo(); } catch (e) { console.error("banners:", e); }
  }

  return Response.json({
    ok: true,
    relatorios,
    banners_vencendo: bannersVencendo,
    particulares_vencidos: particularesVencidos ?? 0,
    visitas_antigas_apagadas: erroVisitas ? null : visitasApagadas,
    alertas,
    fipe,
    veiculos: count,
    pagamentos,
    planos_agendados_iniciados: erroPlanos ? null : planosVirados,
    eventos_antigos_apagados: erroLimpeza ? null : apagados ?? 0,
    em: new Date().toISOString(),
  });
}
