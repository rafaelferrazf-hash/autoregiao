import Image from "next/image";

// Logo horizontal da marca (símbolo AR + AUTOREGIÃO). Arquivo: public/marca/logo-horizontal.png
// (1286×160, gerado a partir do manual da marca). No celular encolhe para caber ao lado dos botões.
export default function Logo({ altura = 34 }: { altura?: number }) {
  const largura = Math.round((altura * 1286) / 160);
  return (
    <Image src="/marca/logo-horizontal.png" alt="AutoRegião" width={largura} height={altura} priority
      style={{ width: `min(${largura}px, 60vw)`, height: "auto", display: "block" }} />
  );
}
