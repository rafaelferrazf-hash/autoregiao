import { criarClienteAdmin, criarClienteServidor } from "@/lib/supabase-servidor";
import { cnpjValido, consultarCnpj, soDigitosCnpj } from "@/lib/cnpj";

// CNPJ da loja do usuário logado (supabase/fase32). O lojista não grava o CNPJ direto no banco:
//  * com { cnpj }: loja antiga sem CNPJ informa o número (uma vez; trocar só falando com o AutoRegião);
//  * sem corpo: completa a razão social / situação com a consulta da Receita (logo depois do cadastro).
export async function POST(request: Request) {
  const sessao = await criarClienteServidor();
  const { data: { user } } = await sessao.auth.getUser();
  if (!user) return Response.json({ erro: "Faça login." }, { status: 401 });

  let corpo: { cnpj?: string } = {};
  try { corpo = await request.json(); } catch { /* sem corpo */ }

  const admin = criarClienteAdmin();
  const { data: loja } = await admin.from("lojas").select("id, cnpj, razao_social").eq("usuario_id", user.id).maybeSingle();
  if (!loja) return Response.json({ erro: "Sua conta não tem loja." }, { status: 404 });

  const novo = corpo.cnpj !== undefined ? soDigitosCnpj(corpo.cnpj) : null;
  if (novo !== null) {
    if (loja.cnpj && loja.cnpj !== novo) {
      return Response.json({ erro: "O CNPJ da loja já foi informado. Para trocar, fale com o AutoRegião." }, { status: 409 });
    }
    if (!cnpjValido(novo)) return Response.json({ erro: "CNPJ inválido. Confira os números." }, { status: 400 });
    const { data: outra } = await admin.from("lojas").select("id").eq("cnpj", novo).neq("id", loja.id).limit(1);
    if (outra?.length) return Response.json({ erro: "Este CNPJ já está cadastrado em outra loja. Fale com o AutoRegião." }, { status: 409 });
  }

  const cnpj = novo ?? loja.cnpj;
  if (!cnpj) return Response.json({ erro: "Informe o CNPJ." }, { status: 400 });
  if (novo === null && loja.razao_social) return Response.json({ ok: true });

  // "nao_encontrado" não bloqueia (a base pública às vezes não tem CNPJs verdadeiros): grava sem confirmação.
  const consulta = await consultarCnpj(cnpj);
  const receita = consulta === "nao_encontrado" ? null : consulta;
  if (novo !== null && receita?.situacao && receita.situacao !== "ATIVA") {
    return Response.json({ erro: `Este CNPJ está "${receita.situacao}" na Receita Federal. Só é possível usar CNPJ ativo.` }, { status: 400 });
  }

  const { data: atualizada, error } = await admin.from("lojas")
    .update({ cnpj, razao_social: receita?.razao_social ?? null, cnpj_situacao: receita?.situacao ?? null })
    .eq("id", loja.id).select("*").single();
  if (error) {
    console.error("cnpj da loja:", error.message);
    const repetido = error.code === "23505";
    return Response.json({ erro: repetido ? "Este CNPJ já está cadastrado em outra loja." : "Não foi possível salvar. Tente de novo." }, { status: repetido ? 409 : 500 });
  }
  return Response.json({ ok: true, loja: atualizada });
}
