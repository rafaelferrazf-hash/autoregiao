import { criarClienteAdmin } from "@/lib/supabase-servidor";
import { UUID } from "@/lib/admin-servidor";
import { acessoDoUsuario, contarAtivos, MSG_LIMITE, usuarioLogado, validarRepasse } from "@/lib/repasseServidor";
import { LIMITE_REPASSE_ATIVOS } from "@/lib/repasse";

// Cadastrar um carro no Repasse (supabase/fase34). Só loja com acesso; até LIMITE_REPASSE_ATIVOS no ar.
export async function POST(request: Request) {
  const user = await usuarioLogado();
  if (!user) return Response.json({ erro: "Faça login." }, { status: 401 });
  const { acesso, loja } = await acessoDoUsuario(user);
  if (!acesso.podePublicar || !loja) return Response.json({ erro: "Sua loja não tem acesso ao Repasse." }, { status: 403 });

  let corpo: Record<string, unknown>;
  try { corpo = await request.json(); } catch { return Response.json({ erro: "Pedido inválido." }, { status: 400 }); }

  const v = await validarRepasse(corpo, user);
  if ("erro" in v) return Response.json({ erro: v.erro }, { status: 400 });
  if (await contarAtivos(loja.id) >= LIMITE_REPASSE_ATIVOS) return Response.json({ erro: MSG_LIMITE }, { status: 400 });

  // Veio de um anúncio da própria loja? Guarda o vínculo (só se o anúncio for dela).
  let veiculo_id: string | null = null;
  if (typeof corpo.veiculo_id === "string" && UUID.test(corpo.veiculo_id)) {
    const { data: vei } = await criarClienteAdmin().from("veiculos").select("id").eq("id", corpo.veiculo_id).eq("usuario_id", user.id).maybeSingle();
    veiculo_id = vei?.id ?? null;
  }

  const { data, error } = await criarClienteAdmin().from("repasses")
    .insert({ ...v.dados, cidade: v.dados.cidade ?? loja.cidade, loja_id: loja.id, usuario_id: user.id, veiculo_id })
    .select("id").single();
  if (error) {
    console.error("repasse criar:", error.message);
    return Response.json({ erro: "Não foi possível salvar. Tente de novo." }, { status: 500 });
  }
  return Response.json({ ok: true, id: data.id });
}
