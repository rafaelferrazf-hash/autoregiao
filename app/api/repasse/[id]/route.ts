import { criarClienteAdmin } from "@/lib/supabase-servidor";
import { UUID } from "@/lib/admin-servidor";
import { acessoDoUsuario, apagarFotosSoltas, contarAtivos, MSG_LIMITE, usuarioLogado, validarRepasse } from "@/lib/repasseServidor";
import { LIMITE_REPASSE_ATIVOS } from "@/lib/repasse";

// Editar, pausar/reativar, marcar como repassado ou excluir um carro do Repasse. Só o dono.
type Ctx = { params: Promise<{ id: string }> };

async function doDono(id: string) {
  const user = await usuarioLogado();
  if (!user) return { erro: Response.json({ erro: "Faça login." }, { status: 401 }) };
  if (!UUID.test(id)) return { erro: Response.json({ erro: "Não encontrado." }, { status: 404 }) };
  const { data: r } = await criarClienteAdmin().from("repasses").select("id, usuario_id, loja_id, status, fotos").eq("id", id).maybeSingle();
  if (!r || r.usuario_id !== user.id) return { erro: Response.json({ erro: "Não encontrado." }, { status: 404 }) };
  return { user, r };
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const d = await doDono(id);
  if ("erro" in d) return d.erro;
  const { user, r } = d;
  let corpo: Record<string, unknown>;
  try { corpo = await request.json(); } catch { return Response.json({ erro: "Pedido inválido." }, { status: 400 }); }
  const admin = criarClienteAdmin();
  const agora = new Date().toISOString();

  // Só mudar a situação (botões da lista).
  if (typeof corpo.status === "string" && Object.keys(corpo).length === 1) {
    const status = corpo.status;
    if (!["ativo", "pausado", "repassado"].includes(status)) return Response.json({ erro: "Situação inválida." }, { status: 400 });
    if (r.status === "repassado") return Response.json({ erro: "Este carro já foi marcado como repassado." }, { status: 400 });
    if (status === "ativo") {
      const { acesso } = await acessoDoUsuario(user);
      if (!acesso.podePublicar) return Response.json({ erro: "Sua loja não tem acesso ao Repasse." }, { status: 403 });
      if (await contarAtivos(r.loja_id, r.id) >= LIMITE_REPASSE_ATIVOS) return Response.json({ erro: MSG_LIMITE }, { status: 400 });
    }
    const { error } = await admin.from("repasses")
      .update({ status, atualizado_em: agora, ...(status === "repassado" ? { repassado_em: agora } : {}) }).eq("id", r.id);
    if (error) return Response.json({ erro: "Não foi possível salvar." }, { status: 500 });
    return Response.json({ ok: true });
  }

  // Edição completa.
  const { acesso } = await acessoDoUsuario(user);
  if (!acesso.podePublicar) return Response.json({ erro: "Sua loja não tem acesso ao Repasse." }, { status: 403 });
  const v = await validarRepasse(corpo, user);
  if ("erro" in v) return Response.json({ erro: v.erro }, { status: 400 });
  const { error } = await admin.from("repasses").update({ ...v.dados, atualizado_em: agora }).eq("id", r.id);
  if (error) {
    console.error("repasse editar:", error.message);
    return Response.json({ erro: "Não foi possível salvar. Tente de novo." }, { status: 500 });
  }
  const novas = v.dados.fotos as string[];
  await apagarFotosSoltas(user.id, ((r.fotos as string[]) ?? []).filter(f => !novas.includes(f))).catch(() => {});
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const d = await doDono(id);
  if ("erro" in d) return d.erro;
  const { error } = await criarClienteAdmin().from("repasses").delete().eq("id", d.r.id);
  if (error) return Response.json({ erro: "Não foi possível excluir." }, { status: 500 });
  await apagarFotosSoltas(d.user.id, (d.r.fotos as string[]) ?? []).catch(() => {});
  return Response.json({ ok: true });
}
