import { cancelarAlertaPush, listarAlertasPush, TOKEN_PUSH } from "@/lib/alertas";

// App de iPhone: lista e cancela os alertas do próprio aparelho. Só quem tem o token do aparelho
// (o próprio app) consegue ver ou mexer nesses alertas.
export async function POST(request: Request) {
  let corpo: { pushToken?: unknown; cancelar?: unknown } = {};
  try { corpo = await request.json(); } catch { /* validação abaixo */ }
  const token = typeof corpo.pushToken === "string" ? corpo.pushToken : "";
  if (!TOKEN_PUSH.test(token)) return Response.json({ ok: false }, { status: 400 });
  if (typeof corpo.cancelar === "string" && /^[0-9a-f-]{36}$/i.test(corpo.cancelar)) await cancelarAlertaPush(token, corpo.cancelar);
  return Response.json({ ok: true, alertas: await listarAlertasPush(token) });
}
