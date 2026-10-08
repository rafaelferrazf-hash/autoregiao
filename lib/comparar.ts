"use client";
import { useSyncExternalStore } from "react";

// "Comparar veículos": até 3 anúncios escolhidos pelo visitante, guardados no navegador (igual aos favoritos).

const CHAVE = "autoregiao:comparar";
const EVENTO = "autoregiao:comparar";
export const MAXIMO_COMPARAR = 3;
const MAXIMO = MAXIMO_COMPARAR;
const VAZIO: string[] = [];

let cacheTexto: string | null = null;
let cacheLista: string[] = VAZIO;

function ler(): string[] {
  let texto: string | null = null;
  try { texto = localStorage.getItem(CHAVE); } catch { /* navegador sem acesso ao armazenamento */ }
  if (texto === cacheTexto) return cacheLista;
  cacheTexto = texto;
  try {
    const v = JSON.parse(texto ?? "[]");
    cacheLista = Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : VAZIO;
  } catch {
    cacheLista = VAZIO;
  }
  return cacheLista;
}

function gravar(lista: string[]) {
  try { localStorage.setItem(CHAVE, JSON.stringify(lista.slice(0, MAXIMO))); } catch { /* sem armazenamento: não salva */ }
  window.dispatchEvent(new Event(EVENTO));
}

function assinar(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar); // outras abas
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

export function useComparar(): string[] {
  return useSyncExternalStore(assinar, ler, () => VAZIO);
}

// Devolve false quando já há 3 escolhidos (o botão avisa).
export function alternarComparar(id: string): boolean {
  const lista = ler();
  if (lista.includes(id)) { gravar(lista.filter(x => x !== id)); return true; }
  if (lista.length >= MAXIMO) return false;
  gravar([...lista, id]);
  return true;
}

export function limparComparar() {
  gravar([]);
}
