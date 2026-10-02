// Logo/foto da loja; sem logo, mostra o quadradinho laranja com 🏪.
export default function LogoLoja({ url, tamanho = 44, raio = 10 }: { url?: string | null; tamanho?: number; raio?: number }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- imagem do Storage, já reduzida no envio
      <img src={url} alt="Logo da loja" width={tamanho} height={tamanho}
        style={{ width: tamanho, height: tamanho, borderRadius: raio, objectFit: "cover", background: "#fff", flexShrink: 0, display: "block" }} />
    );
  }
  return (
    <div style={{ width: tamanho, height: tamanho, background: "#FF6600", borderRadius: raio, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(tamanho * 0.45), flexShrink: 0 }}>🏪</div>
  );
}
