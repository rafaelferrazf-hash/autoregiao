import { criarClienteAdmin, criarClienteAnonimo } from "@/lib/supabase-servidor";

// Chamado 1x por dia pelo Cron da Vercel (ver vercel.json).
// 1. O Supabase no plano gratuito pausa o projeto após ~7 dias sem uso; uma consulta
//    leve por dia conta como atividade e evita a pausa.
// 2. Apaga visualizações/cliques com mais de 12 meses (prazo prometido em /privacidade).
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

  return Response.json({
    ok: true,
    veiculos: count,
    eventos_antigos_apagados: erroLimpeza ? null : apagados ?? 0,
    em: new Date().toISOString(),
  });
}
