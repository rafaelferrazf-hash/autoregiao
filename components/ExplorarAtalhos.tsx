import Link from "next/link";
import Icone, { type NomeIcone } from "@/components/Icone";

// "Explore" da página inicial: atalhos para as páginas prontas de busca (/carros, /carros/chevrolet...).
// Tipo em cartões com ícone; os demais grupos em uma linha que desliza para o lado no celular.
type Grupo = { titulo: string; links: [string, string][] };

const TIPOS: [string, string, NomeIcone, string?][] = [
  ["Carros", "/carros", "carro"],
  ["Motos", "/motos", "moto"],
  ["Utilitários", "/utilitarios", "utilitario"],
  ["Abaixo da FIPE", "/carros/abaixo-da-fipe", "abaixo", "#16A34A"],
];

export default function ExplorarAtalhos({ grupos }: { grupos: Grupo[] }) {
  return (
    <section style={{ marginTop: 36 }}>
      <style>{`
        .explorar-tipos { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 22px; }
        .explorar-linha { display: flex; gap: 8px; flex-wrap: wrap; }
        .explorar-chip:hover, .explorar-tipo:hover { border-color: #FF6600 !important; color: #FF6600 !important; }
        @media (max-width: 640px) {
          .explorar-tipos { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .explorar-linha { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin: 0 -16px; padding: 0 16px 2px; }
          .explorar-linha::-webkit-scrollbar { display: none; }
          .explorar-chip { flex-shrink: 0; }
        }
      `}</style>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1A1917", margin: "0 0 14px" }}>Explore</h2>

      <div className="explorar-tipos">
        {TIPOS.map(([nome, href, icone, cor]) => (
          <Link key={href} href={href} className="explorar-tipo"
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px", background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, textDecoration: "none", color: "#1A1917", fontSize: 14, fontWeight: 700 }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: cor ? "#DCFCE7" : "#FFF0E6", color: cor ?? "#FF6600", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icone nome={icone} tamanho={20} />
            </span>
            <span style={{ lineHeight: 1.2 }}>{nome}</span>
          </Link>
        ))}
      </div>

      {grupos.filter(g => g.links.length > 0).map(g => (
        <div key={g.titulo} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>{g.titulo}</div>
          <div className="explorar-linha">
            {g.links.map(([nome, href]) => (
              <Link key={href} href={href} className="explorar-chip"
                style={{ padding: "8px 14px", background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 20, fontSize: 13, color: "#1A1917", textDecoration: "none", whiteSpace: "nowrap" }}>
                {nome}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
