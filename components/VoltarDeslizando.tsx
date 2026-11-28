"use client";
import { useEffect, useRef, useState } from "react";

// App do iPhone (App Store): o WKWebView do app não tem o gesto de "arrastar da borda esquerda para voltar".
// Aqui o próprio site faz esse gesto, só dentro do app do iPhone (user agent "AutoRegiaoApp"):
// encostar o dedo na borda esquerda e arrastar para a direita volta à página anterior.
// Mostra uma bolinha com seta acompanhando o dedo. Não depende de nova versão do app.

const BORDA = 28;     // px a partir da borda esquerda onde o gesto pode começar
const DISTANCIA = 90; // px arrastados para a direita para voltar

function ehAppIphone() {
  return typeof navigator !== "undefined" && /AutoRegiaoApp/i.test(navigator.userAgent) && /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
}

export default function VoltarDeslizando() {
  const [arrasto, setArrasto] = useState(0); // quanto o dedo já andou (0 = escondido)
  const inicio = useRef<{ x: number; y: number } | null>(null);
  const ativo = useRef(false);
  const andou = useRef(0); // mesma distância do estado, para ler ao soltar o dedo

  useEffect(() => {
    if (!ehAppIphone()) return;

    function aoTocar(e: TouchEvent) {
      if (e.touches.length !== 1) { inicio.current = null; return; }
      const t = e.touches[0];
      if (t.clientX > BORDA || window.history.length < 2) { inicio.current = null; return; }
      inicio.current = { x: t.clientX, y: t.clientY };
      ativo.current = false;
    }
    function aoMover(e: TouchEvent) {
      if (!inicio.current) return;
      const t = e.touches[0];
      const dx = t.clientX - inicio.current.x;
      const dy = t.clientY - inicio.current.y;
      if (!ativo.current) {
        if (Math.abs(dy) > 14 && Math.abs(dy) > dx) { inicio.current = null; setArrasto(0); return; } // rolando a página
        if (dx > 10) ativo.current = true;
      }
      if (ativo.current) {
        if (e.cancelable) e.preventDefault();
        andou.current = Math.max(0, dx);
        setArrasto(andou.current);
      }
    }
    function aoSoltar() {
      const voltar = ativo.current && andou.current >= DISTANCIA;
      inicio.current = null;
      ativo.current = false;
      andou.current = 0;
      setArrasto(0);
      if (voltar) window.history.back();
    }

    document.addEventListener("touchstart", aoTocar, { passive: true });
    document.addEventListener("touchmove", aoMover, { passive: false });
    document.addEventListener("touchend", aoSoltar, { passive: true });
    document.addEventListener("touchcancel", aoSoltar, { passive: true });
    return () => {
      document.removeEventListener("touchstart", aoTocar);
      document.removeEventListener("touchmove", aoMover);
      document.removeEventListener("touchend", aoSoltar);
      document.removeEventListener("touchcancel", aoSoltar);
    };
  }, []);

  if (arrasto <= 0) return null;
  const pronto = arrasto >= DISTANCIA;
  const x = Math.min(arrasto, DISTANCIA + 20) - 44;
  return (
    <div aria-hidden style={{
      position: "fixed", left: 0, top: "50%", zIndex: 3000, pointerEvents: "none",
      transform: `translate(${x}px, -50%)`, width: 44, height: 44, borderRadius: "50%",
      background: pronto ? "#FF6600" : "rgba(26,26,26,0.75)", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 10px rgba(0,0,0,0.25)", transition: "background 0.15s",
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6l6 6" /></svg>
    </div>
  );
}
