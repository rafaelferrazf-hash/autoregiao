"use client";
import { useState } from "react";

// Página TEMPORÁRIA de diagnóstico do app de iPhone (link no rodapé, só aparece dentro do app).
// Testa a ponte com o iPhone (plugins do Capacitor), a permissão de notificação e a localização,
// mostrando o resultado na tela. Remover quando o "Perto de mim" e os avisos estiverem funcionando.
type Cap = { isNativePlatform?: () => boolean; getPlatform?: () => string; Plugins?: Record<string, Record<string, (...a: unknown[]) => Promise<unknown>>> };

function comTempo<T>(p: Promise<T>, ms: number): Promise<T | "SEM RESPOSTA"> {
  return Promise.race([p, new Promise<"SEM RESPOSTA">(r => setTimeout(() => r("SEM RESPOSTA"), ms))]);
}

export default function Diagnostico() {
  const [linhas, setLinhas] = useState<string[]>([]);
  const [rodando, setRodando] = useState(false);
  const log = (t: string) => setLinhas(l => [...l, t]);

  async function testar() {
    setLinhas([]);
    setRodando(true);
    const cap = (window as unknown as { Capacitor?: Cap }).Capacitor;
    log(`1. Capacitor: ${cap ? "sim" : "NÃO"} · nativo: ${cap?.isNativePlatform?.() ? "sim" : "não"} · plataforma: ${cap?.getPlatform?.() ?? "?"}`);
    log(`2. Plugins: ${cap?.Plugins ? Object.keys(cap.Plugins).join(", ") || "(vazio)" : "nenhum"}`);
    const p = cap?.Plugins ?? {};
    try { log(`3. App.getInfo: ${JSON.stringify(await comTempo(p.App?.getInfo?.() ?? Promise.resolve("sem plugin"), 8000))}`); } catch (e) { log(`3. App.getInfo ERRO: ${(e as Error).message}`); }
    try { log(`4. Notificação (situação): ${JSON.stringify(await comTempo(p.PushNotifications?.checkPermissions?.() ?? Promise.resolve("sem plugin"), 8000))}`); } catch (e) { log(`4. ERRO: ${(e as Error).message}`); }
    log("5. Pedindo permissão de notificação... (responda a janelinha, se aparecer)");
    try { log(`5. Resposta: ${JSON.stringify(await comTempo(p.PushNotifications?.requestPermissions?.() ?? Promise.resolve("sem plugin"), 30000))}`); } catch (e) { log(`5. ERRO: ${(e as Error).message}`); }
    log(`6. navigator.geolocation: ${"geolocation" in navigator ? "existe" : "NÃO existe"}`);
    log("7. Pedindo localização... (responda a janelinha, se aparecer)");
    const r = await comTempo(new Promise<string>(res => navigator.geolocation.getCurrentPosition(
      pos => res(`ok (precisão ${Math.round(pos.coords.accuracy)} m)`),
      err => res(`erro ${err.code}: ${err.message}`),
      { timeout: 20000, maximumAge: 0 },
    )), 30000);
    log(`7. Resposta: ${r}`);
    log("Fim. Tire um print desta tela.");
    setRodando(false);
  }

  return (
    <main style={{ padding: 20, fontSize: 14, lineHeight: 1.5, color: "#1A1917", background: "#fff", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 20, margin: "0 0 12px" }}>Diagnóstico do app</h1>
      <button type="button" onClick={testar} disabled={rodando} style={{ padding: "12px 18px", background: "#FF6600", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700 }}>
        {rodando ? "Testando..." : "Começar teste"}
      </button>
      <ol style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
        {linhas.map((l, i) => <li key={i} style={{ padding: "6px 0", borderBottom: "1px solid #eee", wordBreak: "break-word" }}>{l}</li>)}
      </ol>
    </main>
  );
}
