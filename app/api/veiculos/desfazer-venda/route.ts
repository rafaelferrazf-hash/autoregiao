import { criarClienteAdmin, criarClienteServidor } from "@/lib/supabase-servidor";
import { ehAdmin } from "@/lib/admin";
import { DIAS_DESFAZER_VENDA, dentroDoPrazoDesfazer } from "@/lib/desfazerVenda";

// "Desfazer venda" (marcado como vendido por engano). O banco não deixa o lojista tirar o status
// "vendido" (supabase/fase15, trigger regras_anuncio_vendido) — só o servidor (service_role).
// O anúncio volta PAUSADO: para pôr no ar, o lojista reativa no painel, que confere o limite do plano.
// Lojista: até 7 dias depois de marcar (decisão do Rafael, 26/11/2026). Admin: sempre.
// Relatórios mensais já gravados (relatorios_mensais) não mudam: são uma foto tirada no dia 1º.
export async function POST(request: Request) {
  const sessao = await criarClienteServidor();
  const { data: { user } } = await sessao.auth.getUser();
  if (!user) return Response.json({ erro: "Faça login." }, { status: 401 });

  let id = "";
  try { id = String((await request.json())?.id ?? ""); } catch { /* sem corpo */ }
  if (!id) return Response.json({ erro: "Anúncio não informado." }, { status: 400 });

  const admin = criarClienteAdmin();
  const { data: veiculo } = await admin.from("veiculos").select("id, usuario_id, loja_id, status, vendido_em").eq("id", id).maybeSingle();
  if (!veiculo) return Response.json({ erro: "Anúncio não encontrado." }, { status: 404 });

  const admin_ = ehAdmin(user.email);
  let dono = veiculo.usuario_id === user.id || admin_;
  if (!dono && veiculo.loja_id) {
    const { data: loja } = await admin.from("lojas").select("id").eq("id", veiculo.loja_id).eq("usuario_id", user.id).maybeSingle();
    dono = !!loja;
  }
  if (!dono) return Response.json({ erro: "Anúncio não encontrado." }, { status: 404 });
  if (veiculo.status !== "vendido") return Response.json({ ok: true });
  if (!admin_ && !dentroDoPrazoDesfazer(veiculo.vendido_em)) {
    return Response.json({ erro: `O prazo para desfazer a venda é de ${DIAS_DESFAZER_VENDA} dias. Fale com o AutoRegião.` }, { status: 403 });
  }

  const { error } = await admin.from("veiculos").update({ status: "pausado", ativo: false, vendido_em: null }).eq("id", id);
  if (error) {
    console.error("desfazer venda:", error.message);
    return Response.json({ erro: "Não foi possível desfazer. Tente de novo." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
