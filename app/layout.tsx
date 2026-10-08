import type { Metadata, Viewport } from "next";
import { Exo_2, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { NOME_SITE, URL_SITE } from "@/lib/site";
import AppInstalavel from "@/components/AppInstalavel";
import OuvinteNativo from "@/components/OuvinteNativo";
import BarraComparar from "@/components/BarraComparar";

// Fonte única do site (títulos, preços e textos), servida pelo próprio site.
const fonte = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

// Fonte dos títulos, do manual da marca (Exo 2: forte, com cara automotiva).
const fonteTitulos = Exo_2({
  variable: "--font-titulos",
  subsets: ["latin"],
});

const descricaoPadrao = "Encontre carros, motos e utilitários de lojas da sua região. Fale direto com o vendedor pelo WhatsApp. Anuncie seu veículo ou cadastre sua loja.";

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: "AutoRegião — O carro da sua região",
  description: descricaoPadrao,
  openGraph: {
    siteName: NOME_SITE,
    locale: "pt_BR",
    type: "website",
    title: "AutoRegião — O carro da sua região",
    description: descricaoPadrao,
    images: [{ url: "/marca/og.png", width: 1200, height: 630, alt: NOME_SITE }],
  },
  // App instalável (manifest em app/manifest.ts): ícone e nome no iPhone.
  appleWebApp: { capable: true, title: NOME_SITE, statusBarStyle: "default" },
  // Ícones: app/favicon.ico, app/icon.png e app/apple-icon.png (o Next gera as tags sozinho;
  // não declarar `icons` aqui, senão ele substitui as tags dos arquivos).
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fonte.variable} ${fonteTitulos.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <AppInstalavel />
        <OuvinteNativo />
        <BarraComparar />
      </body>
    </html>
  );
}
