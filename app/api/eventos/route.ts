import { createHash } from "node:crypto";
import { criarClienteAdmin, criarClienteServidor } from "@/lib/supabase-servidor";

// Registra visualização de anúncio e cliques em WhatsApp/Ligar (tabela eventos_veiculo).
// Filtros para o número ser confiável:
//  - robôs (Google etc.) não contam;
//  - o dono do anúncio vendo o próprio anúncio não conta;
//  - o mesmo visitante repetindo a mesma ação no mesmo anúncio em 30 min conta só 1 vez.
// O visitante é um hash anônimo de IP + navegador — não guardamos o IP.

const TIPOS = new Set(["visualizacao", "whatsapp", "ligacao"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROBO = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse/i;
const JANELA_MINUTOS = 30;

export async function POST(request: Request) {
  let corpo: { veiculo_id?: string; tipo?: string };
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const { veiculo_id, tipo } = corpo;
  if (!veiculo_id || !UUID.test(veiculo_id) || !tipo || !TIPOS.has(tipo)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const navegador = request.headers.get("user-agent") || "";
  if (!navegador || ROBO.test(navegador)) return Response.json({ ok: true, contado: false });

  const admin = criarClienteAdmin();

  const { data: veiculo } = await admin
    .from("veiculos")
    .select("id, usuario_id, ativo")
    .eq("id", veiculo_id)
    .maybeSingle();
  if (!veiculo || veiculo.ativo === false) return Response.json({ ok: false }, { status: 404 });

  // Dono vendo o próprio anúncio não conta.
  const sessao = await criarClienteServidor();
  const { data: { user } } = await sessao.auth.getUser();
  if (user && user.id === veiculo.usuario_id) return Response.json({ ok: true, contado: false });

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "sem-ip";
  const visitante = createHash("sha256").update(`${ip}|${navegador}`).digest("hex").slice(0, 32);

  const desde = new Date(Date.now() - JANELA_MINUTOS * 60_000).toISOString();
  const { count } = await admin
    .from("eventos_veiculo")
    .select("id", { count: "exact", head: true })
    .eq("visitante", visitante)
    .eq("veiculo_id", veiculo_id)
    .eq("tipo", tipo)
    .gte("criado_em", desde);
  if ((count ?? 0) > 0) return Response.json({ ok: true, contado: false });

  const { error } = await admin.from("eventos_veiculo").insert({ veiculo_id, tipo, visitante });
  if (error) return Response.json({ ok: false }, { status: 500 });
  return Response.json({ ok: true, contado: true });
}
