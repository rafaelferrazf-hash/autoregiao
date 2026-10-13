"use client";
import { useCallback, useEffect, useState } from "react";
import { reduzirImagem } from "@/lib/imagem";
import { hojeBrasilia, type Banner } from "@/lib/banners";
import Icone from "@/components/Icone";

// Aba "Banners" do /admin: banners pagos do carrossel da página inicial (até 4 no ar ao mesmo tempo).
const cartao = { background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 20, marginBottom: 24 } as const;
const rotulo = { fontSize: 12, fontWeight: 600, color: "#1A1917", marginBottom: 5, display: "block" } as const;
const campo = { width: "100%", boxSizing: "border-box", padding: "9px 11px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, background: "#F7F6F3", color: "#1A1917", outline: "none" } as const;
const botao = { padding: "6px 11px", borderRadius: 7, border: "1.5px solid #E8E6E1", background: "#F7F6F3", fontSize: 12.5, fontWeight: 600, color: "#1A1917", cursor: "pointer" } as const;
const dataBr = (iso: string) => iso.split("-").reverse().join("/");
const maisDias = (iso: string, dias: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + dias); return d.toISOString().slice(0, 10); };

const VAZIO = { anunciante: "", telefone: "", titulo: "", destaque: "", texto: "", botao: "Saiba mais", link: "", inicio: "", fim: "", valor: "" };

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [form, setForm] = useState(() => { const hoje = hojeBrasilia(); return { ...VAZIO, inicio: hoje, fim: maisDias(hoje, 29) }; });
  const [foto, setFoto] = useState<File | null>(null);
  const [previa, setPrevia] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const r = await fetch("/api/admin/banners", { cache: "no-store" }).then(x => x.json()).catch(() => null);
    setBanners(r?.banners ?? []);
  }, []);
  useEffect(() => {
    let ativo = true;
    fetch("/api/admin/banners", { cache: "no-store" }).then(x => x.json()).then(r => { if (ativo) setBanners(r?.banners ?? []); }).catch(() => { if (ativo) setBanners([]); });
    return () => { ativo = false; };
  }, []);

  const hoje = hojeBrasilia();
  const noAr = (banners ?? []).filter(b => b.ativo && b.inicio <= hoje && b.fim >= hoje);
  const muda = (k: keyof typeof VAZIO) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!foto) { setErro("Escolha a foto do banner."); return; }
    setSalvando(true);
    try {
      const { blob } = await reduzirImagem(foto, 1600, { jpeg: true, qualidade: 0.85 });
      const dados = new FormData();
      for (const [k, v] of Object.entries(form)) dados.append(k, v);
      dados.append("imagem", blob, "banner.jpg");
      const r = await fetch("/api/admin/banners", { method: "POST", body: dados }).then(x => x.json());
      if (!r.ok) setErro(r.erro || "Não foi possível salvar.");
      else {
        const h = hojeBrasilia();
        setForm({ ...VAZIO, inicio: h, fim: maisDias(h, 29) });
        setFoto(null); setPrevia("");
        await carregar();
      }
    } catch {
      setErro("Não foi possível salvar. Tente de novo.");
    }
    setSalvando(false);
  }

  async function acao(id: string, metodo: "PATCH" | "DELETE", corpo?: unknown) {
    setOcupado(id);
    const r = await fetch(`/api/admin/banners/${id}`, { method: metodo, headers: corpo ? { "Content-Type": "application/json" } : undefined, body: corpo ? JSON.stringify(corpo) : undefined })
      .then(x => x.json()).catch(() => ({ erro: "Falha de conexão." }));
    setOcupado(null);
    if (!r.ok) alert("Não deu certo: " + (r.erro || "erro desconhecido"));
    await carregar();
  }

  return (
    <>
      <div style={cartao}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 4 }}>Banners no ar: {noAr.length} de 4 vagas</div>
        <div style={{ fontSize: 12.5, color: "#7A7670", lineHeight: 1.5 }}>
          Os banners entram no carrossel da página inicial logo depois do 1º slide, e saem sozinhos na data de fim.
          Venda para lojas e negócios do ramo (despachante, seguradora, financeira, autopeças, oficina...).
        </div>
      </div>

      {/* NOVO BANNER */}
      <form onSubmit={salvar} style={cartao}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 14 }}>Novo banner</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <label><span style={rotulo}>Anunciante *</span><input style={campo} value={form.anunciante} onChange={muda("anunciante")} placeholder="Ex.: Despachante Silva" /></label>
          <label><span style={rotulo}>Telefone do anunciante</span><input style={campo} value={form.telefone} onChange={muda("telefone")} placeholder="Para lembrar de renovar" /></label>
          <label><span style={rotulo}>Valor cobrado (R$)</span><input style={campo} inputMode="decimal" value={form.valor} onChange={muda("valor")} placeholder="Ex.: 150" /></label>
          <label style={{ gridColumn: "1 / -1" }}><span style={rotulo}>Frase principal * (até 70 letras)</span><input style={campo} maxLength={70} value={form.titulo} onChange={muda("titulo")} placeholder="Ex.: Transferência de veículo sem dor de cabeça" /></label>
          <label><span style={rotulo}>Parte da frase em laranja</span><input style={campo} maxLength={40} value={form.destaque} onChange={muda("destaque")} placeholder="Ex.: sem dor de cabeça" /></label>
          <label style={{ gridColumn: "span 2" }}><span style={rotulo}>Frase menor (até 140 letras)</span><input style={campo} maxLength={140} value={form.texto} onChange={muda("texto")} placeholder="Ex.: Documentação rápida em Teixeira de Freitas." /></label>
          <label><span style={rotulo}>Texto do botão</span><input style={campo} maxLength={24} value={form.botao} onChange={muda("botao")} /></label>
          <label style={{ gridColumn: "span 2" }}><span style={rotulo}>Para onde o botão leva *</span><input style={campo} value={form.link} onChange={muda("link")} placeholder="WhatsApp com DDD (73 99999-8888), /loja/... ou https://..." /></label>
          <label><span style={rotulo}>Início *</span><input type="date" style={campo} value={form.inicio} onChange={muda("inicio")} /></label>
          <label><span style={rotulo}>Fim *</span><input type="date" style={campo} value={form.fim} onChange={muda("fim")} /></label>
          <label style={{ gridColumn: "1 / -1" }}>
            <span style={rotulo}>Foto * (deitada/horizontal; a pessoa ou o produto à direita fica melhor)</span>
            <span style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", border: "2px dashed #FDBA74", borderRadius: 10, background: "#FFF7ED", cursor: "pointer" }}>
              <span style={{ padding: "8px 14px", background: "#FF6600", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <Icone nome="camera" tamanho={16} /> {foto ? "Trocar foto" : "Escolher foto"}
              </span>
              <span style={{ fontSize: 13, color: foto ? "#1A1917" : "#7A7670", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{foto ? foto.name : "JPG, PNG ou WEBP — a foto é reduzida sozinha antes de enviar"}</span>
            </span>
            <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0] ?? null; setFoto(f); setPrevia(f ? URL.createObjectURL(f) : ""); }} />
          </label>
        </div>

        {/* Prévia de como fica no carrossel */}
        {(previa || form.titulo) && (
          <div style={{ marginTop: 16, position: "relative", height: 200, borderRadius: 10, overflow: "hidden", background: "#1A1917" }}>
            {previa && (
              <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "62%" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previa} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #1A1917 0%, rgba(26,25,23,0.7) 15%, rgba(26,25,23,0) 45%)" }} />
              </div>
            )}
            <div style={{ position: "relative", padding: "0 20px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, maxWidth: 420 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 24, lineHeight: 1.1 }}>
                {form.destaque && form.titulo.includes(form.destaque)
                  ? <>{form.titulo.split(form.destaque)[0]}<span style={{ color: "#FF7A1F" }}>{form.destaque}</span>{form.titulo.split(form.destaque).slice(1).join(form.destaque)}</>
                  : form.titulo}
              </div>
              {form.texto && <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>{form.texto}</div>}
              <span style={{ alignSelf: "flex-start", padding: "8px 14px", background: "#FF6600", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>{form.botao || "Saiba mais"} →</span>
            </div>
          </div>
        )}

        {erro && <div style={{ marginTop: 12, fontSize: 13, color: "#B91C1C" }}>{erro}</div>}
        <button type="submit" disabled={salvando} style={{ marginTop: 14, padding: "11px 18px", background: "#FF6600", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          {salvando ? "Salvando..." : "Salvar banner"}
        </button>
      </form>

      {/* LISTA */}
      <div style={cartao}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 14 }}>Banners cadastrados</div>
        {!banners ? <div style={{ fontSize: 13, color: "#7A7670" }}>Carregando...</div>
          : banners.length === 0 ? <div style={{ fontSize: 13, color: "#7A7670" }}>Nenhum banner ainda.</div>
          : banners.map(b => {
            const noArHoje = b.ativo && b.inicio <= hoje && b.fim >= hoje;
            const restam = Math.round((new Date(`${b.fim}T12:00:00Z`).getTime() - new Date(`${hoje}T12:00:00Z`).getTime()) / 86_400_000);
            const situacao = !b.ativo ? "Pausado" : b.fim < hoje ? "Encerrado" : b.inicio > hoje ? `Começa ${dataBr(b.inicio)}` : restam <= 3 ? `No ar · vence em ${restam} ${restam === 1 ? "dia" : "dias"}` : "No ar";
            const cor = !b.ativo || b.fim < hoje ? "#7A7670" : noArHoje && restam <= 3 ? "#B45309" : noArHoje ? "#15803D" : "#2563EB";
            return (
              <div key={b.id} style={{ display: "flex", gap: 14, padding: "12px 0", borderTop: "1px solid #F0EEE9", flexWrap: "wrap", opacity: ocupado === b.id ? 0.5 : 1 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.imagem_url} alt="" style={{ width: 120, height: 72, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1A1917" }}>{b.anunciante} <span style={{ fontSize: 12, fontWeight: 700, color: cor, marginLeft: 6 }}>{situacao}</span></div>
                  <div style={{ fontSize: 13, color: "#4A4843", marginTop: 2 }}>{b.titulo}</div>
                  <div style={{ fontSize: 12, color: "#7A7670", marginTop: 4 }}>
                    {dataBr(b.inicio)} a {dataBr(b.fim)}{b.valor ? ` · R$ ${Number(b.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : ""}
                    {" · "}<Icone nome="olho" /> {b.visualizacoes.toLocaleString("pt-BR")} vezes visto · {b.cliques.toLocaleString("pt-BR")} cliques
                    {b.telefone ? ` · ${b.telefone}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <button type="button" style={botao} disabled={ocupado === b.id}
                    onClick={() => { const base = b.fim >= hoje ? maisDias(b.fim, 1) : hoje; window.confirm(`Renovar "${b.anunciante}" por mais 30 dias (até ${dataBr(maisDias(base, 29))})?`) && acao(b.id, "PATCH", { acao: "datas", inicio: b.fim >= hoje ? b.inicio : hoje, fim: maisDias(base, 29) }); }}>
                    + 30 dias
                  </button>
                  {b.ativo
                    ? <button type="button" style={botao} disabled={ocupado === b.id} onClick={() => acao(b.id, "PATCH", { acao: "pausar" })}>Pausar</button>
                    : <button type="button" style={botao} disabled={ocupado === b.id} onClick={() => acao(b.id, "PATCH", { acao: "reativar" })}>Reativar</button>}
                  <button type="button" style={{ ...botao, color: "#991B1B", borderColor: "#FCA5A5", background: "#FEF2F2" }} disabled={ocupado === b.id}
                    onClick={() => window.confirm(`Apagar o banner de "${b.anunciante}"? Não dá para desfazer.`) && acao(b.id, "DELETE")}>Apagar</button>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}
