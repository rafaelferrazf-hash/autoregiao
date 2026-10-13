import { criarClienteAdmin } from "@/lib/supabase-servidor";
import { botaoEmail, enviarEmail, escaparHtml, modeloEmail } from "@/lib/email";
import { URL_SITE } from "@/lib/site";

// Relatório mensal das lojas (supabase/fase21): números do mês anterior.
//  - dia 1º, a rotina diária (/api/keepalive) prepara os relatórios e manda por e-mail;
//  - no /admin (aba Relatórios) o Rafael manda cada um pelo WhatsApp com 1 toque (mensagem pronta).
// Lojas de teste (demonstracao) e desativadas ficam de fora.

export type DadosRelatorio = {
  visualizacoes: number; whatsapp: number; ligacoes: number;
  visualizacoes_anterior: number; contatos_anterior: number;
  mais_visto: { nome: string; visualizacoes: number } | null;
  no_ar: number; vendidos: number;
};

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

// "2026-09-01" → "setembro de 2026"
export function nomeDoMes(mes: string) {
  const [a, m] = mes.split("-").map(Number);
  return `${MESES[m - 1]} de ${a}`;
}

// Primeiro dia do mês anterior, no horário de Brasília ("2026-09-01").
export function mesAnterior(agora = new Date()): string {
  const br = new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const d = new Date(br.getFullYear(), br.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function diaDoMesBrasilia(agora = new Date()) {
  return Number(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo", day: "numeric" }));
}

// "+18% que agosto" / "-5% que agosto" / "" (sem base de comparação).
function variacao(atual: number, anterior: number, mes: string) {
  if (!anterior) return "";
  const pct = Math.round(((atual - anterior) / anterior) * 100);
  const m = Number(mes.split("-")[1]);
  const mesAnt = MESES[(m + 10) % 12];
  return `${pct >= 0 ? "+" : ""}${pct}% que ${mesAnt}`;
}

const fmt = (n: number) => n.toLocaleString("pt-BR");

// Texto do WhatsApp (sai do número do Rafael).
export function textoWhatsApp(loja: string, mes: string, d: DadosRelatorio) {
  const contatos = d.whatsapp + d.ligacoes;
  const varVis = variacao(d.visualizacoes, d.visualizacoes_anterior, mes);
  const varCont = variacao(contatos, d.contatos_anterior, mes);
  return [
    `Olá! Aqui é o Rafael, do AutoRegião 🚗`,
    ``,
    `📊 *Relatório de ${nomeDoMes(mes)}*`,
    `Loja: *${loja}*`,
    ``,
    `👀 ${fmt(d.visualizacoes)} visualizações dos anúncios${varVis ? ` (${varVis})` : ""}`,
    `💬 ${fmt(d.whatsapp)} contatos pelo WhatsApp · 📞 ${fmt(d.ligacoes)} ligações${varCont ? ` (${varCont})` : ""}`,
    d.mais_visto ? `🏆 Anúncio mais visto: ${d.mais_visto.nome} (${fmt(d.mais_visto.visualizacoes)} visualizações)` : "",
    `🚗 ${fmt(d.no_ar)} anúncios no ar${d.vendidos ? ` · ${fmt(d.vendidos)} vendidos no mês` : ""}`,
    ``,
    `Ver o painel: ${URL_SITE}/painel`,
  ].filter((l, i, t) => l !== "" || t[i - 1] !== "").join("\n");
}

function htmlEmail(loja: string, mes: string, d: DadosRelatorio) {
  const contatos = d.whatsapp + d.ligacoes;
  const linha = (rotulo: string, valor: string, extra = "") =>
    `<tr><td style="padding:10px 0;border-bottom:1px solid #F0EEE9;font-size:14px;color:#4A4843">${rotulo}</td>
     <td style="padding:10px 0;border-bottom:1px solid #F0EEE9;font-size:16px;font-weight:bold;color:#1A1917;text-align:right">${valor}${extra ? `<div style="font-size:12px;font-weight:normal;color:#15803D">${extra}</div>` : ""}</td></tr>`;
  return modeloEmail(
    `Relatório de ${nomeDoMes(mes)}`,
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#4A4843">Como foram os anúncios da <strong>${escaparHtml(loja)}</strong> no AutoRegião:</p>
     <table style="width:100%;border-collapse:collapse;margin:0 0 20px">
       ${linha("Visualizações dos anúncios", fmt(d.visualizacoes), escaparHtml(variacao(d.visualizacoes, d.visualizacoes_anterior, mes)))}
       ${linha("Contatos pelo WhatsApp", fmt(d.whatsapp))}
       ${linha("Ligações", fmt(d.ligacoes), escaparHtml(variacao(contatos, d.contatos_anterior, mes)))}
       ${linha("Anúncios no ar", fmt(d.no_ar))}
       ${d.vendidos ? linha("Vendidos no mês", fmt(d.vendidos)) : ""}
     </table>
     ${d.mais_visto ? `<p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#4A4843">🏆 Anúncio mais visto: <strong>${escaparHtml(d.mais_visto.nome)}</strong> (${fmt(d.mais_visto.visualizacoes)} visualizações)</p>` : ""}
     ${botaoEmail("Abrir meu painel", `${URL_SITE}/painel`)}`,
    "Dica: anúncios com mais fotos e com a situação do veículo preenchida (IPVA pago, licenciado...) recebem mais contatos.",
  );
}

type Loja = { id: string; nome: string; usuario_id: string | null; whatsapp: string | null; telefone: string | null };

// Prepara (e guarda) o relatório do mês para todas as lojas reais. Com `enviarEmails`, manda o
// e-mail de quem ainda não recebeu. Devolve quantos foram preparados e enviados.
export async function prepararRelatorios(mes: string, enviarEmails: boolean) {
  const admin = criarClienteAdmin();
  const { data: lojas } = await admin.from("lojas").select("id, nome, usuario_id, whatsapp, telefone")
    .neq("ativo", false).eq("demonstracao", false);
  let preparados = 0, emails = 0;
  for (const loja of (lojas ?? []) as Loja[]) {
    const { data: existente } = await admin.from("relatorios_mensais").select("dados, email_em").eq("loja_id", loja.id).eq("mes", mes).maybeSingle();
    let dados = existente?.dados as DadosRelatorio | undefined;
    if (!dados) {
      const { data, error } = await admin.rpc("dados_relatorio_mensal", { p_loja: loja.id, p_mes: mes });
      if (error || !data) { console.error("relatório", loja.nome, error?.message); continue; }
      dados = data as DadosRelatorio;
      await admin.from("relatorios_mensais").insert({ loja_id: loja.id, mes, dados });
    }
    preparados++;
    if (enviarEmails && !existente?.email_em && loja.usuario_id) {
      const { data: dono } = await admin.auth.admin.getUserById(loja.usuario_id);
      const email = dono?.user?.email;
      if (!email) continue;
      const r = await enviarEmail({ para: email, assunto: `Seu relatório de ${nomeDoMes(mes)} — AutoRegião`, html: htmlEmail(loja.nome, mes, dados) });
      if (r.ok) {
        emails++;
        await admin.from("relatorios_mensais").update({ email_em: new Date().toISOString() }).eq("loja_id", loja.id).eq("mes", mes);
      } else console.error("relatório e-mail", loja.nome, r.erro);
    }
  }
  return { mes, preparados, emails };
}
