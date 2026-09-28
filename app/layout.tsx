import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NOME_SITE, URL_SITE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
    images: [{ url: "/logo.png", alt: NOME_SITE }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
