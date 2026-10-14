"use client";
import { useState, type CSSProperties, type InputHTMLAttributes } from "react";
import Icone from "@/components/Icone";

// Campo de senha com botão de olho para mostrar/esconder o que foi digitado.
export default function CampoSenha({ style, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { style?: CSSProperties }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input {...props} type={visivel ? "text" : "password"} autoCapitalize="none" autoCorrect="off" spellCheck={false}
        style={{ ...style, paddingRight: 46 }} />
      <button type="button" onClick={() => setVisivel(v => !v)} aria-label={visivel ? "Esconder senha" : "Mostrar senha"}
        style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#7A7670", padding: 0 }}>
        <Icone nome={visivel ? "olhoFechado" : "olho"} tamanho={20} />
      </button>
    </div>
  );
}
