import { criarClienteAdmin, criarClienteServidor } from "@/lib/supabase-servidor";
import { criarPreferencia } from "@/lib/mercadopago";
import { AVULSOS, ehVitalicio, PERIODOS, planoPorId, valorDoPeriodo, type MesesPeriodo } from "@/lib/planos";
import { URL_SITE } from "@/lib/site";

// Lojista escolhe plano + período → cria o registro do pagamento e o checkout do Mercado Pago.
// Pessoa física: { avulso: "avulso30" | "avulso60" } → anúncio avulso (supabase/fase24).
// O preço é SEMPRE calculado aqui no servidor (o navegador só manda plano e meses).
export async function POST(request: Request) {
  const sessao = await criarClienteServidor();
  const { data: { user } } = await sessao.auth.getUser();
  if (!user) return Response.json({ erro: "Faça login para assinar um plano." }, { status: 401 });

  let corpo: { plano?: string; meses?: number; avulso?: string };
  try { corpo = await request.json(); } catch { return Response.json({ erro: "Pedido inválido." }, { status: 400 }); }

  if (corpo.avulso) return criarAvulso(corpo.avulso, user.id, user.email);

  const plano = planoPorId(corpo.plano);
  const meses = Number(corpo.meses) as MesesPeriodo;
  if (!plano || !PERIODOS.some(p => p.meses === meses)) return Response.json({ erro: "Plano ou período inválido." }, { status: 400 });

  const admin = criarClienteAdmin();
  const { data: loja } = await admin.from("lojas").select("id, nome, plano, ativo").eq("usuario_id", user.id).maybeSingle();
  if (!loja) return Response.json({ erro: "Sua conta não tem uma loja cadastrada." }, { status: 400 });
  if (ehVitalicio(loja.plano)) return Response.json({ erro: "Sua loja tem acesso vitalício — não precisa pagar." }, { status: 400 });
  if (loja.ativo === false) return Response.json({ erro: "Sua loja está desativada. Fale com o AutoRegião." }, { status: 403 });

  const valor = valorDoPeriodo(plano, meses);
  const { data: registro, error } = await admin
    .from("pagamentos")
    .insert({ loja_id: loja.id, usuario_id: user.id, plano: plano.id, meses, valor })
    .select("id")
    .single();
  if (error || !registro) return Response.json({ erro: "Não foi possível iniciar o pagamento." }, { status: 500 });

  try {
    const pref = await criarPreferencia({
      pagamentoId: registro.id,
      titulo: `AutoRegião — Plano ${plano.nome} (${meses} ${meses === 1 ? "mês" : "meses"})`,
      valor,
      emailPagador: user.email,
      urlSite: URL_SITE,
    });
    await admin.from("pagamentos").update({ mp_preference_id: pref.id }).eq("id", registro.id);
    return Response.json({ link: pref.link });
  } catch (e) {
    await admin.from("pagamentos").update({ status: "erro_checkout" }).eq("id", registro.id);
    console.error("criar preferência:", e);
    return Response.json({ erro: "O Mercado Pago não respondeu. Tente de novo em instantes." }, { status: 502 });
  }
}

async function criarAvulso(id: string, usuarioId: string, email: string | undefined) {
  const avulso = AVULSOS.find(a => a.id === id);
  if (!avulso) return Response.json({ erro: "Opção inválida." }, { status: 400 });
  const admin = criarClienteAdmin();
  const { data: loja } = await admin.from("lojas").select("id").eq("usuario_id", usuarioId).maybeSingle();
  if (loja) return Response.json({ erro: "Sua conta é de loja: anuncie pelo plano da loja." }, { status: 400 });

  const { data: registro, error } = await admin
    .from("pagamentos")
    .insert({ loja_id: null, usuario_id: usuarioId, plano: avulso.id, meses: 1, valor: avulso.preco })
    .select("id")
    .single();
  if (error || !registro) return Response.json({ erro: "Não foi possível iniciar o pagamento." }, { status: 500 });
  try {
    const pref = await criarPreferencia({
      pagamentoId: registro.id,
      titulo: `AutoRegião — Anúncio avulso (${avulso.dias} dias)`,
      valor: avulso.preco,
      emailPagador: email,
      urlSite: URL_SITE,
    });
    await admin.from("pagamentos").update({ mp_preference_id: pref.id }).eq("id", registro.id);
    return Response.json({ link: pref.link });
  } catch (e) {
    await admin.from("pagamentos").update({ status: "erro_checkout" }).eq("id", registro.id);
    console.error("criar preferência (avulso):", e);
    return Response.json({ erro: "O Mercado Pago não respondeu. Tente de novo em instantes." }, { status: 502 });
  }
}
