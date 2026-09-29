import { confirmarAlerta } from "@/lib/alertas";

export async function POST(request: Request) {
  const { token } = await request.json().catch(() => ({}));
  const resultado = await confirmarAlerta(typeof token === "string" ? token : "");
  return Response.json(resultado, { status: resultado.ok ? 200 : 404 });
}
