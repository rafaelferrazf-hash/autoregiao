"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NovoAnuncio() {
  const [etapa, setEtapa] = useState(1);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [form, setForm] = useState({
    tipo: "carro",
    marca: "", modelo: "", versao: "", ano: "", km: "",
    cambio: "", combustivel: "", cor: "", portas: "",
    preco: "", aceitaTroca: false,
    opcionais: [] as string[],
    descricao: "",
    nome: "", telefone: "", cidade: "",
  });

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  const toggleOpcional = (op: string) => {
    setForm(f => ({
      ...f,
      opcionais: f.opcionais.includes(op)
        ? f.opcionais.filter(o => o !== op)
        : [...f.opcionais, op]
    }));
  };

  const opcionaisList = [
    "Ar-condicionado", "Direção elétrica", "Vidros elétricos", "Travas elétricas",
    "Airbag", "ABS", "Central multimídia", "Câmera de ré",
    "Sensor de estacionamento", "Rodas de liga", "Teto solar", "Bancos de couro",
    "Alarme", "Bluetooth", "GPS", "Controle de cruzeiro"
  ];

  const inputStyle = {
    width: "100%", padding: "9px 12px", border: "1.5px solid #E8E6E1",
    borderRadius: 8, fontSize: 14, color: "#1A1917", background: "#F7F6F3",
    outline: "none", boxSizing: "border-box" as const
  };

  const labelStyle = { fontSize: 12, fontWeight: 500 as const, color: "#1A1917", marginBottom: 5, display: "block" as const };

  function validarEtapa() {
    if (etapa === 1) {
      if (!form.marca || !form.modelo) { setErro("Preencha a marca e o modelo."); return false; }
      if (!form.ano || !form.km) { setErro("Preencha o ano e a KM."); return false; }
      if (!form.preco) { setErro("Preencha o preço."); return false; }
    }
    if (etapa === 3) {
      if (!form.nome || !form.telefone || !form.cidade) { setErro("Preencha todos os campos de contato."); return false; }
    }
    setErro("");
    return true;
  }

  async function publicar() {
    if (!validarEtapa()) return;
    setCarregando(true);
    setErro("");

    // Pegar usuário logado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setErro("Você precisa estar logado para publicar um anúncio.");
      setCarregando(false);
      return;
    }

    const { error } = await supabase.from("veiculos").insert({
      tipo: form.tipo,
      marca: form.marca,
      modelo: form.modelo,
      versao: form.versao,
      ano: form.ano,
      km: form.km,
      cambio: form.cambio,
      combustivel: form.combustivel,
      cor: form.cor,
      portas: form.portas,
      preco: form.preco.replace(/\D/g, ""),
      aceita_troca: form.aceitaTroca,
      opcionais: form.opcionais,
      descricao: form.descricao,
      nome_contato: form.nome,
      telefone: form.telefone,
      cidade: form.cidade,
      usuario_id: user.id,
      status: "ativo",
    });

    setCarregando(false);

    if (error) {
      console.error(error);
      setErro("Erro ao publicar. Tente novamente.");
      return;
    }

    setEtapa(4);
  }

  function avancar() {
    if (!validarEtapa()) return;
    setEtapa(e => e + 1);
  }

  if (etapa === 4) return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🚗</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 800, color: "#1A1917", marginBottom: 8 }}>Anúncio publicado!</div>
        <p style={{ fontSize: 15, color: "#7A7670", marginBottom: 24 }}>Seu veículo já está visível para compradores da região.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link href="/painel" style={{ padding: "10px 24px", border: "1.5px solid #E8E6E1", borderRadius: 8, textDecoration: "none", color: "#1A1917", fontWeight: 500, fontSize: 14 }}>Ver painel</Link>
          <Link href="/veiculos" style={{ padding: "10px 24px", background: "#E85D26", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Ver anúncios</Link>
        </div>
      </div>
    </main>
  );

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo.png" alt="AutoRegião" width={36} height={36} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 800, color: "#1A1917" }}>
            <span style={{ color: "#E85D26" }}>Auto</span>Região
          </span>
        </Link>
        <Link href="/painel" style={{ fontSize: 13, color: "#7A7670", textDecoration: "none" }}>← Voltar ao painel</Link>
      </nav>

      <div style={{ paddingTop: 80, paddingBottom: 60, display: "flex", justifyContent: "center", padding: "80px 24px 60px" }}>
        <div style={{ width: "100%", maxWidth: 600 }}>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 4 }}>Novo anúncio</div>
            <p style={{ fontSize: 14, color: "#7A7670" }}>Preencha os dados do veículo para publicar</p>
          </div>

          {/* PROGRESS */}
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {["Veículo", "Detalhes", "Contato"].map((label, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: 4, borderRadius: 2, background: etapa > i + 1 ? "#E85D26" : etapa === i + 1 ? "#E85D26" : "#E8E6E1", opacity: etapa === i + 1 ? 1 : etapa > i + 1 ? 0.5 : 1 }}></div>
                <div style={{ fontSize: 11, color: etapa >= i + 1 ? "#E85D26" : "#7A7670", marginTop: 4, fontWeight: etapa === i + 1 ? 600 : 400 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 14, padding: "28px" }}>

            {/* ERRO */}
            {erro && (
              <div style={{ background: "#FEE2E2", border: "1.5px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#991B1B", fontWeight: 500 }}>
                ⚠️ {erro}
              </div>
            )}

            {/* ETAPA 1 */}
            {etapa === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#7A7670", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Tipo</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["carro", "🚗 Carro"], ["moto", "🏍️ Moto"], ["utilitario", "🚐 Utilitário"]].map(([val, label]) => (
                      <button key={val} onClick={() => set("tipo", val)}
                        style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1.5px solid", borderColor: form.tipo === val ? "#E85D26" : "#E8E6E1", background: form.tipo === val ? "#FFF5F1" : "#fff", color: form.tipo === val ? "#E85D26" : "#7A7670", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["Marca", "marca", "Ex: Chevrolet"], ["Modelo", "modelo", "Ex: Onix"]].map(([label, field, ph]) => (
                    <div key={field}>
                      <label style={labelStyle}>{label} <span style={{ color: "#E85D26" }}>*</span></label>
                      <input placeholder={ph} value={form[field as keyof typeof form] as string} onChange={e => set(field, e.target.value)} style={inputStyle} />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={labelStyle}>Versão</label>
                  <input placeholder="Ex: LT 1.0 Automático" value={form.versao} onChange={e => set("versao", e.target.value)} style={inputStyle} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["Ano", "ano", "Ex: 2022"], ["KM rodados", "km", "Ex: 38000"]].map(([label, field, ph]) => (
                    <div key={field}>
                      <label style={labelStyle}>{label} <span style={{ color: "#E85D26" }}>*</span></label>
                      <input placeholder={ph} value={form[field as keyof typeof form] as string} onChange={e => set(field, e.target.value)} style={inputStyle} />
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Câmbio</label>
                    <select value={form.cambio} onChange={e => set("cambio", e.target.value)} style={inputStyle}>
                      <option value="">Selecione</option>
                      <option>Automático</option><option>Manual</option><option>CVT</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Combustível</label>
                    <select value={form.combustivel} onChange={e => set("combustivel", e.target.value)} style={inputStyle}>
                      <option value="">Selecione</option>
                      <option>Flex</option><option>Gasolina</option><option>Diesel</option><option>Elétrico</option><option>Híbrido</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Portas</label>
                    <select value={form.portas} onChange={e => set("portas", e.target.value)} style={inputStyle}>
                      <option value="">Selecione</option>
                      <option>2 portas</option><option>4 portas</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Cor</label>
                    <select value={form.cor} onChange={e => set("cor", e.target.value)} style={inputStyle}>
                      <option value="">Selecione</option>
                      {["Branco", "Prata", "Preto", "Cinza", "Vermelho", "Azul", "Verde", "Amarelo", "Laranja", "Marrom"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Preço <span style={{ color: "#E85D26" }}>*</span></label>
                    <input placeholder="Ex: 72900" value={form.preco} onChange={e => set("preco", e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" id="troca" checked={form.aceitaTroca} onChange={e => set("aceitaTroca", e.target.checked)} style={{ width: 16, height: 16, accentColor: "#E85D26" }} />
                  <label htmlFor="troca" style={{ fontSize: 13, color: "#1A1917", cursor: "pointer" }}>Aceita troca</label>
                </div>
              </div>
            )}

            {/* ETAPA 2 */}
            {etapa === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 8 }}>Fotos do veículo</div>
                  <div style={{ border: "2px dashed #E8E6E1", borderRadius: 10, padding: "32px", textAlign: "center", cursor: "pointer", background: "#F7F6F3" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                    <div style={{ fontSize: 13, color: "#7A7670", marginBottom: 4 }}>Upload de fotos em breve</div>
                    <div style={{ fontSize: 11, color: "#7A7670" }}>Até 20 fotos · JPG ou PNG</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 10 }}>Opcionais</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {opcionaisList.map(op => (
                      <div key={op} onClick={() => toggleOpcional(op)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7, border: "1.5px solid", borderColor: form.opcionais.includes(op) ? "#E85D26" : "#E8E6E1", background: form.opcionais.includes(op) ? "#FFF5F1" : "#fff", cursor: "pointer" }}>
                        <div style={{ width: 14, height: 14, borderRadius: 3, border: "1.5px solid", borderColor: form.opcionais.includes(op) ? "#E85D26" : "#E8E6E1", background: form.opcionais.includes(op) ? "#E85D26" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {form.opcionais.includes(op) && <span style={{ color: "#fff", fontSize: 9 }}>✓</span>}
                        </div>
                        <span style={{ fontSize: 12, color: form.opcionais.includes(op) ? "#E85D26" : "#1A1917" }}>{op}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Descrição</label>
                  <textarea placeholder="Descreva o veículo, histórico de manutenção, diferenciais..." value={form.descricao} onChange={e => set("descricao", e.target.value)}
                    style={{ ...inputStyle, height: 100, resize: "vertical" as const }} />
                </div>
              </div>
            )}

            {/* ETAPA 3 */}
            {etapa === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "#F7F6F3", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#7A7670", lineHeight: 1.5 }}>
                  📋 Essas informações serão exibidas no anúncio para os compradores entrarem em contato.
                </div>

                {[["Nome / Loja", "nome", "text", "Ex: Auto Paulista"],
                  ["Telefone / WhatsApp", "telefone", "tel", "(14) 99999-9999"],
                  ["Cidade", "cidade", "text", "Ex: Lençóis Paulista"]].map(([label, field, type, ph]) => (
                  <div key={field}>
                    <label style={labelStyle}>{label} <span style={{ color: "#E85D26" }}>*</span></label>
                    <input type={type} placeholder={ph} value={form[field as keyof typeof form] as string} onChange={e => set(field, e.target.value)} style={inputStyle} />
                  </div>
                ))}

                <div style={{ background: "#F7F6F3", borderRadius: 10, padding: "16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#7A7670", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>Resumo do anúncio</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 4 }}>{form.marca} {form.modelo} {form.versao}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {[form.ano, form.km && `${form.km} km`, form.cambio, form.combustivel].filter(Boolean).map(tag => (
                      <span key={tag} style={{ fontSize: 11, color: "#7A7670", background: "#fff", padding: "2px 8px", borderRadius: 4, border: "1px solid #E8E6E1" }}>{tag}</span>
                    ))}
                  </div>
                  {form.preco && <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: "#E85D26" }}>R$ {form.preco}</div>}
                </div>
              </div>
            )}

            {/* BOTÕES */}
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              {etapa > 1 && (
                <button onClick={() => setEtapa(e => e - 1)}
                  style={{ flex: 1, padding: "10px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#fff", color: "#1A1917", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  ← Voltar
                </button>
              )}
              <button
                onClick={etapa === 3 ? publicar : avancar}
                disabled={carregando}
                style={{ flex: 2, padding: "10px", background: carregando ? "#C44818" : "#E85D26", border: "none", borderRadius: 8, color: "#fff", fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, cursor: carregando ? "not-allowed" : "pointer", opacity: carregando ? 0.8 : 1 }}>
                {carregando ? "Publicando..." : etapa === 3 ? "Publicar anúncio 🚀" : "Continuar →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}