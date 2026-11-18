"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icone from "@/components/Icone";
import SeletorFipe, { type EscolhaFipe } from "@/components/SeletorFipe";
import { PortaoRepasse, TopoRepasse, useAcessoRepasse } from "@/components/Repasse";
import { supabase } from "@/lib/supabase";
import { usuarioAtual } from "@/lib/dados/usuario";
import { apagarFotos, enviarFotoVeiculo } from "@/lib/dados/veiculos";
import { formatarPreco, lerPreco } from "@/lib/formatar";
import { lerAnoFipe, modeloBase } from "@/lib/nomesVeiculo";
import { MAX_FOTOS_REPASSE, type Repasse } from "@/lib/repasse";
import type { Veiculo } from "@/lib/tipos";

// Oferecer (ou editar: ?editar=<id>) um carro no Repasse. Grava pela /api/repasse (o servidor confere tudo).
type Foto = { url?: string; file?: File; preview: string };
type AnuncioMeu = Pick<Veiculo, "id" | "nome" | "tipo" | "marca" | "modelo" | "versao" | "ano" | "km" | "cambio" | "combustivel" | "cor" | "fotos" | "cidade" | "preco"
  | "fipe_tipo" | "fipe_marca" | "fipe_modelo" | "fipe_ano" | "fipe_nome">;

const VAZIO = { tipo: "carro", marca: "", modelo: "", versao: "", ano: "", km: "", cambio: "", combustivel: "", cor: "", preco: "", condicao: "pronto", reparos: "", descricao: "", cidade: "" };

