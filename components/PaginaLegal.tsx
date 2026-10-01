import Link from "next/link";
import Logo from "@/components/Logo";

// Moldura das páginas /termos e /privacidade (texto longo, leitura confortável no celular).
export default function PaginaLegal({ titulo, atualizadoEm, children }: { titulo: string; atualizadoEm: string; children: React.ReactNode }) {
  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>
      <style>{`
        .legal h2 { font-family: inherit; font-size: 18px; font-weight: 800; color: #1A1917; margin: 28px 0 10px; }
        .legal p, .legal li { font-size: 14.5px; line-height: 1.7; color: #3F3D39; }
        .legal p { margin: 0 0 12px; }
        .legal ul { margin: 0 0 12px; padding-left: 20px; }
        .legal li { margin-bottom: 6px; }
        .legal a { color: #FF6600; }
        .legal strong { color: #1A1917; }
      `}</style>
      <nav style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Logo />
        </Link>
        <Link href="/" style={{ fontSize: 13, color: "#7A7670", textDecoration: "none" }}>← Voltar ao site</Link>
      </nav>
      <article className="legal" style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px 56px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1A1917", marginBottom: 4 }}>{titulo}</h1>
        <div style={{ fontSize: 13, color: "#7A7670", marginBottom: 24 }}>Última atualização: {atualizadoEm}</div>
        {children}
        <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid #E8E6E1", fontSize: 13, color: "#7A7670", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/termos" style={{ color: "#7A7670" }}>Termos de Uso</Link>
          <Link href="/privacidade" style={{ color: "#7A7670" }}>Política de Privacidade</Link>
        </div>
      </article>
    </main>
  );
}
