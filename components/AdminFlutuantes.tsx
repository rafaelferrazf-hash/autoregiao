"use client";
import { useCallback, useEffect, useState } from "react";
import { reduzirImagem } from "@/lib/imagem";
import { hojeBrasilia, VAGAS_FLUTUANTE, type Flutuante } from "@/lib/banners";
import Icone from "@/components/Icone";

// Aba "Banners" do /admin → "Anúncio flutuante" (supabase/fase28): bolinha com a logo + selo que abre um cartão.
// Até 5 no ar; cada visitante vê um, sorteado a cada visita.
const cartao = { background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 20, marginBottom: 24 } as const;
const rotulo = { fontSize: 12, fontWeight: 600, color: "#1A1917", marginBottom: 5, display: "block" } as const;
const campo = { width: "100%", boxSizing: "border-box", padding: "9px 11px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, background: "#F7F6F3", color: "#1A1917", outline: "none" } as const;
const botao = { padding: "6px 11px", borderRadius: 7, border: "1.5px solid #E8E6E1", background: "#F7F6F3", fontSize: 12.5, fontWeight: 600, color: "#1A1917", cursor: "pointer" } as const;
const dataBr = (iso: string) => iso.split("-").reverse().join("/");
const maisDias = (iso: string, dias: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + dias); return d.toISOString().slice(0, 10); };
const n = (v: number) => v.toLocaleString("pt-BR");

const VAZIO = { anunciante: "", telefone: "", valor: "", selo: "", titulo: "", texto: "", botao: "Chamar no WhatsApp", link: "", inicio: "", fim: "" };