export default function NovoRepasse() {
  const router = useRouter();
  const acesso = useAcessoRepasse();
  const [form, setForm] = useState(VAZIO);
  const set = (campo: keyof typeof VAZIO, valor: string) => setForm(f => ({ ...f, [campo]: valor }));
  const [fipe, setFipe] = useState<EscolhaFipe | null>(null);
  const [manual, setManual] = useState(false);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [veiculoId, setVeiculoId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [versaoSeletor, setVersaoSeletor] = useState(0);
  const [anuncios, setAnuncios] = useState<AnuncioMeu[]>([]);
  const [usuarioId, setUsuarioId] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const inputFoto = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!acesso?.podePublicar) return;
    (async () => {
      const user = await usuarioAtual();
      if (!user) return;
      setUsuarioId(user.id);
      const { data } = await supabase.from("veiculos")
        .select("id, nome, tipo, marca, modelo, versao, ano, km, cambio, combustivel, cor, fotos, cidade, preco, fipe_tipo, fipe_marca, fipe_modelo, fipe_ano, fipe_nome")
        .eq("usuario_id", user.id).in("status", ["ativo", "pausado"]).order("criado_em", { ascending: false }).limit(200);
      setAnuncios((data ?? []) as AnuncioMeu[]);

      const id = new URLSearchParams(window.location.search).get("editar");
      if (id) {
        const { data: r } = await supabase.from("repasses").select("*").eq("id", id).eq("usuario_id", user.id).maybeSingle();
        const rp = r as Repasse | null;
        if (!rp) setErro("Carro não encontrado ou você não pode editá-lo.");
        else {
          setEditandoId(rp.id);
          setForm({ tipo: rp.tipo, marca: rp.marca ?? "", modelo: rp.modelo ?? "", versao: rp.versao ?? "", ano: rp.ano ?? "", km: rp.km ?? "",
            cambio: rp.cambio ?? "", combustivel: rp.combustivel ?? "", cor: rp.cor ?? "", preco: String(rp.preco), condicao: rp.condicao,
            reparos: rp.reparos ?? "", descricao: rp.descricao ?? "", cidade: rp.cidade ?? "" });
          aplicarFipe(rp);
          setFotos((rp.fotos ?? []).map(url => ({ url, preview: url })));
        }
      }
      setCarregando(false);
    })();
  }, [acesso]);

  function aplicarFipe(v: Pick<Repasse, "fipe_tipo" | "fipe_marca" | "fipe_modelo" | "fipe_ano" | "fipe_nome">) {
    if (v.fipe_tipo && v.fipe_marca && v.fipe_modelo && v.fipe_ano) {
      setFipe({ tipo: v.fipe_tipo, marca: v.fipe_marca, modelo: v.fipe_modelo, ano: v.fipe_ano, nome: v.fipe_nome || "" });
      setManual(false);
    } else { setFipe(null); setManual(true); }
    setVersaoSeletor(n => n + 1);
  }

  function usarAnuncio(id: string) {
    const v = anuncios.find(a => a.id === id);
    if (!v) { setVeiculoId(null); return; }
    setVeiculoId(v.id);
    setForm(f => ({ ...f, tipo: v.tipo || "carro", marca: v.marca ?? "", modelo: v.modelo ?? "", versao: v.versao ?? "", ano: v.ano ?? "", km: v.km ?? "",
      cambio: v.cambio ?? "", combustivel: v.combustivel ?? "", cor: v.cor ?? "", cidade: v.cidade ?? f.cidade }));
    aplicarFipe(v);
    // Só as fotos guardadas na pasta do lojista (as dos anúncios de demonstração ficam no site e não servem).
    const pasta = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/veiculos/${usuarioId}/`;
    setFotos((v.fotos ?? []).filter(url => url.startsWith(pasta)).slice(0, MAX_FOTOS_REPASSE).map(url => ({ url, preview: url })));
  }

  function escolherFipe(e: EscolhaFipe | null) {
    setFipe(e);
    if (!e?.marcaNome || !e.modeloNome || !e.anoNome) return;
    const { ano, combustivel } = lerAnoFipe(e.anoNome);
    setForm(f => ({ ...f, marca: e.marcaNome!, modelo: modeloBase(e.modeloNome!), versao: e.modeloNome!, ano, combustivel: combustivel || f.combustivel }));
  }

  function adicionarFotos(lista: FileList | null) {
    const arquivos = Array.from(lista ?? []).filter(f => f.type.startsWith("image/"));
    if (fotos.length + arquivos.length > MAX_FOTOS_REPASSE) setErro(`No máximo ${MAX_FOTOS_REPASSE} fotos.`);
    setFotos(fs => [...fs, ...arquivos.slice(0, MAX_FOTOS_REPASSE - fs.length).map(file => ({ file, preview: URL.createObjectURL(file) }))]);
    if (inputFoto.current) inputFoto.current.value = "";
  }
  const moverFoto = (i: number, d: number) => setFotos(fs => {
    const j = i + d; if (j < 0 || j >= fs.length) return fs;
    const n = [...fs]; [n[i], n[j]] = [n[j], n[i]]; return n;
  });

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const preco = lerPreco(form.preco);
    if (!form.marca.trim() || !form.modelo.trim()) return setErro("Escolha o veículo na Tabela FIPE ou preencha marca e modelo.");
    if (!form.ano.trim()) return setErro("Preencha o ano.");
    if (!form.km.trim()) return setErro("Preencha a KM.");
    if (!preco) return setErro("Preencha o preço de repasse.");
    if (form.condicao === "reparo" && !form.reparos.trim()) return setErro("Conte o que o carro precisa de reparo.");
    if (!fotos.length) return setErro("Coloque pelo menos 1 foto.");

    setSalvando(true);
    const user = await usuarioAtual();
    if (!user) { setSalvando(false); return setErro("Sua sessão expirou. Entre de novo."); }
    const enviadas: string[] = [];
    const urls: string[] = [];
    for (const f of fotos) {
      if (f.url) { urls.push(f.url); continue; }
      const url = await enviarFotoVeiculo(user.id, f.file!);
      if (!url) {
        await apagarFotos(enviadas).catch(() => {});
        setSalvando(false);
        return setErro("Não foi possível enviar uma das fotos. Confira a internet e tente de novo.");
      }
      enviadas.push(url); urls.push(url);
    }

    const corpo = {
      ...form, preco, fotos: urls, veiculo_id: veiculoId,
      fipe_tipo: !manual ? fipe?.tipo : null, fipe_marca: !manual ? fipe?.marca : null, fipe_modelo: !manual ? fipe?.modelo : null,
      fipe_ano: !manual ? fipe?.ano : null, fipe_nome: !manual ? fipe?.nome : null,
    };
    const r = await fetch(editandoId ? `/api/repasse/${editandoId}` : "/api/repasse", {
      method: editandoId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      await apagarFotos(enviadas).catch(() => {});
      setSalvando(false);
      return setErro(j.erro || "Não foi possível salvar. Tente de novo.");
    }
    router.push(`/repasse/${editandoId ?? j.id}`);
  }

  const input = { width: "100%", padding: "9px 12px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" as const };
  const label = { fontSize: 12, fontWeight: 500 as const, color: "#1A1917", marginBottom: 5, display: "block" as const };
  const caixa = { background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "18px 18px", display: "flex", flexDirection: "column" as const, gap: 14 };
  const titulo = { fontSize: 15, fontWeight: 700 as const, color: "#1A1917" };

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>
      <style>{`
        .rp-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .rp-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 560px) { .rp-3, .rp-2 { grid-template-columns: 1fr 1fr; } }
      `}</style>
      <TopoRepasse voltar="/repasse" rotuloVoltar="Repasse" />

      {!acesso ? (
        <div style={{ padding: "60px 16px", textAlign: "center", color: "#7A7670", fontSize: 14 }}>Carregando...</div>
      ) : !acesso.podePublicar ? (
        <PortaoRepasse acesso={acesso.pode ? { ...acesso, motivo: acesso.motivo ?? "sem_loja" } : acesso} />
      ) : carregando ? (
        <div style={{ padding: "60px 16px", textAlign: "center", color: "#7A7670", fontSize: 14 }}>Carregando...</div>
      ) : (
        <form onSubmit={salvar} style={{ maxWidth: 760, margin: "0 auto", padding: "22px 16px 60px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1A1917", marginBottom: 4 }}>{editandoId ? "Editar carro do repasse" : "Oferecer um carro no repasse"}</h1>
            <p style={{ fontSize: 13, color: "#7A7670", lineHeight: 1.5 }}>Só lojistas veem. Não aparece para os compradores do site e não conta no limite de anúncios do seu plano.</p>
          </div>

          {!editandoId && anuncios.length > 0 && (
            <div style={caixa}>
              <div style={titulo}>Já está anunciado? Use um anúncio seu</div>
              <select value={veiculoId ?? ""} onChange={e => usarAnuncio(e.target.value)} style={input}>
                <option value="">Não, vou preencher do zero</option>
                {anuncios.map(a => <option key={a.id} value={a.id}>{a.nome}{a.preco ? ` — ${formatarPreco(a.preco)}` : ""}</option>)}
              </select>
              <div style={{ fontSize: 12, color: "#A8A49D" }}>Copia os dados e as fotos. O anúncio do site continua como está.</div>
            </div>
          )}

          <div style={caixa}>
            <div style={titulo}>Veículo</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[["carro", "Carro"], ["moto", "Moto"], ["utilitario", "Utilitário"]].map(([v, t]) => (
                <button key={v} type="button" onClick={() => { set("tipo", v); setFipe(null); setVersaoSeletor(n => n + 1); }}
                  style={{ flex: 1, padding: "9px", borderRadius: 8, border: form.tipo === v ? "1.5px solid #FF6600" : "1.5px solid #E8E6E1", background: form.tipo === v ? "#FFF3EB" : "#fff", color: "#1A1917", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
                  {t}
                </button>
              ))}
            </div>
            {!manual ? (
              <SeletorFipe key={`${form.tipo}|${versaoSeletor}`} tipoAnuncio={form.tipo} marcaSugerida={form.marca} preco={lerPreco(form.preco)}
                inicial={fipe} onChange={escolherFipe} onNaoEncontrei={() => setManual(true)} />
            ) : (
              <div style={{ fontSize: 12, color: "#7A7670", background: "#F7F6F3", border: "1.5px solid #E8E6E1", borderRadius: 10, padding: "10px 12px", lineHeight: 1.5 }}>
                Preencha marca, modelo e versão à mão (sem a comparação com a FIPE).{" "}
                <button type="button" onClick={() => { setManual(false); setVersaoSeletor(n => n + 1); }} style={{ background: "none", border: "none", padding: 0, color: "#FF6600", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>Buscar na Tabela FIPE</button>
              </div>
            )}
            {(manual || fipe || form.modelo) && (
              <>
                {manual && (
                  <div className="rp-3">
                    <div><label style={label}>Marca *</label><input value={form.marca} onChange={e => set("marca", e.target.value)} style={input} /></div>
                    <div><label style={label}>Modelo *</label><input value={form.modelo} onChange={e => set("modelo", e.target.value)} style={input} /></div>
                    <div><label style={label}>Versão</label><input value={form.versao} onChange={e => set("versao", e.target.value)} style={input} /></div>
                  </div>
                )}
                <div className="rp-3">
                  <div><label style={label}>Ano *</label><input value={form.ano} onChange={e => set("ano", e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" style={input} /></div>
                  <div><label style={label}>KM *</label><input value={form.km} onChange={e => set("km", e.target.value.replace(/\D/g, ""))} inputMode="numeric" style={input} /></div>
                  <div><label style={label}>Cor</label><input value={form.cor} onChange={e => set("cor", e.target.value)} style={input} /></div>
                  <div>
                    <label style={label}>Câmbio</label>
                    <select value={form.cambio} onChange={e => set("cambio", e.target.value)} style={input}>
                      <option value="">Selecione</option><option>Automático</option><option>Manual</option><option>CVT</option>
                    </select>
                  </div>
                  <div>
                    <label style={label}>Combustível</label>
                    <select value={form.combustivel} onChange={e => set("combustivel", e.target.value)} style={input}>
                      <option value="">Selecione</option><option>Flex</option><option>Gasolina</option><option>Diesel</option><option>Elétrico</option><option>Híbrido</option>
                    </select>
                  </div>
                  <div><label style={label}>Cidade</label><input value={form.cidade} onChange={e => set("cidade", e.target.value)} placeholder="A da loja" style={input} /></div>
                </div>
              </>
            )}
          </div>

          <div style={caixa}>
            <div style={titulo}>Preço e estado</div>
            <div className="rp-2">
              <div><label style={label}>Preço de repasse (R$) *</label><input value={form.preco} onChange={e => set("preco", e.target.value)} inputMode="numeric" placeholder="Ex.: 38000" style={input} /></div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[["pronto", "Pronto para venda"], ["reparo", "Precisa de reparo"]].map(([v, t]) => (
                <button key={v} type="button" onClick={() => set("condicao", v)}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, border: form.condicao === v ? "1.5px solid #FF6600" : "1.5px solid #E8E6E1", background: form.condicao === v ? "#FFF3EB" : "#fff", color: "#1A1917", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
                  {t}
                </button>
              ))}
            </div>
            {form.condicao === "reparo" && (
              <div>
                <label style={label}>O que precisa de reparo? *</label>
                <textarea value={form.reparos} onChange={e => set("reparos", e.target.value)} rows={3} maxLength={600} placeholder="Ex.: embreagem no fim, para-choque traseiro amassado, pneus meia-vida" style={{ ...input, resize: "vertical", fontFamily: "inherit" }} />
              </div>
            )}
            <div>
              <label style={label}>Observações</label>
              <textarea value={form.descricao} onChange={e => set("descricao", e.target.value)} rows={3} maxLength={1500} placeholder="Ex.: veio na troca, documento ok, aceita proposta à vista" style={{ ...input, resize: "vertical", fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={caixa}>
            <div style={titulo}>Fotos ({fotos.length}/{MAX_FOTOS_REPASSE})</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
              {fotos.map((f, i) => (
                <div key={f.preview} style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: 8, overflow: "hidden", background: "#EFEDE8", border: i === 0 ? "2px solid #FF6600" : "1px solid #E8E6E1" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {i === 0 && <span style={{ position: "absolute", top: 4, left: 4, background: "#FF6600", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>Capa</span>}
                  <div style={{ position: "absolute", bottom: 4, left: 4, right: 4, display: "flex", justifyContent: "space-between" }}>
                    <button type="button" aria-label="Mover para a esquerda" onClick={() => moverFoto(i, -1)} style={miniFoto}>‹</button>
                    <button type="button" aria-label="Tirar foto" onClick={() => setFotos(fs => fs.filter((_, j) => j !== i))} style={miniFoto}><Icone nome="lixeira" /></button>
                    <button type="button" aria-label="Mover para a direita" onClick={() => moverFoto(i, 1)} style={miniFoto}>›</button>
                  </div>
                </div>
              ))}
              {fotos.length < MAX_FOTOS_REPASSE && (
                <button type="button" onClick={() => inputFoto.current?.click()} style={{ aspectRatio: "4 / 3", borderRadius: 8, border: "1.5px dashed #C9C5BD", background: "#F7F6F3", color: "#7A7670", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <Icone nome="camera" tamanho={22} /> Adicionar
                </button>
              )}
            </div>
            <input ref={inputFoto} type="file" accept="image/*" multiple hidden onChange={e => adicionarFotos(e.target.files)} />
            {form.condicao === "reparo" && <div style={{ fontSize: 12, color: "#A8A49D" }}>Dica: mostre nas fotos o que precisa de reparo. Isso evita desistência na hora de ver o carro.</div>}
          </div>

          {erro && <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#B91C1C" }}>{erro}</div>}

          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/repasse" style={{ flex: 1, textAlign: "center", padding: "12px", border: "1.5px solid #E8E6E1", borderRadius: 8, color: "#1A1917", fontWeight: 700, fontSize: 14, textDecoration: "none", background: "#fff" }}>Cancelar</Link>
            <button type="submit" disabled={salvando} style={{ flex: 2, padding: "12px", border: "none", borderRadius: 8, background: salvando ? "#FFB380" : "#FF6600", color: "#fff", fontWeight: 700, fontSize: 15, cursor: salvando ? "default" : "pointer" }}>
              {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Colocar no repasse"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

const miniFoto = { width: 26, height: 26, borderRadius: 6, border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 } as const;
