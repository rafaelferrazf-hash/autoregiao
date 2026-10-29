import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fontes e logo lidos do disco pelas imagens da página "Divulgar" (app/api/divulgar/artes.tsx).
  outputFileTracingIncludes: {
    "/api/divulgar/imagem": ["./assets/fontes/**", "./public/marca/logo-horizontal-branco.svg"],
  },
  async headers() {
    return [
      {
        // Proteções básicas em todas as páginas.
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Service worker do app: sempre a versão mais nova.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  // Endereços "quase certos" digitados à mão levam para a busca em vez de dar erro.
  async redirects() {
    return [
      { source: "/veiculo", destination: "/veiculos", permanent: true },
      { source: "/loja", destination: "/veiculos", permanent: true },
    ];
  },
};

export default nextConfig;
