import { criarClienteAdmin } from "@/lib/supabase-servidor";
import { botaoEmail, enviarEmail, escaparHtml, modeloEmail } from "@/lib/email";
import { URL_SITE } from "@/lib/site";

// Rotina diária: banners e anúncios flutuantes que terminam daqui a 3 dias → e-mail para o admin oferecer a renovação.
export async function avisarBannersVencendo(): Promise<number> {
  const admin = criarClienteAdmin();
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  d.setDate(d.getDate() + 3);
  const dia = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const [{ data }, { data: flutuantes }] = await Promise.all([
    admin.from("banners").select("anunciante, telefone, titulo, fim, visualizacoes, cliques").eq("ativo", true).eq("fim", dia),
    admin.from("anuncios_flutuantes").select("anunciante, telefone, titulo, fim, visualizacoes, cliques").eq("ativo", true).eq("fim", dia),
  ]);
  const lista = [...(data ?? []), ...(flutuantes ?? []).map(f => ({ ...f, titulo: `Anúncio flutuante — ${f.titulo}` }))];
  const para = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",")[0]?.trim();
  if (!lista.length || !para) return 0;
  const itens = lista.map(b => `<li style="margin:0 0 8px"><strong>${escaparHtml(b.anunciante)}</strong>${b.telefone ? ` (${escaparHtml(b.telefone)})` : ""}: ${escaparHtml(b.titulo)}<br><span style="color:#8A877F">${b.visualizacoes} visualizações · ${b.cliques} cliques</span></li>`).join("");
  const r = await enviarEmail({
    para,
    assunto: `Publicidade vencendo em 3 dias: ${lista.map(b => b.anunciante).join(", ")}`,
    html: modeloEmail(
      "Publicidade vencendo em 3 dias",
      `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:#4A4843">Estes anúncios pagos saem do ar em ${dia.split("-").reverse().join("/")}. Bom momento para oferecer a renovação:</p>
       <ul style="margin:0 0 20px;padding-left:18px;font-size:14px;line-height:1.5;color:#1A1917">${itens}</ul>
       ${botaoEmail("Abrir os banners no Admin", `${URL_SITE}/admin`)}`,
    ),
  });
  if (!r.ok) console.error("aviso banners:", r.erro);
  return lista.length;
}
