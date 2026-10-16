"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Icone from "@/components/Icone";
import type { FlutuantePublico } from "@/lib/banners";

// Anúncio patrocinado flutuante: bolinha com a logo + selo (ex.: "-10%") no canto da tela.
// Ao tocar, abre um cartão com a oferta e o botão. O "x" do cartão só fecha o cartão;
// o "x" pequeno da bolinha esconde o anúncio até o dia seguinte (neste aparelho).
// Dados: tabela anuncios_flutuantes (supabase/fase28); o sorteio e a contagem ficam em ExibirFlutuante.
export type AnuncioFlutuanteDados = FlutuantePublico;

const CHAVE = "autoregiao:flutuante-fechado";
const hoje = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

const semAssinatura = () => () => {};

function fechadoHoje(id: string) {
  try { return localStorage.getItem(CHAVE) === `${id}|${hoje()}`; } catch { return false; }
}

export default function AnuncioFlutuante({ anuncio, aoMostrar, aoAbrir, aoClicar }: {
  anuncio: AnuncioFlutuanteDados;
  aoMostrar?: () => void;
  aoAbrir?: () => void;
  aoClicar?: () => void;
}) {
  const fechado = useSyncExternalStore(semAssinatura, () => fechadoHoje(anuncio.id), () => false);
  const [escondido, setEscondido] = useState(false);
  const [aberto, setAberto] = useState(false);
  const visivel = !fechado && !escondido;
  useEffect(() => { if (visivel) aoMostrar?.(); }, [visivel, aoMostrar]);
  if (!visivel) return null;

  const esconderHoje = () => {
    try { localStorage.setItem(CHAVE, `${anuncio.id}|${hoje()}`); } catch {}
    setEscondido(true);
  };
  const externo = /^https?:\/\//i.test(anuncio.link);

  return (
    <div style={{ position: "fixed", left: 14, bottom: "calc(84px + env(safe-area-inset-bottom, 0px))", zIndex: 55 }}>
      {aberto && (
        <div role="dialog" aria-label={`Patrocinado: ${anuncio.anunciante}`}
          style={{ position: "absolute", left: 0, bottom: 84, width: "min(340px, calc(100vw - 28px))" }}>
          <button type="button" aria-label="Fechar" onClick={() => setAberto(false)}
            style={{ position: "absolute", right: 0, top: -46, width: 36, height: 36, borderRadius: 18, border: "none", background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#1A1917" }}>
            <Icone nome="fechar" tamanho={20} />
          </button>
          <a href={anuncio.link} target={externo ? "_blank" : undefined} rel={externo ? "noopener sponsored" : "sponsored"} onClick={aoClicar}
            style={{ display: "flex", gap: 12, alignItems: "center", background: "#fff", borderRadius: 14, padding: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.25)", textDecoration: "none", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={anuncio.logo_url} alt="" style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover", flexShrink: 0, background: "#F7F6F3" }} />
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: "#1A1917", lineHeight: 1.3 }}>{anuncio.titulo}</span>
              <span style={{ display: "block", fontSize: 12.5, color: "#7A7670", marginTop: 2 }}>{anuncio.anunciante}</span>
              {anuncio.texto && <span style={{ display: "block", fontSize: 13, color: "#16A34A", fontWeight: 700, marginTop: 3 }}>{anuncio.texto}</span>}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 7, fontSize: 13, fontWeight: 700, color: "#FF6600" }}>
                {anuncio.link.includes("wa.me") && <Icone nome="whatsapp" />}{anuncio.botao} →
              </span>
            </span>
            <span style={{ position: "absolute", right: 10, bottom: 8, fontSize: 10.5, color: "#9A968F" }}>Patrocinado</span>
          </a>
        </div>
      )}

      <div style={{ position: "relative", width: 72, height: 72 }}>
        <button type="button" aria-label={`Patrocinado: ${anuncio.anunciante}. Ver oferta`}
          onClick={() => { if (!aberto) aoAbrir?.(); setAberto(a => !a); }}
          style={{ width: 72, height: 72, borderRadius: 36, padding: 0, border: "3px solid #fff", background: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.28)", overflow: "hidden", cursor: "pointer", display: "block" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={anuncio.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </button>
        {anuncio.selo && (
          <span style={{ position: "absolute", left: "50%", bottom: -9, transform: "translateX(-50%)", background: "#16A34A", color: "#fff", fontSize: 12, fontWeight: 800, padding: "2px 9px", borderRadius: 12, whiteSpace: "nowrap", border: "2px solid #fff", pointerEvents: "none" }}>
            {anuncio.selo}
          </span>
        )}
        {!aberto && (
          <button type="button" aria-label="Esconder este anúncio hoje" onClick={esconderHoje}
            style={{ position: "absolute", right: -6, top: -6, width: 22, height: 22, borderRadius: 11, border: "none", background: "rgba(26,26,26,0.75)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
            <Icone nome="fechar" tamanho={13} />
          </button>
        )}
      </div>
    </div>
  );
}
