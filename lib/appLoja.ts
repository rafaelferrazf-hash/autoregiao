"use client";
import { useSyncExternalStore } from "react";

// Detecta se o site está aberto DENTRO dos apps das lojas (Google Play / App Store).
// As lojas não deixam vender serviço digital fora do pagamento delas dentro do app, então nesses apps
// escondemos preços, compra de planos e cupons — o lojista assina pelo site, no navegador.
// O app instalável pelo navegador (PWA) não conta: ali não há loja de apps no meio.
//
// - Android (TWA): abre com ?origem=app (start URL no gerador do app) e/ou referrer android-app://.
// - iPhone: o app acrescenta "AutoRegiaoApp" ao user agent.
// A marca fica na sessionStorage da aba do app, que vale enquanto o app estiver aberto.

const CHAVE = "autoregiao:app-loja";
const semAssinatura = () => () => {};

function detectar(): boolean {
  if (/AutoRegiaoApp/i.test(navigator.userAgent)) return true;
  try {
    const veioDoApp = new URLSearchParams(location.search).get("origem") === "app"
      || document.referrer.startsWith("android-app://br.com.autoregiao.app");
    if (veioDoApp) sessionStorage.setItem(CHAVE, "1");
    return sessionStorage.getItem(CHAVE) === "1";
  } catch {
    return false;
  }
}

export function useEmAppDaLoja(): boolean {
  return useSyncExternalStore(semAssinatura, detectar, () => false);
}
