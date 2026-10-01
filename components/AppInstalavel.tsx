"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

// 1) Registra o service worker (página "sem internet" e requisito do app instalável).
// 2) Mostra, no celular, um convite discreto para instalar o app:
//    - Android/Chrome: botão "Instalar" (evento beforeinstallprompt);
//    - iPhone/Safari: instrução "Compartilhar → Adicionar à Tela de Início" (a Apple não tem botão).
// Some se já estiver instalado ou se a pessoa fechar o convite (lembra por 30 dias).

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const CHAVE = "autoregiao:convite-app-fechado";
const TRINTA_DIAS = 30 * 86_400_000;

const semAssinatura = () => () => {};
function convitePermitido() {
  if (window.matchMedia("(display-mode: standalone)").matches) return false; // já é o app
  if (!/android|iphone|ipad|ipod/i.test(navigator.userAgent)) return false;  // só no celular
  try {
    const fechado = Number(localStorage.getItem(CHAVE) || 0);
    return Date.now() - fechado > TRINTA_DIAS;
  } catch {
    return true;
  }
}
const ehIphone = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);

// Páginas onde o convite atrapalharia: anúncio (tem a barra fixa de WhatsApp/Ligar embaixo),
// cadastro de anúncio, painel e admin.
const SEM_CONVITE = /^\/(veiculo\/|painel|admin|pagamento|offline)/;

export default function AppInstalavel() {
  const caminho = usePathname();
  const permitido = useSyncExternalStore(semAssinatura, convitePermitido, () => false);
  const iphone = useSyncExternalStore(semAssinatura, ehIphone, () => false);
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [fechado, setFechado] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && location.hostname !== "localhost") {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
    }
    const guardar = (e: Event) => { e.preventDefault(); setEvento(e as EventoInstalar); };
    window.addEventListener("beforeinstallprompt", guardar);
    const instalado = () => setFechado(true);
    window.addEventListener("appinstalled", instalado);
    return () => {
      window.removeEventListener("beforeinstallprompt", guardar);
      window.removeEventListener("appinstalled", instalado);
    };
  }, []);

  function fechar() {
    setFechado(true);
    try { localStorage.setItem(CHAVE, String(Date.now())); } catch { /* sem armazenamento */ }
  }

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    if (outcome === "accepted") setFechado(true);
    setEvento(null);
  }

  if (!permitido || fechado || (!evento && !iphone) || SEM_CONVITE.test(caminho ?? "")) return null;

  return (
    <div role="dialog" aria-label="Instalar o app AutoRegião"
      style={{ position: "fixed", left: 12, right: 12, bottom: 12, zIndex: 60, background: "#1A1917", color: "#fff", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 6px 24px rgba(0,0,0,0.25)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icones/icone-192.png" alt="" width={40} height={40} style={{ borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.4 }}>
        <strong>Instale o app AutoRegião</strong>
        <div style={{ color: "#C9C5BD", fontSize: 12 }}>
          {evento ? "Acesso rápido pela tela inicial do celular." : <>Toque em <strong style={{ color: "#fff" }}>Compartilhar</strong> ⎋ e depois em <strong style={{ color: "#fff" }}>Adicionar à Tela de Início</strong>.</>}
        </div>
      </div>
      {evento && (
        <button onClick={instalar} style={{ background: "#FF6600", color: "#fff", border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Instalar</button>
      )}
      <button onClick={fechar} aria-label="Fechar" style={{ background: "none", border: "none", color: "#A8A49D", fontSize: 20, cursor: "pointer", padding: 4, flexShrink: 0 }}>×</button>
    </div>
  );
}
