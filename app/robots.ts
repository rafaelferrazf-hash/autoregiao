import type { MetadataRoute } from "next";
import { URL_SITE } from "@/lib/site";

// Instruções para o Google: pode ler o site público; áreas privadas e páginas de links de e-mail, não.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/painel", "/admin", "/api/", "/alerta", "/pagamento", "/redefinir-senha", "/recuperar-senha"],
    },
    sitemap: `${URL_SITE}/sitemap.xml`,
  };
}
