import { supabase } from "@/lib/supabase";

// Chamado 1x por dia pelo Cron da Vercel (ver vercel.json).
// O Supabase no plano gratuito pausa o projeto após ~7 dias sem uso; uma consulta
// leve por dia conta como atividade e evita a pausa.
export const dynamic = "force-dynamic";

export async function GET() {
  const { count, error } = await supabase
    .from("veiculos")
    .select("id", { count: "exact", head: true });

  if (error) {
    return Response.json({ ok: false, erro: error.message }, { status: 500 });
  }
  return Response.json({ ok: true, veiculos: count, em: new Date().toISOString() });
}
