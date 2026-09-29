import { criarAlerta, EMAIL_VALIDO, normalizarFiltros } from "@/lib/alertas";

// "Criar alerta" da busca: salva a busca + e-mail e manda o e-mail de confirmação.
export async function POST(request: Request) {
  let corpo: { email?: unknown; busca?: unknown } = {};
  try { corpo = await request.json(); } catch { /* corpo inválido cai na validação abaixo */ }

  const email = typeof corpo.email === "string" ? corpo.email.trim() : "";
  if (!EMAIL_VALIDO.test(email) || email.length > 200) {
    return Response.json({ ok: false, erro: "Digite um e-mail válido." }, { status: 400 });
  }
  const busca = typeof corpo.busca === "string" ? corpo.busca.slice(0, 1000) : "";

  const resultado = await criarAlerta(email, normalizarFiltros(busca));
  return Response.json(resultado, { status: resultado.ok ? 200 : 400 });
}
