import Link from "next/link";
import Logo from "@/components/Logo";
import Icone from "@/components/Icone";

// Página de "não encontrado" do site todo (endereço errado, anúncio removido, loja inativa).
export default function NaoEncontrado() {
  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", padding: "0 16px", flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Logo />
        </Link>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ marginBottom: 8, color: "#FF6600" }}><Icone nome="carro" tamanho={56} traco={1.5} /></div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 8 }}>Página não encontrada</h1>
          <p style={{ fontSize: 14, color: "#7A7670", lineHeight: 1.5, marginBottom: 24 }}>
            O endereço pode estar errado, ou o anúncio já foi vendido ou removido pelo vendedor.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/veiculos" style={{ padding: "11px 20px", background: "#FF6600", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Buscar veículos</Link>
            <Link href="/" style={{ padding: "11px 20px", background: "#fff", color: "#1A1917", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Página inicial</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
