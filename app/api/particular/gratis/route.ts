import { criarClienteAdmin, criarClienteServidor } from "@/lib/supabase-servidor";
import { cpfValido, embaralhar, soDigitos, telefoneValido } from "@/lib/cpf";
import { enviarEmail, escaparHtml, modeloEmail } from "@/lib/email";

// Pessoa física pede o anúncio grátis (60 dias): 1 por CPF e por WhatsApp (supabase/fase24).
// Se o CPF ou o número já foram usados por OUTRA conta, avisa o admin (possível revenda se passando por particular).
export async function POST(request: Request) {
  const sessao = await criarClienteServidor();
  const { data: { user } } = await sessao.auth.getUser();
  if (!user) return Response.json({ erro: "Faça login para anunciar." }, { status: 401 });

  let corpo: { cpf?: string; telefone?: string };
  try { corpo = await request.json(); } catch { return Response.json({ erro: "Pedido inválido." }, { status: 400 }); }
  const cpf = soDigitos(corpo.cpf ?? "");
  const tel = telefoneValido(corpo.telefone ?? "");
  if (!cpfValido(cpf)) return Response.json({ erro: "CPF inválido. Confira os números." }, { status: 400 });
  if (!tel) return Response.json({ erro: "WhatsApp inválido. Informe com DDD, ex.: (73) 99999-8888." }, { status: 400 });

  const admin = criarClienteAdmin();
  const { data: loja } = await admin.from("lojas").select("id").eq("usuario_id", user.id).maybeSingle();
  if (loja) return Response.json({ erro: "Sua conta é de loja: os anúncios são pelo plano da loja." }, { status: 400 });

  const cpfHash = embaralhar("cpf", cpf), telHash = embaralhar("tel", tel);
  const { data: usados } = await admin.from("liberacoes_particular").select("usuario_id, cpf_hash, tel_hash")
    .eq("tipo", "gratis").or(`cpf_hash.eq.${cpfHash},tel_hash.eq.${telHash}`);
  if (usados && usados.length) {
    const outraConta = usados.some(u => u.usuario_id !== user.id);
    if (outraConta) await avisarAdmin(user.email ?? "—", usados.some(u => u.cpf_hash === cpfHash), usados.some(u => u.tel_hash === telHash));
    return Response.json({ erro: "ja_usado", mensagem: "Este CPF ou WhatsApp já usou o anúncio grátis." }, { status: 409 });
  }
  // Também 1 grátis por conta.
  const { count } = await admin.from("liberacoes_particular").select("id", { count: "exact", head: true }).eq("usuario_id", user.id).eq("tipo", "gratis");
  if (count) return Response.json({ erro: "ja_usado", mensagem: "Sua conta já usou o anúncio grátis." }, { status: 409 });

  const { error } = await admin.from("liberacoes_particular").insert({ usuario_id: user.id, tipo: "gratis", dias: 60, cpf_hash: cpfHash, tel_hash: telHash });
  if (error) {
    if (error.code === "23505") return Response.json({ erro: "ja_usado", mensagem: "Este CPF ou WhatsApp já usou o anúncio grátis." }, { status: 409 });
    return Response.json({ erro: "Não foi possível liberar agora. Tente de novo." }, { status: 500 });
  }
  return Response.json({ ok: true, telefone: tel });
}

async function avisarAdmin(email: string, cpf: boolean, tel: boolean) {
  const para = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",")[0]?.trim();
  if (!para) return;
  const oque = [cpf && "CPF", tel && "WhatsApp"].filter(Boolean).join(" e ");
  await enviarEmail({
    para,
    assunto: "Atenção: possível revenda anunciando como particular",
    html: modeloEmail(
      "Mesmo CPF/WhatsApp em outra conta",
      `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:#4A4843">A conta <strong>${escaparHtml(email)}</strong> tentou pegar o anúncio grátis de particular com ${oque} que já foi usado por <strong>outra conta</strong>.</p>
       <p style="margin:0;font-size:14px;line-height:1.5;color:#4A4843">O grátis foi negado automaticamente. Se for uma revenda, vale oferecer um plano de loja.</p>`,
    ),
  }).catch(() => {});
}
