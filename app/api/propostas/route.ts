import { criarClienteAdmin, criarClienteAnonimo } from "@/lib/supabase-servidor";
import { botaoEmail, enviarEmail, escaparHtml, modeloEmail } from "@/lib/email";
import { EMAIL_VALIDO } from "@/lib/alertas";
import { formatarPreco } from "@/lib/formatar";
import { linkDoVeiculo } from "@/lib/linkVeiculo";
import { URL_SITE } from "@/lib/site";

// "Enviar proposta" do anúncio: o comprador preenche o formulário e o vendedor recebe por e-mail
// (com "responder" indo direto para o comprador, quando ele informa e-mail).
// Proteções contra robô: campo escondido, tempo mínimo de preenchimento e limite por endereço.

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const recentes = new Map<string, number[]>(); // por IP: no máximo 5 propostas a cada hora (por servidor)

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let c: Record<string, unknown> = {};
  try { c = await request.json(); } catch { /* validação abaixo */ }

  // Robôs preenchem o campo escondido ou enviam rápido demais: finge que deu certo.
  if (texto(c.site, 200) || (typeof c.abertoHaMs === "number" && c.abertoHaMs < 3000)) return Response.json({ ok: true });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "?";
  const agora = Date.now();
  const lista = (recentes.get(ip) ?? []).filter(t => agora - t < 3_600_000);
  if (lista.length >= 5) return Response.json({ ok: false, erro: "Muitas propostas seguidas. Tente de novo mais tarde." }, { status: 429 });

  const id = texto(c.veiculo, 40);
  const nome = texto(c.nome, 80);
  const telefone = texto(c.telefone, 30);
  const email = texto(c.email, 200);
  const valor = typeof c.valor === "number" && c.valor > 0 && c.valor < 50_000_000 ? Math.round(c.valor) : null;
  const troca = texto(c.troca, 120);
  const mensagem = texto(c.mensagem, 1500);
  if (!ID.test(id)) return Response.json({ ok: false, erro: "Anúncio inválido." }, { status: 400 });
  if (nome.length < 2) return Response.json({ ok: false, erro: "Digite seu nome." }, { status: 400 });
  if (telefone.replace(/\D/g, "").length < 10) return Response.json({ ok: false, erro: "Digite seu WhatsApp ou telefone com DDD." }, { status: 400 });
  if (email && !EMAIL_VALIDO.test(email)) return Response.json({ ok: false, erro: "Confira o e-mail (ou deixe em branco)." }, { status: 400 });

  // Só anúncios públicos (ativos, de loja em dia; demonstração não recebe proposta).
  const { data: v } = await criarClienteAnonimo().from("veiculos").select("id, nome, preco, usuario_id, nome_contato").eq("id", id).eq("ativo", true).maybeSingle();
  if (!v?.usuario_id) return Response.json({ ok: false, erro: "Este anúncio não está mais disponível." }, { status: 404 });

  const { data: dono } = await criarClienteAdmin().auth.admin.getUserById(v.usuario_id);
  const paraVendedor = dono?.user?.email;
  if (!paraVendedor) return Response.json({ ok: false, erro: "Não foi possível falar com o vendedor agora. Use o WhatsApp." }, { status: 500 });

  const zap = telefone.replace(/\D/g, "");
  const linkZap = `https://wa.me/${zap.length <= 11 ? `55${zap}` : zap}?text=${encodeURIComponent(`Olá, ${nome}! Recebi sua proposta pelo AutoRegião para o ${v.nome}.`)}`;
  const linha = (rotulo: string, valorTexto: string) =>
    `<tr><td style="padding:6px 0;color:#8A877F;font-size:13px;width:140px;vertical-align:top">${rotulo}</td><td style="padding:6px 0;font-size:14px;color:#1A1917">${valorTexto}</td></tr>`;

  const envio = await enviarEmail({
    para: paraVendedor,
    responderPara: email || undefined,
    assunto: `Nova proposta: ${v.nome}${valor ? ` — ${formatarPreco(valor)}` : ""}`,
    html: modeloEmail(
      "Você recebeu uma proposta",
      `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:#4A4843">Um comprador enviou uma proposta pelo AutoRegião para o anúncio <strong>${escaparHtml(v.nome)}</strong> (anunciado por ${escaparHtml(formatarPreco(v.preco))}).</p>
       <table style="width:100%;border-collapse:collapse;margin:0 0 18px">
         ${linha("Nome", escaparHtml(nome))}
         ${linha("WhatsApp/telefone", escaparHtml(telefone))}
         ${email ? linha("E-mail", escaparHtml(email)) : ""}
         ${valor ? linha("Valor oferecido", `<strong>${escaparHtml(formatarPreco(valor))}</strong>`) : ""}
         ${troca ? linha("Carro na troca", escaparHtml(troca)) : ""}
         ${mensagem ? linha("Mensagem", escaparHtml(mensagem).replace(/\n/g, "<br>")) : ""}
       </table>
       ${botaoEmail("Responder pelo WhatsApp", linkZap)}
       <p style="margin:0;font-size:13px"><a href="${URL_SITE}${linkDoVeiculo(v)}" style="color:#FF6600">Ver o anúncio</a></p>`,
      "O AutoRegião não intermedia negócios. Antes de fechar, confira os dados do comprador.",
    ),
  });
  if (!envio.ok) {
    console.error("proposta: falha no e-mail:", envio.erro);
    return Response.json({ ok: false, erro: "Não foi possível enviar agora. Tente de novo ou use o WhatsApp." }, { status: 500 });
  }
  lista.push(agora);
  recentes.set(ip, lista);
  return Response.json({ ok: true });
}
