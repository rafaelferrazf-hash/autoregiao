"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Zoom "de espiar" na foto do card (como no Instagram): com dois dedos a foto amplia por cima da tela
// enquanto os dedos estão nela; ao soltar, ela volta ao lugar. Só a foto amplia (a página não).
// O toque com dois dedos não abre o anúncio.

type Estado = { src: string; rect: DOMRect; ox: number; oy: number; s: number; dx: number; dy: number; voltando: boolean };

export default function PincaFoto({ children }: { children: React.ReactNode }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<Estado | null>(null);
  const gesto = useRef<{ d0: number; mx: number; my: number; base: Estado } | null>(null);
  const fimPinca = useRef(0);

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const meio = (t: TouchList) => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });

    function aoTocar(e: TouchEvent) {
      if (e.touches.length !== 2 || gesto.current) return;
      const m = meio(e.touches);
      // A foto visível no ponto da pinça (o card pode ter várias fotos deslizáveis).
      const alvo = document.elementFromPoint(m.x, m.y);
      const img = alvo instanceof HTMLImageElement && el!.contains(alvo) ? alvo : el!.querySelector("img");
      if (!img) return;
      e.preventDefault();
      const rect = img.getBoundingClientRect();
      const base: Estado = { src: img.currentSrc || img.src, rect, ox: m.x - rect.left, oy: m.y - rect.top, s: 1, dx: 0, dy: 0, voltando: false };
      gesto.current = { d0: dist(e.touches) || 1, mx: m.x, my: m.y, base };
      setZoom(base);
    }
    function aoMover(e: TouchEvent) {
      const g = gesto.current;
      if (!g) return;
      if (e.cancelable) e.preventDefault();
      if (e.touches.length < 2) return;
      const m = meio(e.touches);
      const s = Math.max(1, Math.min(4, dist(e.touches) / g.d0));
      setZoom({ ...g.base, s, dx: m.x - g.mx, dy: m.y - g.my });
    }
    function aoSoltar(e: TouchEvent) {
      if (!gesto.current || e.touches.length >= 2) return;
      const base = gesto.current.base;
      gesto.current = null;
      fimPinca.current = Date.now();
      setZoom({ ...base, voltando: true });
      window.setTimeout(() => setZoom(null), 220);
    }
    // Clique que vem logo depois da pinça não abre o anúncio.
    function aoClicar(e: MouseEvent) {
      if (Date.now() - fimPinca.current < 500) { e.preventDefault(); e.stopPropagation(); }
    }

    el.addEventListener("touchstart", aoTocar, { passive: false });
    el.addEventListener("touchmove", aoMover, { passive: false });
    el.addEventListener("touchend", aoSoltar);
    el.addEventListener("touchcancel", aoSoltar);
    el.addEventListener("click", aoClicar, true);
    return () => {
      el.removeEventListener("touchstart", aoTocar);
      el.removeEventListener("touchmove", aoMover);
      el.removeEventListener("touchend", aoSoltar);
      el.removeEventListener("touchcancel", aoSoltar);
      el.removeEventListener("click", aoClicar, true);
    };
  }, []);

  const sobreposicao = zoom && createPortal(
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 2500, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: zoom.voltando ? 0 : Math.min(0.6, (zoom.s - 1) * 0.6), transition: zoom.voltando ? "opacity 0.2s" : "none" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={zoom.src} alt="" style={{
        position: "absolute", left: zoom.rect.left, top: zoom.rect.top, width: zoom.rect.width, height: zoom.rect.height,
        objectFit: "cover", borderRadius: 0, transformOrigin: `${zoom.ox}px ${zoom.oy}px`,
        transform: zoom.voltando ? "none" : `translate(${zoom.dx}px, ${zoom.dy}px) scale(${zoom.s})`,
        transition: zoom.voltando ? "transform 0.2s ease" : "none",
      }} />
    </div>,
    document.body,
  );

  return (
    <div ref={caixa} style={{ position: "absolute", inset: 0, touchAction: "pan-x pan-y" }}>
      {children}
      {sobreposicao}
    </div>
  );
}
