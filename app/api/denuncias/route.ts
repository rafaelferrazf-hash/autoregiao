import { criarClienteAdmin } from "@/lib/supabase-servidor";
import { enviarEmail, escaparHtml, modeloEmail } from "@/lib/email";
import { URL_SITE } from "@/lib/site";
import { linkDoVeiculo } from "@/lib/linkVeiculo";

// Denúncia de anúncio (botão "Denunciar este anúncio"): manda e-mail para o admin moderar no /admin.
// Não precisa de login. O e-mail de quem denuncia é opcional (para responder).
const MOTIVOS = ["Golpe ou fraude", "Veículo não existe ou já foi vendido", "Informações falsas", "Fotos de outro veículo", "Conteúdo ofensivo", "Outro"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let corpo: { veiculo?: string; motivo?: string; detalhes?: string; email?: string };
  try { corpo = await request.json(); } catch { return Response.json({ erro: "Pedido inválido." }, { status: 400 }); }
  const motivo = MOTIVOS.includes(corpo.motivo ?? "") ? corpo.motivo! : null;
  if (!corpo.veiculo || !UUID.test(corpo.veiculo) || !motivo) return Response.json({ erro: "Escolha o motivo da denúncia." }, { status: 400 });
  const detalhes = String(corpo.detalhes ?? "").trim().slice(0, 1000);
  const email = String(corpo.email ?? "").trim().slice(0, 120);

  const { data: v } = await criarClienteAdmin().from("veiculos").select("id, nome, lojas(nome)").eq("id", corpo.veiculo).maybeSingle();
  if (!v) return Response.json({ erro: "Anúncio não encontrado." }, { status: 404 });
  const anunciante = (v.lojas as unknown as { nome: string } | null)?.nome ?? "Pessoa física";
  const link = `${URL_SITE}${linkDoVeiculo(v as { id: string; nome: string })}`;

  const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean);
  for (const para of admins) {
    await enviarEmail({
      para,
      assunto: `Denúncia de anúncio: ${v.nome}`,
      responderPara: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined,
      html: modeloEmail(
        "Denúncia de anúncio",
        `<p style="margin:0 0 8px;font-size:15px;color:#4A4843"><strong>Anúncio:</strong> <a href="${escaparHtml(link)}">${escaparHtml(v.nome)}</a> (${escaparHtml(anunciante)})</p>
         <p style="margin:0 0 8px;font-size:15px;color:#4A4843"><strong>Motivo:</strong> ${escaparHtml(motivo)}</p>
         ${detalhes ? `<p style="margin:0 0 8px;font-size:15px;color:#4A4843;white-space:pre-wrap"><strong>Detalhes:</strong> ${escaparHtml(detalhes)}</p>` : ""}
         <p style="margin:0 0 16px;font-size:14px;color:#7A7670">Quem denunciou: ${email ? escaparHtml(email) : "não informou e-mail"}</p>
         <p style="margin:0;font-size:14px;color:#4A4843">Para pausar ou remover: Admin → Anúncios.</p>`,
      ),
    }).catch(() => {});
  }
  return Response.json({ ok: true });
}
