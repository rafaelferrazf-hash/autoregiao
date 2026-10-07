import { EMAIL_CONTATO, NOME_SITE } from "@/lib/site";

// Envio de e-mails do site pelo Resend (mesmo domínio verificado usado pelo Supabase Auth).
// Só no servidor: usa RESEND_API_KEY.

export function escaparHtml(texto: string): string {
  return texto.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

// Mesmo visual dos e-mails do cadastro/senha (supabase/emails). `corpo` já deve vir escapado.
export function modeloEmail(titulo: string, corpo: string, rodape = ""): string {
  return `<div style="background:#F7F6F3;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#1A1917">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #E8E6E1">
    <p style="margin:0 0 24px"><img src="https://www.autoregiao.com.br/marca/logo-horizontal.png" alt="AutoRegião" width="240" height="30" style="display:block;border:0;width:240px;height:auto"></p>
    <h1 style="margin:0 0 12px;font-size:20px">${escaparHtml(titulo)}</h1>
    ${corpo}
    ${rodape ? `<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#8A877F">${rodape}</p>` : ""}
    <p style="margin:24px 0 0;font-size:12px;color:#8A877F">${NOME_SITE} · ${EMAIL_CONTATO}</p>
  </div>
</div>`;
}

export function botaoEmail(texto: string, link: string): string {
  return `<p style="margin:0 0 24px"><a href="${escaparHtml(link)}" style="display:inline-block;background:#FF6600;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:15px">${escaparHtml(texto)}</a></p>`;
}

type Envio = { para: string; assunto: string; html: string; cabecalhos?: Record<string, string>; responderPara?: string };

export async function enviarEmail({ para, assunto, html, cabecalhos, responderPara }: Envio): Promise<{ ok: boolean; erro?: string }> {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) return { ok: false, erro: "RESEND_API_KEY não configurada" };
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `${NOME_SITE} <${EMAIL_CONTATO}>`,
      to: [para],
      subject: assunto,
      html,
      headers: cabecalhos,
      ...(responderPara ? { reply_to: [responderPara] } : {}),
    }),
  });
  if (r.ok) return { ok: true };
  return { ok: false, erro: `Resend ${r.status}: ${(await r.text()).slice(0, 200)}` };
}
