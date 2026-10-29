"use client";
import Link from "next/link";
import Logo from "@/components/Logo";
import Icone from "@/components/Icone";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usuarioAtual } from "@/lib/dados/usuario";
import { buscarLojaDoUsuario } from "@/lib/dados/lojas";
import { frasesDoVeiculo } from "@/lib/divulgar";
import { formatarPreco } from "@/lib/formatar";
import { linkDoVeiculo } from "@/lib/linkVeiculo";
import { useEmAppDaLoja } from "@/lib/appLoja";
import { useAppNativo } from "@/lib/nativo";

// Página "Divulgar" (lib/divulgar.ts): post de um carro (com frase de destaque opcional) e kit da loja,
// em imagens prontas para Status, Stories e feed. As imagens vêm de /api/divulgar/imagem.
type Carro = {
  id: string; nome: string; marca: string | null; modelo: string | null; ano: string | null; preco: number | null;
  fipe_valor: number | null; aceita_troca: boolean | null; condicoes: string[] | null; fotos: string[] | null;
};
type Situacao = { liberado: boolean; limiteFrases: number; usados: { veiculo_id: string; frase: string }[] };
type Gerada = { url: string; blob: Blob; nome: string };

const KIT = [
  { peca: "kit-status", titulo: "Status e Stories", nome: "status" },
  { peca: "kit-feed", titulo: "Post quadrado", nome: "post-quadrado" },
  { peca: "kit-cartaz", titulo: "Cartaz para o balcão (A4)", nome: "cartaz-A4" },
] as const;

async function gerar(params: Record<string, string>): Promise<Gerada | { erro: string }> {
  const r = await fetch("/api/divulgar/imagem?" + new URLSearchParams(params));
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    return { erro: (j as { erro?: string }).erro || "Não foi possível gerar a imagem. Tente de novo." };
  }
  const blob = await r.blob();
  return { url: URL.createObjectURL(blob), blob, nome: "autoregiao" };
}

