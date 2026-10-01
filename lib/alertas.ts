import { criarClienteAdmin, criarClienteAnonimo } from "@/lib/supabase-servidor";
import { aplicarFiltros, descreverFiltros, filtrosParaQuery, lerFiltros, type Filtros } from "@/lib/busca";
import { botaoEmail, enviarEmail, escaparHtml, modeloEmail } from "@/lib/email";
import { formatarKm, formatarPreco } from "@/lib/formatar";
import { URL_SITE } from "@/lib/site";
import type { VeiculoComLoja } from "@/lib/tipos";

// Alertas de veículos por e-mail. Tabela public.alertas (supabase/fase5-alertas.sql), acessada só
// daqui, com a service key.

const MAX_ALERTAS_POR_EMAIL = 10;
const MAX_PEDIDOS_POR_DIA = 3;       // pedidos ainda não confirmados, por e-mail, em 24h
const MAX_VEICULOS_POR_ALERTA = 6;   // no e-mail diário; o resto fica no link "ver todos"

type Alerta = { id: string; email: string; filtros: Filtros; descricao: string; token: string; confirmado_em: string; ultimo_envio: string | null };

export const EMAIL_VALIDO = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

const linkPagina = (acao: "confirmar" | "cancelar", token: string, todos = false) =>
  `${URL_SITE}/alerta?acao=${acao}&token=${token}${todos ? "&todos=1" : ""}`;

// Filtros sempre passam pelo mesmo leitor da URL de busca: descarta o que não for filtro válido.
export function normalizarFiltros(busca: string): Filtros {
  const f = lerFiltros(new URLSearchParams(busca));
  delete f.ordem;
  return f;
}

export async function criarAlerta(email: string, filtros: Filtros): Promise<{ ok: true } | { ok: false; erro: string }> {
  const admin = criarClienteAdmin();
  const emailNorm = email.trim().toLowerCase();

  const { data: existentes } = await admin
    .from("alertas")
    .select("filtros, confirmado_em, criado_em")
    .eq("email", emailNorm)
    .is("cancelado_em", null);

  const lista = existentes ?? [];
  const chave = JSON.stringify(filtrosParaQuery(filtros));
  if (lista.some(a => a.confirmado_em && JSON.stringify(filtrosParaQuery(a.filtros as Filtros)) === chave)) {
    return { ok: false, erro: "Você já tem um alerta ativo para essa busca." };
  }
  if (lista.length >= MAX_ALERTAS_POR_EMAIL) {
    return { ok: false, erro: `Limite de ${MAX_ALERTAS_POR_EMAIL} alertas por e-mail. Cancele algum pelo link dos e-mails de alerta.` };
  }
  const ontem = Date.now() - 86_400_000;
  if (lista.filter(a => !a.confirmado_em && new Date(a.criado_em).getTime() > ontem).length >= MAX_PEDIDOS_POR_DIA) {
    return { ok: false, erro: "Já enviamos vários pedidos de confirmação para esse e-mail hoje. Confira sua caixa de entrada (e o lixo eletrônico)." };
  }

  const descricao = descreverFiltros(filtros);
  const { data, error } = await admin
    .from("alertas")
    .insert({ email: emailNorm, filtros, descricao })
    .select("token")
    .single();
  if (error || !data) return { ok: false, erro: "Não foi possível criar o alerta. Tente de novo." };

  const envio = await enviarEmail({
    para: emailNorm,
    assunto: "Confirme seu alerta de veículos na AutoRegião",
    html: modeloEmail(
      "Confirme seu alerta",
      `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:#4A4843">Você pediu para receber um aviso quando aparecerem anúncios novos para:</p>
       <p style="margin:0 0 24px;font-size:15px;font-weight:bold;background:#F7F6F3;border-radius:8px;padding:12px 14px">${escaparHtml(descricao)}</p>
       ${botaoEmail("Confirmar alerta", linkPagina("confirmar", data.token))}
       <p style="margin:0;font-size:14px;line-height:1.5;color:#4A4843">Depois de confirmar, você recebe no máximo um e-mail por dia, e só quando houver anúncio novo.</p>`,
      "Se você não pediu esse alerta, ignore este e-mail — sem confirmação, nada será enviado.",
    ),
  });
  if (!envio.ok) {
    console.error("alerta: falha ao enviar confirmação:", envio.erro);
    await admin.from("alertas").delete().eq("token", data.token);
    return { ok: false, erro: "Não conseguimos enviar o e-mail de confirmação. Tente de novo em instantes." };
  }
  return { ok: true };
}

const TOKEN = /^[0-9a-f-]{36}$/i;

export async function confirmarAlerta(token: string): Promise<{ ok: boolean; descricao?: string }> {
  if (!TOKEN.test(token)) return { ok: false };
  const admin = criarClienteAdmin();
  const { data } = await admin.from("alertas").select("id, descricao, confirmado_em, cancelado_em").eq("token", token).maybeSingle();
  if (!data || data.cancelado_em) return { ok: false };
  if (!data.confirmado_em) await admin.from("alertas").update({ confirmado_em: new Date().toISOString() }).eq("id", data.id);
  return { ok: true, descricao: data.descricao };
}

// `todos`: cancela todos os alertas do mesmo e-mail (link "cancelar tudo" do e-mail diário).
export async function cancelarAlerta(token: string, todos = false): Promise<{ ok: boolean; quantos?: number }> {
  if (!TOKEN.test(token)) return { ok: false };
  const admin = criarClienteAdmin();
  const { data } = await admin.from("alertas").select("id, email").eq("token", token).maybeSingle();
  if (!data) return { ok: false };
  const agora = new Date().toISOString();
  const consulta = admin.from("alertas").update({ cancelado_em: agora }, { count: "exact" }).is("cancelado_em", null);
  const { count } = todos ? await consulta.eq("email", data.email) : await consulta.eq("id", data.id);
  return { ok: true, quantos: count ?? 0 };
}

