"use client";
import { useSyncExternalStore } from "react";

// Recursos do app de iPhone (projeto em app-ios/, Capacitor). O app abre o próprio site e injeta
// window.Capacitor; aqui o site usa os plugins nativos sem depender do pacote do Capacitor.
// No navegador comum (e no app Android) nada disso existe e as funções devolvem null/false.

type Ouvinte = { remove: () => Promise<void> };
type PluginPush = {
  requestPermissions: () => Promise<{ receive: string }>;
  register: () => Promise<void>;
  addListener: (evento: string, fn: (dados: unknown) => void) => Promise<Ouvinte>;
};
type PluginShare = { share: (o: { title?: string; text?: string; url?: string; dialogTitle?: string }) => Promise<unknown> };
type Capacitor = { isNativePlatform?: () => boolean; Plugins?: Record<string, unknown> };

function capacitor(): Capacitor | null {
  if (typeof window === "undefined") return null;
  const cap = (window as unknown as { Capacitor?: Capacitor }).Capacitor;
  return cap?.isNativePlatform?.() ? cap : null;
}

function plugin<T>(nome: string): T | null {
  return (capacitor()?.Plugins?.[nome] as T | undefined) ?? null;
}

const semAssinatura = () => () => {};
export function useAppNativo(): boolean {
  return useSyncExternalStore(semAssinatura, () => capacitor() !== null, () => false);
}

// Menu de compartilhar do iPhone. Devolve false se não estiver no app (aí o site usa navigator.share).
export async function compartilharNativo(o: { title: string; text: string; url: string }): Promise<boolean> {
  const share = plugin<PluginShare>("Share");
  if (!share) return false;
  try { await share.share({ ...o, dialogTitle: "Compartilhar anúncio" }); } catch { /* cancelado */ }
  return true;
}

// Pede permissão de notificação e devolve o token do aparelho (APNs), ou null se a pessoa negar.
export async function pedirTokenPush(): Promise<string | null> {
  const push = plugin<PluginPush>("PushNotifications");
  if (!push) return null;
  // Nunca deixa o botão travado em "Ativando...": se o iPhone não responder, desiste em 60 s.
  const permissao = await Promise.race([
    push.requestPermissions(),
    new Promise<{ receive: string }>(resolve => setTimeout(() => resolve({ receive: "sem-resposta" }), 60_000)),
  ]);
  if (permissao.receive !== "granted") return null;
  // Começa a "escutar" ANTES de pedir o código: quando o iPhone já tem o código guardado, ele responde
  // na hora e a resposta se perderia (o botão ficava parado em "Ativando...").
  let resolver: (token: string | null) => void = () => {};
  const resposta = new Promise<string | null>(r => { resolver = r; });
  const ouvintes = await Promise.all([
    push.addListener("registration", d => resolver((d as { value?: string }).value ?? null)),
    push.addListener("registrationError", () => resolver(null)),
  ]).catch(() => [] as Ouvinte[]);
  push.register().catch(() => resolver(null));
  const tempo = setTimeout(() => resolver(null), 20_000);
  const token = await resposta;
  clearTimeout(tempo);
  ouvintes.forEach(o => o.remove().catch(() => {}));
  return token;
}

// Toque numa notificação: abre a página que veio junto (ex.: a busca do alerta).
export function ouvirToqueEmNotificacao(): () => void {
  const push = plugin<PluginPush>("PushNotifications");
  if (!push) return () => {};
  const ouvinte = push.addListener("pushNotificationActionPerformed", d => {
    const url = (d as { notification?: { data?: { url?: string } } }).notification?.data?.url;
    if (url && url.startsWith("/")) window.location.href = url;
  });
  return () => { ouvinte.then(o => o.remove()).catch(() => {}); };
}
