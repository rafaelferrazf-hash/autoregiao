"use client";
import { useSyncExternalStore } from "react";
import { distanciaAte, lerPosicao, ouvirPosicao } from "@/lib/pertoDeMim";

// "· a 12 km" ao lado da cidade no card, depois que a pessoa usou o "Perto de mim".
export default function DistanciaCidade({ cidade }: { cidade: string | null | undefined }) {
  const posicao = useSyncExternalStore(ouvirPosicao, lerPosicao, () => null);
  const km = distanciaAte(cidade, posicao);
  if (km === null) return null;
  return <strong style={{ color: "#1A1917", fontWeight: 600, whiteSpace: "nowrap" }}>&nbsp;· a {km < 1 ? "menos de 1" : Math.round(km)} km</strong>;
}
