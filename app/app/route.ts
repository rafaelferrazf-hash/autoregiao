import { APP_ANDROID, APP_IPHONE } from "@/lib/site";

// www.autoregiao.com.br/app — endereço do QR code "Baixe o app" dos folhetos.
// Android → Google Play; iPhone/iPad → App Store; computador ou app ainda não publicado → página inicial.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const ua = request.headers.get("user-agent") || "";
  let destino = new URL("/?utm_source=qr&utm_campaign=app", request.url).toString();
  if (/Android/i.test(ua) && APP_ANDROID.publicado) destino = APP_ANDROID.link;
  else if (/iPhone|iPad|iPod/i.test(ua) && APP_IPHONE.publicado) destino = APP_IPHONE.link;
  return Response.redirect(destino, 302);
}
