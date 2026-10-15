import { exigirAdmin } from "@/lib/admin-servidor";

// Aba "Visitas" do /admin: GET ?dias=7|30|90 → números prontos (função painel_visitas, supabase/fase25).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  const dias = Number(new URL(request.url).searchParams.get("dias")) || 30;
  const { data, error } = await r.admin.rpc("painel_visitas", { p_dias: Math.min(Math.max(dias, 1), 90) });
  if (error) return Response.json({ erro: error.message }, { status: 500 });
  return Response.json(data);
}
