import { contextoDivulgar } from "./comum";

// Situação da página "Divulgar" para o painel: se a loja tem a ferramenta e quantos posts com frase já usou na semana.
export async function GET() {
  const ctx = await contextoDivulgar();
  if ("erro" in ctx) return Response.json({ erro: ctx.erro }, { status: ctx.status });
  return Response.json({
    liberado: ctx.acesso.liberado,
    limiteFrases: ctx.acesso.limiteFrases,
    usados: ctx.usados,
    lojaId: ctx.loja.id,
  });
}
