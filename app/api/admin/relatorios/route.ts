import { exigirAdmin, UUID } from "@/lib/admin-servidor";
import { mesAnterior, nomeDoMes, prepararRelatorios, textoWhatsApp, type DadosRelatorio } from "@/lib/relatorioMensal";

// Aba "Relatórios" do /admin.
//  GET ?mes=2026-09-01            → relatórios do mês (com o texto pronto do WhatsApp)
//  POST { acao: "preparar", mes } → calcula os que faltam (sem mandar e-mail)
//  POST { acao: "whatsapp", mes, loja_id } → marca como enviado pelo WhatsApp
export const dynamic = "force-dynamic";
const MES = /^\d{4}-\d{2}-01$/;

export async function GET(request: Request) {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  const mes = new URL(request.url).searchParams.get("mes") || mesAnterior();
  if (!MES.test(mes)) return Response.json({ erro: "Mês inválido." }, { status: 400 });

  const { data } = await r.admin.from("relatorios_mensais")
    .select("loja_id, dados, email_em, whatsapp_em, lojas(nome, cidade, whatsapp, telefone)").eq("mes", mes);
  type Linha = { loja_id: string; dados: DadosRelatorio; email_em: string | null; whatsapp_em: string | null; lojas: { nome: string; cidade: string | null; whatsapp: string | null; telefone: string | null } | null };
  const relatorios = ((data ?? []) as unknown as Linha[]).map(l => {
    const tel = (l.lojas?.whatsapp || l.lojas?.telefone || "").replace(/\D/g, "");
    return {
      loja_id: l.loja_id,
      loja: l.lojas?.nome ?? "—",
      cidade: l.lojas?.cidade ?? "",
      telefone: tel.length >= 10 ? tel : null,
      dados: l.dados,
      texto: textoWhatsApp(l.lojas?.nome ?? "", mes, l.dados),
      email_em: l.email_em,
      whatsapp_em: l.whatsapp_em,
    };
  }).sort((a, b) => a.loja.localeCompare(b.loja, "pt-BR"));
  return Response.json({ mes, nome: nomeDoMes(mes), relatorios });
}

export async function POST(request: Request) {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  let corpo: { acao?: string; mes?: string; loja_id?: string };
  try { corpo = await request.json(); } catch { return Response.json({ erro: "Pedido inválido." }, { status: 400 }); }
  const mes = corpo.mes || mesAnterior();
  if (!MES.test(mes)) return Response.json({ erro: "Mês inválido." }, { status: 400 });

  if (corpo.acao === "preparar") return Response.json({ ok: true, ...(await prepararRelatorios(mes, false)) });
  if (corpo.acao === "whatsapp") {
    if (!corpo.loja_id || !UUID.test(corpo.loja_id)) return Response.json({ erro: "Loja inválida." }, { status: 400 });
    const { error } = await r.admin.from("relatorios_mensais").update({ whatsapp_em: new Date().toISOString() }).eq("loja_id", corpo.loja_id).eq("mes", mes);
    if (error) return Response.json({ erro: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }
  return Response.json({ erro: "Ação desconhecida." }, { status: 400 });
}
