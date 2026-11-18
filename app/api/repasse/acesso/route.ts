import { acessoDoUsuario, usuarioLogado } from "@/lib/repasseServidor";

// A tela do Repasse pergunta aqui se mostra a página, o botão de cadastrar e o link no painel.
export const dynamic = "force-dynamic";

export async function GET() {
  const { acesso } = await acessoDoUsuario(await usuarioLogado());
  return Response.json(acesso);
}
