import Image from "next/image";

// Logo horizontal da marca (símbolo AR + AUTOREGIÃO) em vetor: public/marca/logo-horizontal.svg
// (proporção 1286×160; o .png de mesmo nome é a cópia para e-mails; "-branco.svg" é a versão para fundo escuro). No celular encolhe para caber ao lado dos botões.
export default function Logo({ altura = 40, fundoEscuro = false }: { altura?: number; fundoEscuro?: boolean }) {
  const largura = Math.round((altura * 1286) / 160);
  return (
    <Image src={fundoEscuro ? "/marca/logo-horizontal-branco.svg" : "/marca/logo-horizontal.svg"} alt="AutoRegião" width={largura} height={altura} priority
      style={{ width: `min(${largura}px, 60vw)`, height: "auto", display: "block" }} />
  );
}
