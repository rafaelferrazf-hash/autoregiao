import { criarClienteAdmin } from "@/lib/supabase-servidor";
import { botaoEmail, enviarEmail, escaparHtml, modeloEmail } from "@/lib/email";
import { formatarReais, nomeDoPlano } from "@/lib/planos";
import { URL_SITE } from "@/lib/site";

// E-mails depois de um pagamento aprovado e aplicado (uma vez só por pagamento):
//  - para o lojista: plano ativo e até quando (ou quando começa, se ficou agendado);
//  - para o admin (NEXT_PUBLIC_ADMIN_EMAILS): aviso de nova venda.
// Falha de e-mail nunca atrapalha o pagamento — só fica registrada no log.

const data = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "");

const METODOS: Record<string, string> = {
  bank_transfer: "Pix", credit_card: "Cartão de crédito", debit_card: "Cartão de débito",
  ticket: "Boleto", account_money: "Saldo Mercado Pago", prepaid_card: "Cartão pré-pago",
};

export async function avisarPagamentoAprovado(pagamentoId: string) {
  try {
    const admin = criarClienteAdmin();
    const { data: pag } = await admin.from("pagamentos").select("plano, meses, valor, metodo, usuario_id, loja_id").eq("id", pagamentoId).maybeSingle();
    if (!pag) return;
    const { data: loja } = await admin.from("lojas").select("nome, plano, expira_em, plano_proximo, plano_proximo_em").eq("id", pag.loja_id).maybeSingle();
    const { data: dono } = await admin.auth.admin.getUserById(pag.usuario_id);
    const emailLojista = dono?.user?.email;

    if (String(pag.plano).startsWith("avulso")) return await avisarAvulso(pag.plano, Number(pag.valor), pag.metodo, emailLojista);
    const plano = nomeDoPlano(pag.plano);
    const periodo = `${pag.meses} ${pag.meses === 1 ? "mês" : "meses"}`;
    const valor = formatarReais(Number(pag.valor));
    const metodo = METODOS[pag.metodo ?? ""] ?? "Mercado Pago";
    const agendado = !!loja?.plano_proximo;
    const situacao = agendado
      ? `O <strong>Plano ${escaparHtml(plano)}</strong> começa em <strong>${data(loja?.plano_proximo_em)}</strong>, quando o plano atual terminar, e vale até <strong>${data(loja?.expira_em)}</strong>. Até lá, nada muda na sua loja.`
      : `Seu <strong>Plano ${escaparHtml(plano)}</strong> está ativo até <strong>${data(loja?.expira_em)}</strong>.`;

    if (emailLojista) {
      const r = await enviarEmail({
        para: emailLojista,
        assunto: `Pagamento aprovado — Plano ${plano}`,
        html: modeloEmail(
          "Pagamento aprovado!",
          `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:#4A4843">Recebemos o pagamento de <strong>${escaparHtml(valor)}</strong> (${escaparHtml(metodo)}) do <strong>Plano ${escaparHtml(plano)} — ${escaparHtml(periodo)}</strong>${loja?.nome ? ` da loja <strong>${escaparHtml(loja.nome)}</strong>` : ""}.</p>
           <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#4A4843">${situacao}</p>
           ${botaoEmail("Abrir meu painel", `${URL_SITE}/painel`)}`,
          "O comprovante do pagamento fica no Mercado Pago. Dúvidas: contato@autoregiao.com.br.",
        ),
      });
      if (!r.ok) console.error("aviso pagamento (lojista):", r.erro);
    }

    const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);
    for (const para of admins) {
      const r = await enviarEmail({
        para,
        assunto: `Nova assinatura: ${loja?.nome ?? "loja"} — ${valor} (${plano}, ${periodo})`,
        html: modeloEmail(
          "Nova assinatura no AutoRegião",
          `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:#4A4843">A loja <strong>${escaparHtml(loja?.nome ?? "—")}</strong>${emailLojista ? ` (${escaparHtml(emailLojista)})` : ""} pagou <strong>${escaparHtml(valor)}</strong> por <strong>${escaparHtml(metodo)}</strong>.</p>
           <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#4A4843">Plano ${escaparHtml(plano)} — ${escaparHtml(periodo)}. ${agendado ? `Começa em ${data(loja?.plano_proximo_em)} e vai` : "Ativo"} até ${data(loja?.expira_em)}.</p>
           ${botaoEmail("Abrir o admin", `${URL_SITE}/admin`)}`,
          "Aviso automático do AutoRegião.",
        ),
      });
      if (!r.ok) console.error("aviso pagamento (admin):", r.erro);
    }
  } catch (e) {
    console.error("aviso pagamento:", e);
  }
}

// Anúncio avulso de pessoa física (supabase/fase24): avisa quem pagou (com o link para publicar) e o admin.
async function avisarAvulso(plano: string, valorPago: number, metodoMp: string | null, email: string | undefined) {
  const nome = nomeDoPlano(plano);
  const valor = formatarReais(valorPago);
  const metodo = METODOS[metodoMp ?? ""] ?? "Mercado Pago";
  if (email) {
    const r = await enviarEmail({
      para: email,
      assunto: `Pagamento aprovado — ${nome}`,
      html: modeloEmail(
        "Pagamento aprovado!",
        `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:#4A4843">Recebemos <strong>${escaparHtml(valor)}</strong> (${escaparHtml(metodo)}) do <strong>${escaparHtml(nome)}</strong>.</p>
         <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#4A4843">Agora é só cadastrar o seu veículo. O prazo começa a contar quando o anúncio for publicado.</p>
         ${botaoEmail("Publicar meu anúncio", `${URL_SITE}/painel/novo-anuncio`)}`,
        "O comprovante do pagamento fica no Mercado Pago. Dúvidas: contato@autoregiao.com.br.",
      ),
    });
    if (!r.ok) console.error("aviso avulso (anunciante):", r.erro);
  }
  const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);
  for (const para of admins) {
    await enviarEmail({
      para,
      assunto: `Nova venda: ${nome} — ${valor}`,
      html: modeloEmail("Novo anúncio avulso vendido", `<p style="margin:0;font-size:15px;line-height:1.5;color:#4A4843">${email ? escaparHtml(email) : "Um anunciante"} pagou <strong>${escaparHtml(valor)}</strong> por <strong>${escaparHtml(metodo)}</strong> (${escaparHtml(nome)}).</p>`, "Aviso automático do AutoRegião."),
    }).catch(() => {});
  }
}
