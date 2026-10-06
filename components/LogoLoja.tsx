import Icone from "@/components/Icone";
// Logo/foto da loja; sem logo, mostra o quadradinho laranja com o ícone de loja.
export default function LogoLoja({ url, tamanho = 44, raio = 10 }: { url?: string | null; tamanho?: number; raio?: number }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- imagem do Storage, já reduzida no envio
      <img src={url} alt="Logo da loja" width={tamanho} height={tamanho}
        style={{ width: tamanho, height: tamanho, borderRadius: raio, objectFit: "cover", background: "#fff", flexShrink: 0, display: "block" }} />
    );
  }
  return (
    <div style={{ width: tamanho, height: tamanho, background: "#FF6600", borderRadius: raio, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><Icone nome="loja" tamanho={Math.round(tamanho * 0.55)} traco={1.6} /></div>
  );
}
