"use client";
import { useEffect, useRef, useState } from "react";
import { urlFotoCard } from "@/lib/fotoCard";

// Foto do card: tenta a versão pequena (rápida, pouco tráfego); se ela não existir, usa a grande.
export default function FotoCard({ src, alt }: { src: string; alt: string }) {
  const [usarGrande, setUsarGrande] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // Página que vem pronta do servidor: o erro pode acontecer antes do React "ligar" a página.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0 && !usarGrande) img.dispatchEvent(new Event("error"));
  }, [usarGrande]);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} src={usarGrande ? src : urlFotoCard(src)} alt={alt} loading="lazy" decoding="async"
      onError={() => setUsarGrande(true)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  );
}
