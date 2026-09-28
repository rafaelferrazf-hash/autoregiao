// Endereço público do site, usado em links absolutos (pré-visualização no WhatsApp/Google).
// Na Vercel, VERCEL_PROJECT_PRODUCTION_URL é o domínio de produção (ex.: www.autoregiao.com.br).
export const URL_SITE =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const NOME_SITE = "AutoRegião";

// Responsável e contato (Termos de Uso e Política de Privacidade).
export const RESPONSAVEL = "Rafael Ferraz";
export const CIDADE_RESPONSAVEL = "Teixeira de Freitas/BA";
export const EMAIL_CONTATO = "contato@autoregiao.com.br";
