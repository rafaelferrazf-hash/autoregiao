import { criarAlerta, criarAlertaPush, EMAIL_VALIDO, normalizarFiltros, TOKEN_PUSH } from "@/lib/alertas";

// "Criar alerta" da busca: salva a busca + e-mail e manda o e-mail de confirmação.
// No app de iPhone pode vir pushToken no lugar do e-mail (aviso por notificação no aparelho).
export async function POST(request: Request) {
  let corpo: { email?: unknown; busca?: unknown; pushToken?: unknown } = {};
  try { corpo = await request.json(); } catch { /* corpo inválido cai na validação abaixo */ }
  const busca = typeof corpo.busca === "string" ? corpo.busca.slice(0, 1000) : "";

  if (typeof corpo.pushToken === "string") {
    if (!TOKEN_PUSH.test(corpo.pushToken)) return Response.json({ ok: false, erro: "Não foi possível ativar os avisos neste celular." }, { status: 400 });
    const r = await criarAlertaPush(corpo.pushToken, normalizarFiltros(busca));
    return Response.json(r, { status: r.ok ? 200 : 400 });
  }

  const email = typeof corpo.email === "string" ? corpo.email.trim() : "";
  if (!EMAIL_VALIDO.test(email) || email.length > 200) {
    return Response.json({ ok: false, erro: "Digite um e-mail válido." }, { status: 400 });
  }

  const resultado = await criarAlerta(email, normalizarFiltros(busca));
  return Response.json(resultado, { status: resultado.ok ? 200 : 400 });
}
