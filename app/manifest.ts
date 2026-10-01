import type { MetadataRoute } from "next";

// Manifesto do app instalável (PWA): nome, ícone e cores quando o site é "instalado" no celular.
// É também a base do app da Google Play (TWA), que abre este mesmo site em tela cheia.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "AutoRegião — Carros da sua região",
    short_name: "AutoRegião",
    description: "Carros, motos e utilitários de lojas e particulares da sua região. Fale direto com o vendedor pelo WhatsApp.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1A1A1A", // tela de abertura do app: mesmo grafite do ícone
    theme_color: "#FFFFFF",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icones/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icones/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icones/icone-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icones/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Atalhos ao segurar o ícone do app no Android.
    shortcuts: [
      { name: "Buscar veículos", url: "/veiculos", icons: [{ src: "/icones/icone-192.png", sizes: "192x192" }] },
      { name: "Favoritos", url: "/favoritos", icons: [{ src: "/icones/icone-192.png", sizes: "192x192" }] },
      { name: "Meu painel", url: "/painel", icons: [{ src: "/icones/icone-192.png", sizes: "192x192" }] },
    ],
  };
}
