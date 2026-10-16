"use client";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AnuncioFlutuante from "@/components/AnuncioFlutuante";
import type { FlutuantePublico } from "@/lib/banners";

// Mostra 1 anúncio flutuante pago (supabase/fase28) na página inicial, na busca e nas páginas por tipo.
// Não aparece na página do anúncio do carro (o espaço é do WhatsApp da loja) nem no painel/admin.
// Sorteio: um por visita (guardado na aba); na próxima visita pode ser outro.
const SORTEADO = "autoregiao:flutuante-sorteado";
const VISTO = "autoregiao:flutuante-visto:";

function paginaPermitida(caminho: string) {
  return caminho === "/" || caminho.startsWith("/veiculos") || /^\/(carros|motos|utilitarios)(\/|$)/.test(caminho);
}

function lerSessao(chave: string) { try { return sessionStorage.getItem(chave); } catch { return null; } }
function gravarSessao(chave: string, valor: string) { try { sessionStorage.setItem(chave, valor); } catch {} }

export default function ExibirFlutuante() {
  const caminho = usePathname() ?? "";
  const [anuncio, setAnuncio] = useState<FlutuantePublico | null>(null);

  useEffect(() => {
    let ativo = true;
    supabase.from("anuncios_flutuantes").select("id, anunciante, selo, titulo, texto, botao, link, logo_url").limit(20)
      .then(({ data }) => {
        const lista = (data ?? []) as FlutuantePublico[];
        if (!ativo || !lista.length) return;
        let escolhido = lista.find(a => a.id === lerSessao(SORTEADO));
        if (!escolhido) {
          escolhido = lista[Math.floor(Math.random() * lista.length)];
          gravarSessao(SORTEADO, escolhido.id);
        }
        setAnuncio(escolhido);
      });
    return () => { ativo = false; };
  }, []);

  const id = anuncio?.id;
  const contar = useCallback((tipo: "visualizacao" | "abertura" | "clique") => {
    if (id) supabase.rpc("contar_flutuante", { p_id: id, p_tipo: tipo }).then(() => {});
  }, [id]);
  // 1 visualização por visita.
  const aoMostrar = useCallback(() => {
    if (!id || lerSessao(VISTO + id)) return;
    gravarSessao(VISTO + id, "1");
    contar("visualizacao");
  }, [id, contar]);

  if (!anuncio || !paginaPermitida(caminho)) return null;
  return <AnuncioFlutuante anuncio={anuncio} aoMostrar={aoMostrar} aoAbrir={() => contar("abertura")} aoClicar={() => contar("clique")} />;
}
