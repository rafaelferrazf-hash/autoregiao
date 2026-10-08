import Link from "next/link";
import Logo from "@/components/Logo";
import BotoesConta from "@/components/BotoesConta";
import Rodape from "@/components/Rodape";

// Moldura das páginas de conteúdo (ex.: Tabela FIPE): barra do topo + rodapé.
export default function PaginaSimples({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 768px) { .simples-links { display: none !important; } }
        .fipe-campos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        @media (max-width: 720px) { .fipe-campos { grid-template-columns: 1fr; } }
      `}</style>
      <nav style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}><Logo /></Link>
        <div className="simples-links" style={{ display: "flex", gap: 24 }}>
          {[["Buscar veículos", "/veiculos"], ["Tabela FIPE", "/tabela-fipe"], ["Anunciar", "/anunciar"]].map(([nome, href]) => (
            <Link key={href} href={href} style={{ textDecoration: "none", color: "#7A7670", fontSize: 13.5, fontWeight: 500 }}>{nome}</Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}><BotoesConta /></div>
      </nav>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "20px 16px 40px" }}>{children}</div>
      <Rodape />
    </main>
  );
}
