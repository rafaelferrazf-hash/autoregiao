import { createHmac } from "node:crypto";
import { criarClienteAdmin } from "@/lib/supabase-servidor";

// Conta 1 página aberta (tabela visitas, supabase/fase25) para a aba "Visitas" do /admin.
// Anônimo: o visitante vira um código que muda todo dia (IP + navegador + data, embaralhados);
// não guardamos IP, nome, e-mail nem localização. Robôs não contam; o admin não chama esta rota.
export const dynamic = "force-dynamic";

const ROBO = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse|vercel/i;

function hojeBrasilia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

function tipoDePagina(caminho: string): string {
  if (caminho === "/") return "inicio";
  if (caminho.startsWith("/veiculos")) return "busca";
  if (caminho.startsWith("/veiculo/")) return "anuncio";
  if (/^\/(carros|motos|utilitarios)(\/|$)/.test(caminho)) return "vitrine";
  if (caminho.startsWith("/loja/")) return "loja";
  if (caminho.startsWith("/lojas")) return "lojas";
  if (caminho.startsWith("/tabela-fipe")) return "fipe";
  if (caminho.startsWith("/anunciar")) return "anunciar";
  if (caminho.startsWith("/painel")) return "painel";
  if (/^\/(login|cadastro|recuperar-senha|redefinir-senha)/.test(caminho)) return "conta";
  return "outras";
}

// O que a pessoa procurou: marca e texto na busca, ou o caminho da vitrine (/carros/toyota/corolla).
function buscaDe(caminho: string, consulta: string): string | null {
  const limpar = (s: string) => s.replace(/[-_+]/g, " ").replace(/\s+/g, " ").trim().toLowerCase().slice(0, 60);
  if (caminho.startsWith("/veiculos")) {
    const q = new URLSearchParams(consulta);
    const t = limpar([q.get("marca"), q.get("q")].filter(Boolean).join(" "));
    return t || null;
  }
  const m = caminho.match(/^\/(?:carros|motos|utilitarios)\/(.+)$/);
  if (m) return limpar(decodeURIComponent(m[1]).split("/").join(" ")) || null;
  return null;
}

function fonteDe(referrer: string): string | null {
  if (!referrer) return "direto";
  let host = "";
  try { host = new URL(referrer).hostname.replace(/^www\./, ""); } catch { return null; }
  if (host.endsWith("autoregiao.com.br") || host === "localhost") return null; // navegação dentro do site
  if (referrer.startsWith("android-app://")) return null;
  if (/google\./.test(host)) return "google";
  if (/instagram\./.test(host)) return "instagram";
  if (/facebook\.|fb\.|messenger\./.test(host)) return "facebook";
  if (/whatsapp\.|wa\.me/.test(host)) return "whatsapp";
  if (/bing\.|yahoo\.|duckduckgo\./.test(host)) return "outras buscas";
  return "outros sites";
}

export async function POST(request: Request) {
  let corpo: { caminho?: unknown; consulta?: unknown; referrer?: unknown; app?: unknown; primeira?: unknown };
  try { corpo = await request.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }

  const caminho = typeof corpo.caminho === "string" ? corpo.caminho.slice(0, 300) : "";
  if (!caminho.startsWith("/") || caminho.startsWith("/admin") || caminho.startsWith("/api")) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const consulta = typeof corpo.consulta === "string" ? corpo.consulta.slice(0, 500) : "";
  const referrer = typeof corpo.referrer === "string" ? corpo.referrer.slice(0, 300) : "";

  const navegador = request.headers.get("user-agent") || "";
  if (!navegador || ROBO.test(navegador)) return Response.json({ ok: true, contado: false });

  const origem = /AutoRegiaoApp/i.test(navegador) ? "iphone" : corpo.app === true ? "android" : "site";
  const aparelho = /Mobi|Android|iPhone|iPad|iPod/i.test(navegador) || origem !== "site" ? "celular" : "computador";

  const chave = process.env.SUPABASE_SERVICE_KEY;
  if (!chave) return Response.json({ ok: false }, { status: 500 });
  const dia = hojeBrasilia();
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "sem-ip";
  const visitante = createHmac("sha256", chave).update(`visita|${dia}|${ip}|${navegador}`).digest("hex").slice(0, 32);

  const { error } = await criarClienteAdmin().from("visitas").insert({
    dia,
    visitante,
    origem,
    aparelho,
    fonte: corpo.primeira === true ? fonteDe(referrer) : null,
    pagina: tipoDePagina(caminho),
    busca: buscaDe(caminho, consulta),
  });
  if (error) return Response.json({ ok: false }, { status: 500 });
  return Response.json({ ok: true, contado: true });
}
