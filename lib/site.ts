// Endereço público do site, usado em links absolutos (pré-visualização no WhatsApp/Google).
// Na Vercel, VERCEL_PROJECT_PRODUCTION_URL é o domínio de produção (ex.: www.autoregiao.com.br).
export const URL_SITE =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const NOME_SITE = "AutoRegião";

// Responsável e contato (Termos de Uso e Política de Privacidade).
export const RESPONSAVEL = "Rafael Ferraz Barbosa";
export const CIDADE_RESPONSAVEL = "Teixeira de Freitas/BA";
export const EMAIL_CONTATO = "contato@autoregiao.com.br";
// WhatsApp de atendimento do AutoRegião.
export const WHATSAPP_ATENDIMENTO = { texto: "(73) 99820-9698", link: "https://wa.me/5573998209698" };

// Apps nas lojas: o slide "Baixe o app" e os botões só aparecem depois de publicados.
// Ao aprovar cada um, trocar para true (Android ~20/10; iPhone depois da revisão da Apple).
export const APP_ANDROID = { publicado: false, link: "https://play.google.com/store/apps/details?id=br.com.autoregiao.app" };
export const APP_IPHONE = { publicado: false, link: "https://apps.apple.com/br/app/id6820997830" };
