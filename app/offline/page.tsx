import BotaoTentarDeNovo from "./BotaoTentarDeNovo";

// Mostrada pelo app (service worker) quando o celular está sem internet.
export const metadata = { title: "Sem internet — AutoRegião", robots: { index: false } };

export default function SemInternet() {
  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 360, textAlign: "center" }}>
        {/* Ícone já guardado pelo service worker (funciona sem internet). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icones/icone-192.png" alt="AutoRegião" width={72} height={72} style={{ marginBottom: 16, borderRadius: 16 }} />
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1A1917", marginBottom: 8 }}>Sem conexão com a internet</h1>
        <p style={{ fontSize: 14, color: "#7A7670", lineHeight: 1.5, marginBottom: 20 }}>
          Confira o Wi-Fi ou os dados móveis e tente de novo. Os anúncios aparecem assim que a conexão voltar.
        </p>
        <BotaoTentarDeNovo />
      </div>
    </main>
  );
}
