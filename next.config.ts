import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Endereços "quase certos" digitados à mão levam para a busca em vez de dar erro.
  async redirects() {
    return [
      { source: "/veiculo", destination: "/veiculos", permanent: true },
      { source: "/loja", destination: "/veiculos", permanent: true },
    ];
  },
};

export default nextConfig;