export default function AdminFlutuantes() {
  const [lista, setLista] = useState<Flutuante[] | null>(null);
  const [form, setForm] = useState(() => { const hoje = hojeBrasilia(); return { ...VAZIO, inicio: hoje, fim: maisDias(hoje, 29) }; });
  const [logo, setLogo] = useState<File | null>(null);
  const [previa, setPrevia] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const r = await fetch("/api/admin/flutuantes", { cache: "no-store" }).then(x => x.json()).catch(() => null);
    setLista(r?.flutuantes ?? []);
  }, []);
  useEffect(() => {
    let ativo = true;
    fetch("/api/admin/flutuantes", { cache: "no-store" }).then(x => x.json()).then(r => { if (ativo) setLista(r?.flutuantes ?? []); }).catch(() => { if (ativo) setLista([]); });
    return () => { ativo = false; };
  }, []);

  const hoje = hojeBrasilia();
  const noAr = (lista ?? []).filter(b => b.ativo && b.inicio <= hoje && b.fim >= hoje);
  const muda = (k: keyof typeof VAZIO) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!logo) { setErro("Escolha a logo do anunciante."); return; }
    setSalvando(true);
    try {
      const { blob, extensao } = await reduzirImagem(logo, 400, { qualidade: 0.9 });
      const dados = new FormData();
      for (const [k, v] of Object.entries(form)) dados.append(k, v);
      dados.append("logo", blob, `logo.${extensao}`);
      const r = await fetch("/api/admin/flutuantes", { method: "POST", body: dados }).then(x => x.json());
      if (!r.ok) setErro(r.erro || "Não foi possível salvar.");
      else {
        const h = hojeBrasilia();
        setForm({ ...VAZIO, inicio: h, fim: maisDias(h, 29) });
        setLogo(null); setPrevia("");
        await carregar();
      }
    } catch {
      setErro("Não foi possível salvar. Tente de novo.");
    }
    setSalvando(false);
  }

  async function acao(id: string, metodo: "PATCH" | "DELETE", corpo?: unknown) {
    setOcupado(id);
    const r = await fetch(`/api/admin/flutuantes/${id}`, { method: metodo, headers: corpo ? { "Content-Type": "application/json" } : undefined, body: corpo ? JSON.stringify(corpo) : undefined })
      .then(x => x.json()).catch(() => ({ erro: "Falha de conexão." }));
    setOcupado(null);
    if (!r.ok) alert("Não deu certo: " + (r.erro || "erro desconhecido"));
    await carregar();
  }

  return (
    <>
      <div style={cartao}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 4 }}>Anúncios flutuantes no ar: {noAr.length} de {VAGAS_FLUTUANTE} vagas</div>
        <div style={{ fontSize: 12.5, color: "#7A7670", lineHeight: 1.5 }}>
          Bolinha com a logo no canto da tela (página inicial, busca e páginas de carros/motos). Ao tocar, abre um cartão com a oferta.
          Cada visitante vê um dos anúncios no ar, sorteado a cada visita. Não aparece na página do anúncio do carro.
          O visitante pode esconder até o dia seguinte.
        </div>
      </div>

      <form onSubmit={salvar} style={cartao}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 14 }}>Novo anúncio flutuante</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <label><span style={rotulo}>Anunciante * (aparece no cartão)</span><input style={campo} maxLength={60} value={form.anunciante} onChange={muda("anunciante")} placeholder="Ex.: Ágape Uniformes" /></label>
          <label><span style={rotulo}>Telefone do anunciante</span><input style={campo} value={form.telefone} onChange={muda("telefone")} placeholder="Para lembrar de renovar" /></label>
          <label><span style={rotulo}>Valor cobrado (R$)</span><input style={campo} inputMode="decimal" value={form.valor} onChange={muda("valor")} placeholder="Ex.: 100" /></label>
          <label><span style={rotulo}>Selo na bolinha (até 8 letras)</span><input style={campo} maxLength={8} value={form.selo} onChange={muda("selo")} placeholder="Ex.: -10%" /></label>
          <label style={{ gridColumn: "1 / -1" }}><span style={rotulo}>Frase principal do cartão * (até 60 letras)</span><input style={campo} maxLength={60} value={form.titulo} onChange={muda("titulo")} placeholder="Ex.: Uniformes personalizados com 10% de desconto" /></label>
          <label style={{ gridColumn: "1 / -1" }}><span style={rotulo}>Linha em verde (até 50 letras)</span><input style={campo} maxLength={50} value={form.texto} onChange={muda("texto")} placeholder="Ex.: Para lojas, oficinas e equipes da região" /></label>
          <label><span style={rotulo}>Texto do botão</span><input style={campo} maxLength={24} value={form.botao} onChange={muda("botao")} /></label>
          <label style={{ gridColumn: "span 2" }}><span style={rotulo}>Para onde o botão leva *</span><input style={campo} value={form.link} onChange={muda("link")} placeholder="WhatsApp com DDD (73 99999-8888) ou https://..." /></label>
          <label><span style={rotulo}>Início *</span><input type="date" style={campo} value={form.inicio} onChange={muda("inicio")} /></label>
          <label><span style={rotulo}>Fim *</span><input type="date" style={campo} value={form.fim} onChange={muda("fim")} /></label>
          <label style={{ gridColumn: "1 / -1" }}>
            <span style={rotulo}>Logo * (quadrada ou redonda; aparece dentro de um círculo)</span>
            <span style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", border: "2px dashed #FDBA74", borderRadius: 10, background: "#FFF7ED", cursor: "pointer" }}>
              <span style={{ padding: "8px 14px", background: "#FF6600", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <Icone nome="camera" tamanho={16} /> {logo ? "Trocar logo" : "Escolher logo"}
              </span>
              <span style={{ fontSize: 13, color: logo ? "#1A1917" : "#7A7670", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{logo ? logo.name : "JPG, PNG ou WEBP — reduzida sozinha antes de enviar"}</span>
            </span>
            <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0] ?? null; setLogo(f); setPrevia(f ? URL.createObjectURL(f) : ""); }} />
          </label>
        </div>

        {/* Prévia: bolinha + cartão aberto, como o visitante vê */}
        <div style={{ marginTop: 16, padding: 18, borderRadius: 10, background: "#2A2927", display: "flex", alignItems: "flex-end", gap: 18, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: 72, height: 80 }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, border: "3px solid #fff", overflow: "hidden", background: "#fff", boxSizing: "border-box" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {previa && <img src={previa} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            {form.selo && <span style={{ position: "absolute", left: "50%", top: 62, transform: "translateX(-50%)", background: "#16A34A", color: "#fff", fontSize: 12, fontWeight: 800, padding: "2px 9px", borderRadius: 12, border: "2px solid #fff", whiteSpace: "nowrap" }}>{form.selo}</span>}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", background: "#fff", borderRadius: 14, padding: 12, width: "min(340px, 100%)", position: "relative", boxSizing: "border-box" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {previa ? <img src={previa} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} /> : <span style={{ width: 64, height: 64, borderRadius: 12, background: "#F0EEEA", flexShrink: 0 }} />}
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#1A1917", lineHeight: 1.3 }}>{form.titulo || "Frase principal"}</span>
              <span style={{ display: "block", fontSize: 12, color: "#7A7670", marginTop: 2 }}>{form.anunciante || "Anunciante"}</span>
              {form.texto && <span style={{ display: "block", fontSize: 12.5, color: "#16A34A", fontWeight: 700, marginTop: 3 }}>{form.texto}</span>}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 12.5, fontWeight: 700, color: "#FF6600" }}>{form.botao || "Saiba mais"} →</span>
            </span>
            <span style={{ position: "absolute", right: 10, bottom: 7, fontSize: 10, color: "#9A968F" }}>Patrocinado</span>
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.6)", width: "100%" }}>Prévia: a bolinha fica no canto da tela; o cartão abre quando o visitante toca nela.</div>
        </div>

        {erro && <div style={{ marginTop: 12, fontSize: 13, color: "#B91C1C" }}>{erro}</div>}
        <button type="submit" disabled={salvando} style={{ marginTop: 14, padding: "11px 18px", background: "#FF6600", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          {salvando ? "Salvando..." : "Salvar anúncio flutuante"}
        </button>
      </form>

      <div style={cartao}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1917", marginBottom: 14 }}>Anúncios flutuantes cadastrados</div>
        {!lista ? <div style={{ fontSize: 13, color: "#7A7670" }}>Carregando...</div>
          : lista.length === 0 ? <div style={{ fontSize: 13, color: "#7A7670" }}>Nenhum anúncio flutuante ainda.</div>
          : lista.map(b => {
            const noArHoje = b.ativo && b.inicio <= hoje && b.fim >= hoje;
            const restam = Math.round((new Date(`${b.fim}T12:00:00Z`).getTime() - new Date(`${hoje}T12:00:00Z`).getTime()) / 86_400_000);
            const situacao = !b.ativo ? "Pausado" : b.fim < hoje ? "Encerrado" : b.inicio > hoje ? `Começa ${dataBr(b.inicio)}` : restam <= 3 ? `No ar · vence em ${restam} ${restam === 1 ? "dia" : "dias"}` : "No ar";
            const cor = !b.ativo || b.fim < hoje ? "#7A7670" : noArHoje && restam <= 3 ? "#B45309" : noArHoje ? "#15803D" : "#2563EB";
            return (
              <div key={b.id} style={{ display: "flex", gap: 14, padding: "12px 0", borderTop: "1px solid #F0EEE9", flexWrap: "wrap", alignItems: "center", opacity: ocupado === b.id ? 0.5 : 1 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.logo_url} alt="" style={{ width: 56, height: 56, borderRadius: 28, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1A1917" }}>{b.anunciante} <span style={{ fontSize: 12, fontWeight: 700, color: cor, marginLeft: 6 }}>{situacao}</span></div>
                  <div style={{ fontSize: 13, color: "#4A4843", marginTop: 2 }}>{b.selo ? `${b.selo} · ` : ""}{b.titulo}</div>
                  <div style={{ fontSize: 12, color: "#7A7670", marginTop: 4 }}>
                    {dataBr(b.inicio)} a {dataBr(b.fim)}{b.valor ? ` · R$ ${Number(b.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : ""}
                    {" · "}<Icone nome="olho" /> {n(b.visualizacoes)} vezes visto · {n(b.aberturas)} abriram o cartão · {n(b.cliques)} cliques
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
                    onClick={() => window.confirm(`Apagar o anúncio flutuante de "${b.anunciante}"? Não dá para desfazer.`) && acao(b.id, "DELETE")}>Apagar</button>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}
