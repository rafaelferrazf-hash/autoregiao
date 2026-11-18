"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Icone from "@/components/Icone";
import { CartaoRepasse, PortaoRepasse, TopoRepasse, useAcessoRepasse } from "@/components/Repasse";
import { supabase } from "@/lib/supabase";
import { usuarioAtual } from "@/lib/dados/usuario";
import { lerPreco } from "@/lib/formatar";
import { LIMITE_REPASSE_ATIVOS, type RepasseComLoja } from "@/lib/repasse";

// Repasse: carros que as lojas oferecem a outras lojas (troca, carro fora do perfil, com reparo).
// Só lojistas veem (o banco confere em public.pode_ver_repasse — supabase/fase34).
const COLUNAS = "*, lojas(nome, cidade, estado, whatsapp, telefone, logo_url, verificada)";
const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function PaginaRepasse() {
  const acesso = useAcessoRepasse();
  const [aba, setAba] = useState<"todos" | "meus">("todos");
  const [todos, setTodos] = useState<RepasseComLoja[] | null>(null);
  const [meus, setMeus] = useState<RepasseComLoja[] | null>(null);
  const [erro, setErro] = useState("");
  const [recarregar, setRecarregar] = useState(0);
  const [ocupado, setOcupado] = useState<string | null>(null);

  // Filtros
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState("");
  const [condicao, setCondicao] = useState("");
  const [cidade, setCidade] = useState("");
  const [precoMax, setPrecoMax] = useState("");

  useEffect(() => {
    if (!acesso?.pode) return;
    let vivo = true;
    (async () => {
      const { data, error } = await supabase.from("repasses").select(COLUNAS).eq("status", "ativo").order("criado_em", { ascending: false }).limit(500);
      if (!vivo) return;
      if (error) setErro("Não foi possível carregar o Repasse. Atualize a página.");
      setTodos((data ?? []) as RepasseComLoja[]);
      if (acesso.podePublicar) {
        const user = await usuarioAtual();
        if (!user) return;
        const { data: m } = await supabase.from("repasses").select(COLUNAS).eq("usuario_id", user.id).order("criado_em", { ascending: false });
        if (vivo) setMeus((m ?? []) as RepasseComLoja[]);
      }
    })();
    return () => { vivo = false; };
  }, [acesso, recarregar]);

  const cidades = useMemo(() => [...new Set((todos ?? []).map(r => r.cidade).filter(Boolean) as string[])].sort(), [todos]);
  const filtrados = useMemo(() => {
    const max = lerPreco(precoMax);
    const palavras = semAcento(texto).split(/\s+/).filter(Boolean);
    return (todos ?? []).filter(r =>
      (!tipo || r.tipo === tipo) &&
      (!condicao || r.condicao === condicao) &&
      (!cidade || r.cidade === cidade) &&
      (!max || r.preco <= max) &&
      palavras.every(p => semAcento(`${r.nome} ${r.lojas?.nome ?? ""}`).includes(p)));
  }, [todos, texto, tipo, condicao, cidade, precoMax]);

  async function mudarStatus(id: string, status: string) {
    if (status === "repassado" && !confirm("Marcar como repassado? O carro sai do Repasse e não pode voltar.")) return;
    setOcupado(id);
    const r = await fetch(`/api/repasse/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const j = await r.json().catch(() => ({}));
    setOcupado(null);
    if (!r.ok) return alert(j.erro || "Não foi possível salvar.");
    setRecarregar(n => n + 1);
  }
  async function excluir(id: string) {
    if (!confirm("Excluir este carro do Repasse? As fotos dele também serão apagadas (menos as que estão em algum anúncio seu).")) return;
    setOcupado(id);
    const r = await fetch(`/api/repasse/${id}`, { method: "DELETE" });
    const j = await r.json().catch(() => ({}));
    setOcupado(null);
    if (!r.ok) return alert(j.erro || "Não foi possível excluir.");
    setRecarregar(n => n + 1);
  }

  const campo = { padding: "9px 12px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 13.5, color: "#1A1917", background: "#fff", outline: "none", minWidth: 0 } as const;
  const botaoAba = (ativo: boolean) => ({ padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 700,
    background: ativo ? "#1A1A1A" : "transparent", color: ativo ? "#fff" : "#7A7670" }) as const;
  const botaoMini = { flex: 1, padding: "8px 6px", border: "1.5px solid #E8E6E1", borderRadius: 7, background: "#fff", fontSize: 12, fontWeight: 600, color: "#1A1917", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, textDecoration: "none" } as const;
  const ativosMeus = (meus ?? []).filter(r => r.status === "ativo").length;

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>
      <style>{`
        .rp-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
        .rp-filtros { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 8px; }
        @media (max-width: 1000px) { .rp-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 768px) { .rp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } .rp-filtros { grid-template-columns: 1fr 1fr; } .rp-filtros > :first-child { grid-column: 1 / -1; } }
        @media (max-width: 480px) { .rp-grid { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
      <TopoRepasse />

      {!acesso ? (
        <div style={{ padding: "60px 16px", textAlign: "center", color: "#7A7670", fontSize: 14 }}>Carregando...</div>
      ) : !acesso.pode ? (
        <PortaoRepasse acesso={acesso} />
      ) : (
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "22px 16px 60px" }}>
          {!acesso.liberado && (
            <div style={{ background: "#FFF7ED", border: "1.5px solid #FED7AA", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#9A3412", marginBottom: 16 }}>
              <Icone nome="cadeado" /> <b>Prévia:</b> o Repasse ainda está fechado para os lojistas. Só você (admin) e a loja de teste estão vendo. Libere no Admin → Lojas.
            </div>
          )}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 4 }}>Repasse entre lojistas</h1>
              <p style={{ fontSize: 13, color: "#7A7670", maxWidth: 620, lineHeight: 1.5 }}>
                Carros que as lojas querem passar adiante: pegos na troca, fora do perfil da loja ou com algum reparo. Só lojistas veem esta página. A negociação é direto entre as lojas.
              </p>
            </div>
            {acesso.podePublicar && (
              <Link href="/repasse/novo" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 18px", background: "#FF6600", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                <Icone nome="mais" /> Oferecer um carro
              </Link>
            )}
          </div>

          {acesso.podePublicar && (
            <div style={{ display: "inline-flex", gap: 4, background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 10, padding: 4, marginBottom: 16 }}>
              <button onClick={() => setAba("todos")} style={botaoAba(aba === "todos")}>Carros no repasse</button>
              <button onClick={() => setAba("meus")} style={botaoAba(aba === "meus")}>Meus repasses{meus ? ` (${meus.length})` : ""}</button>
            </div>
          )}

          {erro && <div style={{ color: "#B91C1C", fontSize: 13, marginBottom: 12 }}>{erro}</div>}

          {aba === "todos" ? (
            <>
              <div className="rp-filtros" style={{ marginBottom: 16 }}>
                <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Buscar modelo ou loja" style={campo} />
                <select value={tipo} onChange={e => setTipo(e.target.value)} style={campo}>
                  <option value="">Carro, moto...</option><option value="carro">Carros</option><option value="moto">Motos</option><option value="utilitario">Utilitários</option>
                </select>
                <select value={condicao} onChange={e => setCondicao(e.target.value)} style={campo}>
                  <option value="">Qualquer estado</option><option value="pronto">Pronto para venda</option><option value="reparo">Precisa de reparo</option>
                </select>
                <select value={cidade} onChange={e => setCidade(e.target.value)} style={campo}>
                  <option value="">Todas as cidades</option>{cidades.map(c => <option key={c}>{c}</option>)}
                </select>
                <input value={precoMax} onChange={e => setPrecoMax(e.target.value)} inputMode="numeric" placeholder="Preço até (R$)" style={campo} />
              </div>
              {todos === null ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#7A7670", fontSize: 14 }}>Carregando carros...</div>
              ) : filtrados.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 20px", background: "#fff", borderRadius: 12, border: "1.5px solid #E8E6E1" }}>
                  <div style={{ color: "#FF6600", marginBottom: 10 }}><Icone nome="repasse" tamanho={40} traco={1.5} /></div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1917", marginBottom: 6 }}>{todos.length ? "Nenhum carro com esses filtros" : "Nenhum carro no repasse ainda"}</div>
                  <div style={{ fontSize: 13, color: "#7A7670" }}>{todos.length ? "Tente tirar algum filtro." : "Seja a primeira loja a oferecer um carro."}</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12.5, color: "#7A7670", marginBottom: 10 }}>{filtrados.length === 1 ? "1 carro" : `${filtrados.length} carros`}</div>
                  <div className="rp-grid">{filtrados.map(r => <CartaoRepasse key={r.id} r={r} />)}</div>
                </>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 12.5, color: "#7A7670", marginBottom: 12 }}>
                {ativosMeus} de {LIMITE_REPASSE_ATIVOS} carros no ar no Repasse (não conta no limite de anúncios do seu plano).
              </div>
              {meus === null ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#7A7670", fontSize: 14 }}>Carregando...</div>
              ) : meus.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 20px", background: "#fff", borderRadius: 12, border: "1.5px solid #E8E6E1" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1917", marginBottom: 6 }}>Você ainda não ofereceu nenhum carro</div>
                  <div style={{ fontSize: 13, color: "#7A7670", marginBottom: 16 }}>Carro de troca parado no pátio? Ofereça para as outras lojas.</div>
                  <Link href="/repasse/novo" style={{ display: "inline-block", padding: "11px 20px", background: "#FF6600", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Oferecer um carro</Link>
                </div>
              ) : (
                <div className="rp-grid">
                  {meus.map(r => (
                    <CartaoRepasse key={r.id} r={r} rodape={r.status === "repassado" ? (
                      <div style={{ display: "flex", gap: 6, padding: "0 12px 12px" }}>
                        <button disabled={ocupado === r.id} onClick={() => excluir(r.id)} style={botaoMini}><Icone nome="lixeira" /> Excluir</button>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: "0 12px 12px" }}>
                        <Link href={`/repasse/novo?editar=${r.id}`} style={botaoMini}><Icone nome="editar" /> Editar</Link>
                        {r.status === "ativo"
                          ? <button disabled={ocupado === r.id} onClick={() => mudarStatus(r.id, "pausado")} style={botaoMini}><Icone nome="pausar" /> Pausar</button>
                          : <button disabled={ocupado === r.id} onClick={() => mudarStatus(r.id, "ativo")} style={botaoMini}><Icone nome="reativar" /> Reativar</button>}
                        <button disabled={ocupado === r.id} onClick={() => mudarStatus(r.id, "repassado")} style={botaoMini}><Icone nome="check" /> Repassado</button>
                        <button disabled={ocupado === r.id} onClick={() => excluir(r.id)} style={botaoMini}><Icone nome="lixeira" /> Excluir</button>
                      </div>
                    )} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
