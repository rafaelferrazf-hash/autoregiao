import { cancelarAlerta } from "@/lib/alertas";

// Usado pela página /alerta e pelo botão "cancelar inscrição" do Gmail/Outlook (RFC 8058),
// que manda POST com o token na URL.
export async function POST(request: Request) {
  const url = new URL(request.url);
  let token = url.searchParams.get("token") ?? "";
  let todos = url.searchParams.get("todos") === "1";
  if (!token) {
    const corpo = await request.json().catch(() => ({}));
    token = typeof corpo.token === "string" ? corpo.token : "";
    todos = corpo.todos === true;
  }
  const resultado = await cancelarAlerta(token, todos);
  return Response.json(resultado, { status: resultado.ok ? 200 : 404 });
}