export default function Divulgar() {
  const emApp = useEmAppDaLoja();
  const appIphone = useAppNativo();
  const [carregado, setCarregado] = useState(false);
  const [situacao, setSituacao] = useState<Situacao | null>(null);
  const [carros, setCarros] = useState<Carro[]>([]);
  const [carroId, setCarroId] = useState("");
  const [frase, setFrase] = useState("");
  const [formato, setFormato] = useState<"post-status" | "post-feed">("post-status");
  const [post, setPost] = useState<Gerada | null>(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [kit, setKit] = useState<Record<string, Gerada>>({});
  const [segurar, setSegurar] = useState<string | null>(null); // iPhone: imagem aberta para "tocar e segurar"
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await usuarioAtual();
      if (!user) { window.location.href = "/login?next=/painel/divulgar"; return; }
      const { loja } = await buscarLojaDoUsuario(user.id);
      const r = await fetch("/api/divulgar");
      const s = r.ok ? (await r.json()) as Situacao : null;
      setSituacao(s);
      if (loja && s?.liberado) {
        const { data } = await supabase.from("veiculos")
          .select("id, nome, marca, modelo, ano, preco, fipe_valor, aceita_troca, condicoes, fotos")
          .eq("loja_id", loja.id).eq("status", "ativo").order("criado_em", { ascending: false });
        setCarros((data ?? []) as Carro[]);
        // O kit da loja já aparece pronto.
        for (const k of KIT) {
          gerar({ peca: k.peca }).then(g => { if ("url" in g) setKit(atual => ({ ...atual, [k.peca]: { ...g, nome: `kit-${k.nome}` } })); });
        }
      }
      setCarregado(true);
    })();
  }, []);

  const carro = carros.find(c => c.id === carroId) ?? null;
  const frases = carro ? frasesDoVeiculo({ ...carro, abaixoFipe: !!(carro.fipe_valor && carro.preco && carro.preco < carro.fipe_valor) }) : [];
  const usados = situacao?.usados.length ?? 0;
  const limite = situacao?.limiteFrases ?? 0;
  const jaUsado = !!carro && !!frase && !!situacao?.usados.some(u => u.veiculo_id === carro.id && u.frase === frase);
  const semFrasesNaSemana = usados >= limite;

  async function gerarPost() {
    if (!carro) return;
    setErro(""); setGerando(true); setPost(null);
    const g = await gerar({ peca: formato, veiculo: carro.id, ...(frase ? { frase } : {}) });
    setGerando(false);
    if ("erro" in g) { setErro(g.erro); return; }
    setPost({ ...g, nome: `post-${(carro.modelo ?? "carro").toLowerCase().replace(/[^a-z0-9]+/g, "-")}` });
    if (frase && !jaUsado) setSituacao(s => s && { ...s, usados: [...s.usados, { veiculo_id: carro.id, frase }] });
  }

  // Compartilhar a imagem: menu do celular quando der; no app do iPhone, abre a imagem para "tocar e segurar";
  // no computador, baixa o arquivo.
  async function compartilhar(g: Gerada) {
    const arquivo = new File([g.blob], `${g.nome}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [arquivo] })) {
      try { await navigator.share({ files: [arquivo] }); } catch { /* cancelado */ }
      return;
    }
    if (appIphone) { setSegurar(g.url); return; }
    baixar(g);
  }

  function baixar(g: Gerada) {
    if (appIphone) { setSegurar(g.url); return; }
    const a = document.createElement("a");
    a.href = g.url; a.download = `${g.nome}.png`;
    document.body.appendChild(a); a.click(); a.remove();
  }

  async function copiarTexto() {
    if (!carro) return;
    const texto = `${frase ? frase + " " : ""}${carro.marca ?? ""} ${carro.modelo ?? ""} ${carro.ano ?? ""} por ${formatarPreco(carro.preco)}. `
      + `Veja as fotos e fale com a gente: https://www.autoregiao.com.br${linkDoVeiculo(carro)}`;
    try { await navigator.clipboard.writeText(texto.replace(/\s+/g, " ").trim()); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch { /* sem permissão */ }
  }

  const botao = (cheio: boolean) => ({
    display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 9, fontSize: 14, fontWeight: 700,
    cursor: "pointer", border: cheio ? "none" : "1.5px solid #E8E6E1", background: cheio ? "#FF6600" : "#fff", color: cheio ? "#fff" : "#1A1917",
  } as const);
  const caixa = { background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 14, padding: 20 } as const;
  const rotulo = { fontSize: 13, fontWeight: 700, color: "#1A1917", marginBottom: 6, display: "block" } as const;
  const campo = { width: "100%", padding: "11px 12px", border: "1.5px solid #E8E6E1", borderRadius: 9, fontSize: 14, background: "#fff", color: "#1A1917" } as const;

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>
      <style>{`
        .divulgar-grid { display: grid; grid-template-columns: 360px 1fr; gap: 20px; align-items: start; }
        .kit-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 860px) { .divulgar-grid, .kit-grid { grid-template-columns: 1fr; } }
      `}</style>
      <nav style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}><Logo /></Link>
        <Link href="/painel" style={{ fontSize: 13, color: "#7A7670", textDecoration: "none" }}>← Voltar ao painel</Link>
      </nav>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 16px 64px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1A1917", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
          <Icone nome="divulgar" tamanho={28} cor="#FF6600" /> Divulgar
        </h1>
        <p style={{ fontSize: 14, color: "#7A7670", marginBottom: 24, lineHeight: 1.6 }}>
          Imagens prontas com os seus carros para postar no Status do WhatsApp, nos Stories e no feed.
        </p>

        {!carregado && <p style={{ color: "#7A7670" }}>Carregando...</p>}

        {carregado && !situacao?.liberado && (
          <div style={caixa}>
            <p style={{ fontSize: 15, color: "#1A1917", margin: 0, lineHeight: 1.6 }}>
              {emApp
                ? "Este recurso não está disponível para a sua conta."
                : <>A página Divulgar faz parte dos planos <strong>Profissional</strong> e <strong>Premium</strong>.{" "}
                    <Link href="/painel/planos" style={{ color: "#FF6600", fontWeight: 700, textDecoration: "none" }}>Ver planos →</Link></>}
            </p>
          </div>
        )}

        {carregado && situacao?.liberado && (<>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1A1917", margin: "0 0 12px" }}>Post de um carro</h2>
          <div className="divulgar-grid">
            <div style={{ ...caixa, display: "flex", flexDirection: "column", gap: 16 }}>
              {carros.length === 0
                ? <p style={{ fontSize: 14, color: "#7A7670", margin: 0 }}>Você ainda não tem anúncios ativos. <Link href="/painel/novo-anuncio" style={{ color: "#FF6600", fontWeight: 700, textDecoration: "none" }}>Cadastrar um carro →</Link></p>
                : <>
                  <label>
                    <span style={rotulo}>1. Escolha o carro</span>
                    <select value={carroId} onChange={e => { setCarroId(e.target.value); setFrase(""); setPost(null); }} style={campo}>
                      <option value="">Selecione...</option>
                      {carros.map(c => <option key={c.id} value={c.id}>{c.marca} {c.modelo} {c.ano} · {formatarPreco(c.preco)}</option>)}
                    </select>
                  </label>
                  <label>
                    <span style={rotulo}>2. Frase de destaque (opcional)</span>
                    <select value={frase} disabled={!carro} onChange={e => { setFrase(e.target.value); setPost(null); }} style={campo}>
                      <option value="">Sem frase</option>
                      {frases.map(f => {
                        const usadoAntes = !!carro && !!situacao.usados.some(u => u.veiculo_id === carro.id && u.frase === f);
                        return <option key={f} value={f} disabled={semFrasesNaSemana && !usadoAntes}>{f}</option>;
                      })}
                    </select>
                    <span style={{ fontSize: 12, color: "#7A7670", display: "block", marginTop: 6, lineHeight: 1.5 }}>
                      Posts com frase nesta semana: <strong style={{ color: "#1A1917" }}>{usados} de {limite}</strong>
                      {semFrasesNaSemana ? " — renova na segunda-feira." : "."} Sem frase: à vontade.
                    </span>
                  </label>
                  <div>
                    <span style={rotulo}>3. Formato</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {([["post-status", "Status / Stories"], ["post-feed", "Feed"]] as const).map(([id, nome]) => (
                        <button key={id} type="button" onClick={() => { setFormato(id); setPost(null); }}
                          style={{ flex: 1, padding: "10px", borderRadius: 9, fontSize: 13.5, fontWeight: 600, cursor: "pointer", border: "1.5px solid", borderColor: formato === id ? "#FF6600" : "#E8E6E1", background: formato === id ? "#FFF5F1" : "#fff", color: formato === id ? "#FF6600" : "#7A7670" }}>
                          {nome}
                        </button>
                      ))}
                    </div>
                  </div>
                  {frase && !jaUsado && <p style={{ fontSize: 12.5, color: "#92400E", background: "#FEF3C7", borderRadius: 8, padding: "8px 10px", margin: 0 }}>Este post usa 1 dos seus {limite} posts com frase desta semana.</p>}
                  <button type="button" onClick={gerarPost} disabled={!carro || gerando} style={{ ...botao(true), justifyContent: "center", opacity: !carro || gerando ? 0.6 : 1 }}>
                    {gerando ? "Gerando..." : "Gerar imagem"}
                  </button>
                  {erro && <p style={{ fontSize: 13, color: "#991B1B", margin: 0 }}>{erro}</p>}
                </>}
            </div>

            <div style={{ ...caixa, minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              {post ? <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.url} alt="Prévia do post" style={{ maxWidth: "100%", maxHeight: 560, borderRadius: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  <button type="button" onClick={() => compartilhar(post)} style={botao(true)}><Icone nome="compartilhar" /> Compartilhar</button>
                  <button type="button" onClick={() => baixar(post)} style={botao(false)}><Icone nome="baixar" /> Baixar</button>
                  <button type="button" onClick={copiarTexto} style={botao(false)}><Icone nome="copiar" /> {copiado ? "Texto copiado!" : "Copiar texto"}</button>
                </div>
              </> : <p style={{ fontSize: 14, color: "#7A7670", textAlign: "center", margin: 0 }}>Escolha o carro e toque em “Gerar imagem”.<br />A prévia aparece aqui.</p>}
            </div>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1A1917", margin: "36px 0 6px" }}>Kit da sua loja</h2>
          <p style={{ fontSize: 13.5, color: "#7A7670", margin: "0 0 14px", lineHeight: 1.6 }}>
            Com o QR code da página da sua loja. O cartaz é para imprimir e deixar no balcão: o cliente aponta a câmera e vê o estoque.
          </p>
          <div className="kit-grid">
            {KIT.map(k => {
              const g = kit[k.peca];
              return (
                <div key={k.peca} style={{ ...caixa, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917", alignSelf: "flex-start" }}>{k.titulo}</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {g ? <img src={g.url} alt={k.titulo} style={{ width: "100%", maxHeight: 360, objectFit: "contain", borderRadius: 8 }} />
                     : <div style={{ height: 240, display: "flex", alignItems: "center", color: "#7A7670", fontSize: 13 }}>Gerando...</div>}
                  {g && <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => compartilhar(g)} style={{ ...botao(true), padding: "8px 12px", fontSize: 13 }}><Icone nome="compartilhar" /> Compartilhar</button>
                    <button type="button" onClick={() => baixar(g)} style={{ ...botao(false), padding: "8px 12px", fontSize: 13 }}><Icone nome="baixar" /> Baixar</button>
                  </div>}
                </div>
              );
            })}
          </div>
        </>)}
      </div>

      {segurar && (
        <div onClick={() => setSegurar(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={segurar} alt="Imagem para salvar" onClick={e => e.stopPropagation()} style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: 8 }} />
          <p style={{ color: "#fff", fontSize: 15, textAlign: "center", margin: 0 }}>Toque e segure a imagem e escolha <strong>“Salvar em Fotos”</strong>.</p>
          <button type="button" onClick={() => setSegurar(null)} style={{ ...botao(false), background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>Fechar</button>
        </div>
      )}
    </main>
  );
}