async function veiculosNovos(filtros: Filtros, desde: string) {
  const consulta = aplicarFiltros(
    criarClienteAnonimo().from("veiculos").select("*, lojas(nome, cidade)", { count: "exact" }).eq("ativo", true).gt("criado_em", desde),
    filtros,
  );
  const { data, count, error } = await consulta.order("destaque", { ascending: false }).order("criado_em", { ascending: false }).limit(MAX_VEICULOS_POR_ALERTA);
  if (error) throw error;
  return { veiculos: (data ?? []) as VeiculoComLoja[], total: count ?? 0 };
}

function cartaoVeiculo(v: VeiculoComLoja): string {
  const foto = v.fotos?.[0];
  const detalhes = [v.ano, v.km ? formatarKm(v.km) : null, v.lojas?.nome, v.lojas?.cidade || v.cidade].filter(Boolean).join(" · ");
  return `<a href="${URL_SITE}/veiculo/${v.id}" style="display:block;text-decoration:none;color:#1A1917;border:1px solid #E8E6E1;border-radius:10px;overflow:hidden;margin:0 0 12px">
    ${foto ? `<img src="${escaparHtml(foto)}" alt="" width="456" style="display:block;width:100%;max-height:220px;object-fit:cover">` : ""}
    <div style="padding:12px 14px">
      <div style="font-size:15px;font-weight:bold;margin:0 0 4px">${escaparHtml(v.nome ?? "Veículo")}</div>
      <div style="font-size:17px;font-weight:bold;color:#FF6600;margin:0 0 4px">${escaparHtml(formatarPreco(v.preco))}</div>
      <div style="font-size:12px;color:#8A877F">${escaparHtml(detalhes)}</div>
    </div>
  </a>`;
}

// Chamado 1x por dia pelo cron (/api/keepalive). Um e-mail por pessoa, juntando todos os alertas
// dela; só envia quando há anúncio novo desde o último envio (ou desde a confirmação).
export async function enviarAlertasDoDia(): Promise<{ alertas: number; emails: number; falhas: number }> {
  const admin = criarClienteAdmin();
  const inicio = new Date().toISOString();
  const { data, error } = await admin
    .from("alertas")
    .select("id, email, filtros, descricao, token, confirmado_em, ultimo_envio")
    .not("confirmado_em", "is", null)
    .is("cancelado_em", null);
  if (error) throw error;
  const alertas = (data ?? []) as Alerta[];

  const porEmail = new Map<string, Alerta[]>();
  for (const a of alertas) porEmail.set(a.email, [...(porEmail.get(a.email) ?? []), a]);

  let emails = 0, falhas = 0;
  for (const [email, lista] of porEmail) {
    const secoes: string[] = [];
    let totalNovos = 0;
    for (const a of lista) {
      const { veiculos, total } = await veiculosNovos(a.filtros, a.ultimo_envio ?? a.confirmado_em);
      if (!total) continue;
      totalNovos += total;
      const verTodos = `${URL_SITE}/veiculos${filtrosParaQuery(a.filtros)}`;
      secoes.push(`<h2 style="margin:24px 0 12px;font-size:16px">${escaparHtml(a.descricao)} <span style="font-weight:normal;color:#8A877F">(${total} ${total === 1 ? "novo" : "novos"})</span></h2>
        ${veiculos.map(cartaoVeiculo).join("")}
        ${total > veiculos.length ? `<p style="margin:0 0 8px;font-size:14px"><a href="${verTodos}" style="color:#FF6600;font-weight:bold">Ver todos os ${total} anúncios →</a></p>` : ""}
        <p style="margin:0 0 8px;font-size:12px"><a href="${linkPagina("cancelar", a.token)}" style="color:#8A877F">Cancelar este alerta</a></p>`);
    }

    const ids = lista.map(a => a.id);
    if (!secoes.length) {
      await admin.from("alertas").update({ ultimo_envio: inicio }).in("id", ids);
      continue;
    }

    const cancelarTudo = linkPagina("cancelar", lista[0].token, true);
    const envio = await enviarEmail({
      para: email,
      assunto: totalNovos === 1 ? "1 anúncio novo para o seu alerta — AutoRegião" : `${totalNovos} anúncios novos para os seus alertas — AutoRegião`,
      html: modeloEmail(
        totalNovos === 1 ? "Chegou um anúncio novo" : "Chegaram anúncios novos",
        `<p style="margin:0;font-size:15px;line-height:1.5;color:#4A4843">Estes veículos foram anunciados na AutoRegião e combinam com o que você procura:</p>${secoes.join("")}`,
        `Você recebe este e-mail porque criou um alerta na AutoRegião. <a href="${cancelarTudo}" style="color:#8A877F">Cancelar todos os alertas</a>.`,
      ),
      // Botão "cancelar inscrição" do Gmail/Outlook (RFC 8058).
      cabecalhos: {
        "List-Unsubscribe": `<${URL_SITE}/api/alertas/cancelar?token=${lista[0].token}&todos=1>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    if (envio.ok) {
      emails++;
      await admin.from("alertas").update({ ultimo_envio: inicio }).in("id", ids);
    } else {
      falhas++;
      console.error("alerta: falha no envio diário:", envio.erro);
    }
  }
  return { alertas: alertas.length, emails, falhas };
}
