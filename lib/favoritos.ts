"use client";
import { useSyncExternalStore } from "react";

// Favoritos do visitante (sem precisar de conta): lista de ids de anúncios guardada no navegador.
// Some se a pessoa limpar os dados do navegador ou trocar de aparelho — aceitável para "salvar para ver depois".

const CHAVE = "autoregiao:favoritos";
const EVENTO = "autoregiao:favoritos";
const MAXIMO = 100;
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

export function useFavoritos(): string[] {
  return useSyncExternalStore(assinar, ler, () => VAZIO);
}

export function alternarFavorito(id: string) {
  const lista = ler();
  gravar(lista.includes(id) ? lista.filter(x => x !== id) : [id, ...lista]);
}

// Tira da lista anúncios que não existem mais (vendidos/removidos).
export function manterFavoritos(ids: string[]) {
  const atuais = ler();
  const filtrada = atuais.filter(id => ids.includes(id));
  if (filtrada.length !== atuais.length) gravar(filtrada);
}
