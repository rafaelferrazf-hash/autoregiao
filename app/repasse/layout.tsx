import type { Metadata } from "next";

// Área fechada (só lojistas): fora do Google.
export const metadata: Metadata = {
  title: "Repasse entre lojistas | AutoRegião",
  robots: { index: false, follow: false },
};

export default function LayoutRepasse({ children }: { children: React.ReactNode }) {
  return children;
}
