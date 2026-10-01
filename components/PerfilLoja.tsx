"use client";
import Link from "next/link";
import { useState } from "react";
import { atualizarPerfilLoja, type PerfilLojaEditavel } from "@/lib/dados/lojas";
import type { Loja } from "@/lib/tipos";

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

// Formulário "Perfil da Loja" do painel. Só campos que o lojista pode alterar
// (plano, vencimento e ativo ficam travados no banco — ver supabase/fase1-seguranca.sql).
export default function PerfilLoja({ loja, onSalvo }: { loja: Loja | null; onSalvo: (loja: Loja) => void }) {
  const [form, setForm] = useState<PerfilLojaEditavel>(() => ({
    nome: loja?.nome ?? "",
    cidade: loja?.cidade ?? "",
    estado: loja?.estado ?? "",
    telefone: loja?.telefone ?? "",
    whatsapp: loja?.whatsapp ?? "",
    endereco: loja?.endereco ?? "",
    horario: loja?.horario ?? "",
    descricao: loja?.descricao ?? "",
  }));
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ ok: boolean; texto: string } | null>(null);

  if (!loja) {
    return (
      <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 24, fontSize: 14, color: "#7A7670" }}>
        Sua conta ainda não tem uma loja vinculada.
      </div>
    );
  }

  const muda = (campo: keyof PerfilLojaEditavel, valor: string) => { setForm(f => ({ ...f, [campo]: valor })); setMensagem(null); };
  const soDigitos = (v: string) => v.replace(/\D/g, "");

  async function salvar() {
    if (!form.nome.trim()) return setMensagem({ ok: false, texto: "Informe o nome da loja." });
    if (!form.cidade.trim()) return setMensagem({ ok: false, texto: "Informe a cidade." });
    const zap = soDigitos(form.whatsapp);
    if (zap && (zap.length < 10 || zap.length > 11)) return setMensagem({ ok: false, texto: "WhatsApp deve ter DDD + número (10 ou 11 dígitos)." });
    const tel = soDigitos(form.telefone);
    if (tel && (tel.length < 10 || tel.length > 11)) return setMensagem({ ok: false, texto: "Telefone deve ter DDD + número (10 ou 11 dígitos)." });

    setSalvando(true);
    const { loja: atualizada, error } = await atualizarPerfilLoja(loja!.id, form);
    setSalvando(false);
    if (error || !atualizada) return setMensagem({ ok: false, texto: "Não foi possível salvar. Tente de novo." });
    onSalvo(atualizada);
    setMensagem({ ok: true, texto: "Perfil salvo! As mudanças já aparecem na página da sua loja." });
  }

  const rotulo = { display: "block", fontSize: 12, fontWeight: 600, color: "#1A1917", marginBottom: 5 } as const;
  const ajuda = { fontSize: 11, color: "#7A7670", marginTop: 4 } as const;
  const campo = { width: "100%", padding: "10px 12px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" } as const;

  return (
    <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden", maxWidth: 760 }}>
      <style>{`
        .perfil-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .perfil-grid-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
        @media (max-width: 640px) { .perfil-grid, .perfil-grid-3 { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1917" }}>Perfil da loja</div>
          <div style={{ fontSize: 12, color: "#7A7670" }}>Estes dados aparecem na página pública da sua loja.</div>
        </div>
        <Link href={`/loja/${loja.id}`} target="_blank" style={{ fontSize: 12, color: "#FF6600", fontWeight: 600, textDecoration: "none" }}>Ver minha página →</Link>
      </div>

      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={rotulo}>Nome da loja *</label>
          <input value={form.nome} onChange={e => muda("nome", e.target.value)} maxLength={80} style={campo} />
        </div>

        <div className="perfil-grid-3">
          <div>
            <label style={rotulo}>Cidade *</label>
            <input value={form.cidade} onChange={e => muda("cidade", e.target.value)} maxLength={60} placeholder="Ex: Teixeira de Freitas" style={campo} />
          </div>
          <div>
            <label style={rotulo}>Estado</label>
            <select value={form.estado} onChange={e => muda("estado", e.target.value)} style={campo}>
              <option value="">—</option>
              {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
        </div>

        <div className="perfil-grid">
          <div>
            <label style={rotulo}>WhatsApp</label>
            <input inputMode="tel" value={form.whatsapp} onChange={e => muda("whatsapp", e.target.value)} placeholder="(73) 99999-9999" style={campo} />
            <div style={ajuda}>Botão verde de WhatsApp na página da loja.</div>
          </div>
          <div>
            <label style={rotulo}>Telefone</label>
            <input inputMode="tel" value={form.telefone} onChange={e => muda("telefone", e.target.value)} placeholder="(73) 3333-3333" style={campo} />
            <div style={ajuda}>Botão &quot;Ligar&quot;. Se o WhatsApp ficar vazio, ele também é usado no WhatsApp.</div>
          </div>
        </div>

        <div>
          <label style={rotulo}>Endereço</label>
          <input value={form.endereco} onChange={e => muda("endereco", e.target.value)} maxLength={140} placeholder="Rua, número, bairro" style={campo} />
        </div>

        <div>
          <label style={rotulo}>Horário de atendimento</label>
          <input value={form.horario} onChange={e => muda("horario", e.target.value)} maxLength={100} placeholder="Seg a Sex: 8h às 18h · Sáb: 8h às 12h" style={campo} />
        </div>

        <div>
          <label style={rotulo}>Sobre a loja</label>
          <textarea value={form.descricao} onChange={e => muda("descricao", e.target.value)} maxLength={600} rows={4}
            placeholder="Conte há quanto tempo a loja existe, o que oferece (financiamento, troca, garantia...)"
            style={{ ...campo, resize: "vertical" }} />
          <div style={ajuda}>{form.descricao.length}/600</div>
        </div>

        {mensagem && (
          <div style={{ background: mensagem.ok ? "#D1FAE5" : "#FEE2E2", border: `1.5px solid ${mensagem.ok ? "#6EE7B7" : "#FCA5A5"}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: mensagem.ok ? "#065F46" : "#991B1B" }}>
            {mensagem.ok ? "✅ " : "⚠️ "}{mensagem.texto}
          </div>
        )}

        <div>
          <button onClick={salvar} disabled={salvando}
            style={{ padding: "11px 22px", background: "#FF6600", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: salvando ? "default" : "pointer", opacity: salvando ? 0.7 : 1 }}>
            {salvando ? "Salvando..." : "Salvar perfil"}
          </button>
        </div>
      </div>
    </div>
  );
}
