import { criarClienteAdmin, criarClienteServidor } from "@/lib/supabase-servidor";
import { ehAdmin } from "@/lib/admin";

// "Excluir minha conta" (exigência da App Store e da Google Play). O próprio usuário logado pede.
// 1) função excluir_minha_conta() no banco: anúncios, alertas, loja (ou loja anonimizada, se houve pagamento);
// 2) fotos e logo da pasta dele no Storage; 3) o login (auth.users).
export async function POST(request: Request) {
  const sessao = await criarClienteServidor();
  const { data: { user } } = await sessao.auth.getUser();
  if (!user) return Response.json({ erro: "Faça login para excluir sua conta." }, { status: 401 });
  if (ehAdmin(user.email)) return Response.json({ erro: "A conta de administrador não pode ser excluída por aqui." }, { status: 403 });

  let corpo: { confirmacao?: string };
  try { corpo = await request.json(); } catch { return Response.json({ erro: "Pedido inválido." }, { status: 400 }); }
  if (corpo.confirmacao?.trim().toUpperCase() !== "EXCLUIR") {
    return Response.json({ erro: "Digite EXCLUIR para confirmar." }, { status: 400 });
  }

  const { error: erroDados } = await sessao.rpc("excluir_minha_conta");
  if (erroDados) {
    console.error("excluir_minha_conta:", erroDados.message);
    return Response.json({ erro: "Não foi possível excluir sua conta agora. Tente de novo ou escreva para contato@autoregiao.com.br." }, { status: 500 });
  }

  const admin = criarClienteAdmin();
  // Fotos dos anúncios e logo da loja ficam em veiculos/<id do usuário>/...
  try {
    for (let i = 0; i < 20; i++) {
      const { data: arquivos } = await admin.storage.from("veiculos").list(user.id, { limit: 100 });
      const caminhos = (arquivos ?? []).map(a => `${user.id}/${a.name}`);
      if (!caminhos.length) break;
      await admin.storage.from("veiculos").remove(caminhos);
    }
  } catch (e) {
    console.error("excluir conta (fotos):", e);
  }

  const { error: erroLogin } = await admin.auth.admin.deleteUser(user.id);
  if (erroLogin) {
    console.error("excluir conta (login):", erroLogin.message);
    return Response.json({ erro: "Seus anúncios e dados foram apagados, mas o login não pôde ser removido. Escreva para contato@autoregiao.com.br que concluímos." }, { status: 500 });
  }

  await sessao.auth.signOut().catch(() => {});
  return Response.json({ ok: true });
}
