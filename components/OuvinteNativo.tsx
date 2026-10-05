"use client";
import { useEffect } from "react";
import { ouvirToqueEmNotificacao } from "@/lib/nativo";

// Só faz algo dentro do app de iPhone: abre a página certa ao tocar numa notificação de alerta.
export default function OuvinteNativo() {
  useEffect(() => ouvirToqueEmNotificacao(), []);
  return null;
}
