import { ImageResponse } from "next/og";
import { criarClienteAdmin } from "@/lib/supabase-servidor";
import { frasesDoVeiculo } from "@/lib/divulgar";
import { contextoDivulgar } from "../comum";
import { carregarRecursos, KitCartaz, KitFeed, KitStatus, PostVeiculoFeed, PostVeiculoStatus, qrDataUri, type VeiculoArte } from "../artes";

// Gera as imagens da página "Divulgar" (PNG). Só para o lojista logado, da própria loja.
//   ?peca=kit-status | kit-feed | kit-cartaz                     → kit da loja
//   ?peca=post-status | post-feed &veiculo=<id> [&frase=<texto>] → post de um carro
// Post COM frase conta no limite da semana (o mesmo carro com a mesma frase na mesma semana conta uma vez só).
const TAMANHOS: Record<string, [number, number]> = {
  "kit-status": [1080, 1920], "kit-feed": [1080, 1080], "kit-cartaz": [1240, 1754],
  "post-status": [1080, 1920], "post-feed": [1080, 1350],
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const peca = url.searchParams.get("peca") ?? "";
  if (!TAMANHOS[peca]) return Response.json({ erro: "Peça inválida." }, { status: 400 });

  const ctx = await contextoDivulgar();
  if ("erro" in ctx) return Response.json({ erro: ctx.erro }, { status: ctx.status });
  if (!ctx.acesso.liberado) return Response.json({ erro: "Recurso indisponível no seu plano." }, { status: 403 });

  const { fontes, logo } = await carregarRecursos();
  const [width, height] = TAMANHOS[peca];
  const opcoes = { width, height, fonts: fontes, headers: { "Cache-Control": "private, no-store" } };

  if (peca.startsWith("kit-")) {
    const qr = await qrDataUri(`https://www.autoregiao.com.br/loja/${ctx.loja.id}?utm_source=divulgar&utm_campaign=lojas`);
    const Arte = peca === "kit-status" ? KitStatus : peca === "kit-feed" ? KitFeed : KitCartaz;
    return new ImageResponse(<Arte loja={ctx.loja} qr={qr} logo={logo} />, opcoes);
  }

  const admin = criarClienteAdmin();
  const { data: v } = await admin.from("veiculos")
    .select("id, loja_id, status, marca, modelo, versao, ano, km, cambio, combustivel, preco, fipe_valor, fotos, condicoes, aceita_troca")
    .eq("id", url.searchParams.get("veiculo") ?? "").maybeSingle();
  if (!v || v.loja_id !== ctx.loja.id || v.status !== "ativo") return Response.json({ erro: "Anúncio não encontrado." }, { status: 404 });

  const veiculo: VeiculoArte = { ...v, abaixoFipe: !!(v.fipe_valor && v.preco && v.preco < v.fipe_valor) };
  const frase = url.searchParams.get("frase") || null;
  if (frase) {
    if (!frasesDoVeiculo(veiculo).includes(frase)) return Response.json({ erro: "Frase inválida para este anúncio." }, { status: 400 });
    const jaUsado = ctx.usados.some(u => u.veiculo_id === v.id && u.frase === frase);
    if (!jaUsado) {
      if (ctx.usados.length >= ctx.acesso.limiteFrases) {
        return Response.json({ erro: "Você já usou os posts com frase desta semana. Renova na segunda-feira." }, { status: 429 });
      }
      const { error } = await admin.from("posts_divulgacao").insert({ loja_id: ctx.loja.id, veiculo_id: v.id, frase, semana: ctx.semana });
      // 23505 = outra aba gravou o mesmo post ao mesmo tempo (já conta uma vez só)
      if (error && error.code !== "23505") {
        console.error("posts_divulgacao:", error.message);
        return Response.json({ erro: "Não foi possível gerar o post agora." }, { status: 500 });
      }
    }
  }
  const Arte = peca === "post-status" ? PostVeiculoStatus : PostVeiculoFeed;
  return new ImageResponse(<Arte loja={ctx.loja} v={veiculo} frase={frase} logo={logo} />, opcoes);
}
