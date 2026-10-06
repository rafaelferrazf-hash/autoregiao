import Icone from "@/components/Icone";
// Mapinha da loja (Google Maps incorporado, sem chave) + botões "Como chegar" no Google Maps e no Waze.
// No celular, os botões abrem o app de navegação já com o destino — é só tocar em "Iniciar".
// Só aparece quando a loja cadastrou o endereço.

type Props = { endereco: string; cidade?: string | null; estado?: string | null; nome?: string | null; altura?: number };

export default function MapaLoja({ endereco, cidade, estado, nome, altura = 170 }: Props) {
  const destino = [endereco, cidade, estado, "Brasil"].filter(Boolean).join(", ");
  const q = encodeURIComponent(destino);
  const botao = {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 8px",
    borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none", minHeight: 40,
  } as const;

  return (
    <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
      <iframe
        title={`Mapa: ${nome || "localização da loja"}`}
        src={`https://maps.google.com/maps?q=${q}&z=16&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ display: "block", width: "100%", height: altura, border: 0 }}
      />
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontSize: 12, color: "#7A7670", marginBottom: 8, lineHeight: 1.4 }}><Icone nome="local" /> {destino.replace(/, Brasil$/, "")}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener noreferrer"
            style={{ ...botao, background: "#FF6600", color: "#fff" }}>
            <Icone nome="navegar" /> Como chegar
          </a>
          <a href={`https://waze.com/ul?q=${q}&navigate=yes`} target="_blank" rel="noopener noreferrer"
            style={{ ...botao, background: "#fff", color: "#1A1917", border: "1.5px solid #E8E6E1" }}>
            Waze
          </a>
        </div>
      </div>
    </div>
  );
}
