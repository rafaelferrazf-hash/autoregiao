"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usuarioAtual } from "@/lib/dados/usuario";
import { mensagemErroAnuncio } from "@/lib/planos";
import { criarVeiculo, atualizarVeiculo, buscarVeiculoDoDono, enviarFotoVeiculo, apagarFotos } from "@/lib/dados/veiculos";
import SeletorFipe, { type EscolhaFipe } from "@/components/SeletorFipe";
import { formatarPreco, lerPreco } from "@/lib/formatar";
import { lerAnoFipe, modeloBase } from "@/lib/nomesVeiculo";

// Foto nova (file, ainda não enviada) ou já publicada (url, no modo edição).
type FotoPreview = { file?: File; url?: string; preview: string };

function camposFipe(f: EscolhaFipe | null) {
  return { fipe_tipo: f?.tipo ?? null, fipe_marca: f?.marca ?? null, fipe_modelo: f?.modelo ?? null, fipe_ano: f?.ano ?? null, fipe_nome: f?.nome || null };
}

export default function NovoAnuncio() {
  const [etapa, setEtapa] = useState(1);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [fotos, setFotos] = useState<FotoPreview[]>([]);
  const [uploadando, setUploadando] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);

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
  // Modelo da Tabela FIPE escolhido (opcional). O valor é gravado pelo servidor depois de salvar.
  const [fipe, setFipe] = useState<EscolhaFipe | null>(null);
  // "Não encontrei meu veículo na lista": marca/modelo/versão digitados à mão, sem FIPE.
  const [manual, setManual] = useState(false);

  function escolherFipe(e: EscolhaFipe | null) {
    setFipe(e);
    if (!e?.marcaNome || !e.modeloNome || !e.anoNome) return;
    const { ano, combustivel } = lerAnoFipe(e.anoNome);
    setForm(f => ({
      ...f,
      marca: e.marcaNome!,
      modelo: modeloBase(e.modeloNome!),
      versao: e.modeloNome!,
      ano,
      combustivel: combustivel || f.combustivel,
    }));
  }

  // Modo edição: /painel/novo-anuncio?editar=<id>
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [fotosOriginais, setFotosOriginais] = useState<string[]>([]);
  const [carregandoEdicao, setCarregandoEdicao] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("editar");
    if (!id) return;
    (async () => {
      setCarregandoEdicao(true);
      const user = await usuarioAtual();
      const v = user ? await buscarVeiculoDoDono(id, user.id) : null;
      setCarregandoEdicao(false);
      if (!user || !v) {
        setErro("Anúncio não encontrado ou você não tem permissão para editá-lo.");
        return;
      }
      setEditandoId(v.id);
      setForm({
        tipo: v.tipo || "carro",
        marca: v.marca || "", modelo: v.modelo || "", versao: v.versao || "",
        ano: v.ano || "", km: v.km || "",
        cambio: v.cambio || "", combustivel: v.combustivel || "", cor: v.cor || "", portas: v.portas || "",
        preco: v.preco != null ? String(v.preco) : "", aceitaTroca: !!v.aceita_troca,
        opcionais: v.opcionais || [],
        descricao: v.descricao || "",
        nome: v.nome_contato || "", telefone: v.telefone || "", cidade: v.cidade || "",
      });
      if (v.fipe_tipo && v.fipe_marca && v.fipe_modelo && v.fipe_ano) {
        setFipe({ tipo: v.fipe_tipo, marca: v.fipe_marca, modelo: v.fipe_modelo, ano: v.fipe_ano, nome: v.fipe_nome || "" });
      } else {
        // Anúncio antigo, cadastrado antes da FIPE: mantém os campos digitados.
        setManual(true);
      }
      setFotos((v.fotos || []).map(url => ({ url, preview: url })));
      setFotosOriginais(v.fotos || []);
    })();
  }, []);

  const toggleOpcional = (op: string) => {
    setForm(f => ({
      ...f,
      opcionais: f.opcionais.includes(op)
        ? f.opcionais.filter(o => o !== op)
        : [...f.opcionais, op]
    }));
  };


  const opcionaisList = [
    "Ar-condicionado", "Ar-condicionado digital", "Direção hidráulica", "Direção elétrica",
    "Vidros elétricos", "Travas elétricas", "Retrovisores elétricos", "Airbag", "ABS",
    "Central multimídia", "Android Auto / Apple CarPlay", "Bluetooth", "GPS",
    "Câmera de ré", "Sensor de estacionamento", "Controle de cruzeiro", "Volante multifuncional",
    "Computador de bordo", "Partida sem chave", "Carregador sem fio", "Faróis de LED",
    "Faróis de neblina", "Sensor de chuva", "Rodas de liga", "Teto solar", "Bancos de couro",
    "Banco com regulagem de altura", "Tração 4x4", "Alarme", "Único dono", "Revisões na concessionária",
  ];

  const inputStyle = {
    width: "100%", padding: "9px 12px", border: "1.5px solid #E8E6E1",
    borderRadius: 8, fontSize: 14, color: "#1A1917", background: "#F7F6F3",
    outline: "none", boxSizing: "border-box" as const
  };

  const labelStyle = { fontSize: 12, fontWeight: 500 as const, color: "#1A1917", marginBottom: 5, display: "block" as const };

  function handleSelecionarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (fotos.length + files.length > 20) {
      setErro("Máximo de 20 fotos permitido.");
      return;
    }
    const novas = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setFotos(f => [...f, ...novas]);
    setErro("");
  }

  function removerFoto(index: number) {
    setFotos(f => f.filter((_, i) => i !== index));
  }

  function validarEtapa() {
    if (etapa === 1) {
      if (!manual && !fipe) { setErro("Escolha o veículo na lista (marca, modelo e ano) ou clique em “Não encontrei meu veículo na lista”."); return false; }
      if (!form.marca) { setErro("Preencha a marca."); return false; }
      if (!form.modelo) { setErro("Preencha o modelo."); return false; }
      if (!form.ano || !form.km) { setErro("Preencha o ano e a KM."); return false; }
      const preco = lerPreco(form.preco);
      if (!preco) { setErro("Preencha o preço."); return false; }
      if (preco > 20_000_000) { setErro("Confira o preço: ficou acima de R$ 20 milhões."); return false; }
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

    const user = await usuarioAtual();
    if (!user) {
      setErro("Você precisa estar logado para publicar um anúncio.");
      setCarregando(false);
      return;
    }

    // Upload das fotos
    setUploadando(true);
    const urlsFotos: string[] = [];
    for (const foto of fotos) {
      if (foto.url) { urlsFotos.push(foto.url); continue; }
      if (!foto.file) continue;
      const url = await enviarFotoVeiculo(user.id, foto.file);
      if (url) urlsFotos.push(url);
    }
    setUploadando(false);

    // A versão já costuma trazer o modelo ("Civic EX 1.5 Turbo"); nesse caso não repete.
    const versaoComModelo = form.versao && form.modelo && form.versao.toLowerCase().startsWith(form.modelo.toLowerCase());
    const nomeVeiculo = [form.marca, versaoComModelo ? null : form.modelo, form.versao, form.ano].filter(Boolean).join(" ");
    // ano e km são texto no banco; guarda só os dígitos (ou null se vazio).
    const soNumero = (v: string) => { const n = parseInt(v.replace(/\D/g, ""), 10); return Number.isNaN(n) ? null : n; };

    const dados = {
      nome: nomeVeiculo,
      tipo: form.tipo,
      marca: form.marca,
      modelo: form.modelo,
      versao: form.versao,
      ano: soNumero(form.ano)?.toString() ?? null,
      km: soNumero(form.km)?.toString() ?? null,
      cambio: form.cambio,
      combustivel: form.combustivel,
      cor: form.cor,
      portas: form.portas,
      preco: lerPreco(form.preco),
      aceita_troca: form.aceitaTroca,
      opcionais: form.opcionais,
      descricao: form.descricao,
      nome_contato: form.nome,
      telefone: form.telefone,
      cidade: form.cidade,
      usuario_id: user.id,
      status: "ativo",
      ativo: true,
      fotos: urlsFotos,
      // Escolha da FIPE só vale para o mesmo tipo (carro/moto) do anúncio.
      ...camposFipe(!manual && fipe && fipe.tipo === (form.tipo === "moto" ? "motorcycles" : "cars") ? fipe : null),
    };
    // Na edição não mexe em dono nem em pausado/ativo (isso é pelo painel).
    const { usuario_id: _dono, status: _status, ativo: _ativo, ...dadosEdicao } = dados;
    const { data: salvo, error } = editandoId ? await atualizarVeiculo(editandoId, dadosEdicao) : await criarVeiculo(dados);
    // Grava o valor da FIPE (feito no servidor, que consulta a tabela). Falha aqui não impede o anúncio.
    if (!error && salvo?.id && dados.fipe_ano) {
      await fetch("/api/fipe/vincular", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: salvo.id }) }).catch(() => {});
    }
    // Fotos que o lojista removeu na edição saem do Storage (depois de salvar, para não perder nada se falhar).
    if (!error && editandoId) await apagarFotos(fotosOriginais.filter(url => !urlsFotos.includes(url)));

    setCarregando(false);

    if (error) {
      console.error(error);
      setErro(mensagemErroAnuncio(error.message) ?? "Erro ao publicar. Tente novamente.");
      return;
    }

    setEtapa(4);
  }

  function avancar() {
    if (!validarEtapa()) return;
    setEtapa(e => e + 1);
  }

  if (etapa === 4) return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🚗</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#1A1917", marginBottom: 8 }}>{editandoId ? "Anúncio atualizado!" : "Anúncio publicado!"}</div>
        <p style={{ fontSize: 15, color: "#7A7670", marginBottom: 24 }}>{editandoId ? "As alterações já estão no site." : "Seu veículo já está visível para compradores da região."}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link href="/painel" style={{ padding: "10px 24px", border: "1.5px solid #E8E6E1", borderRadius: 8, textDecoration: "none", color: "#1A1917", fontWeight: 500, fontSize: 14 }}>Ver painel</Link>
          <Link href="/veiculos" style={{ padding: "10px 24px", background: "#E85D26", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Ver anúncios</Link>
        </div>
      </div>
    </main>
  );

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo.png" alt="AutoRegião" width={36} height={36} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: 20, fontWeight: 800, color: "#1A1917" }}><span style={{ color: "#E85D26" }}>Auto</span>Região</span>
        </Link>
        <Link href="/painel" style={{ fontSize: 13, color: "#7A7670", textDecoration: "none" }}>← Voltar ao painel</Link>
      </nav>

      <div style={{ paddingTop: 80, paddingBottom: 60, display: "flex", justifyContent: "center", padding: "80px 24px 60px" }}>
        <div style={{ width: "100%", maxWidth: 600 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 4 }}>{editandoId ? "Editar anúncio" : "Novo anúncio"}</div>
            <p style={{ fontSize: 14, color: "#7A7670" }}>{carregandoEdicao ? "Carregando o anúncio..." : editandoId ? "Altere o que precisar e salve" : "Preencha os dados do veículo para publicar"}</p>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {["Veículo", "Fotos", "Contato"].map((label, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: 4, borderRadius: 2, background: etapa >= i + 1 ? "#E85D26" : "#E8E6E1", opacity: etapa === i + 1 ? 1 : etapa > i + 1 ? 0.5 : 1 }}></div>
                <div style={{ fontSize: 11, color: etapa >= i + 1 ? "#E85D26" : "#7A7670", marginTop: 4, fontWeight: etapa === i + 1 ? 600 : 400 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 14, padding: "28px" }}>

            {erro && (
              <div style={{ background: "#FEE2E2", border: "1.5px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#991B1B", fontWeight: 500 }}>
                ⚠️ {erro}
              </div>
            )}

            {etapa === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#7A7670", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Tipo</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["carro", "🚗 Carro"], ["moto", "🏍️ Moto"], ["utilitario", "🚐 Utilitário"]].map(([val, label]) => (
                      <button key={val} onClick={() => { set("tipo", val); set("marca", ""); set("modelo", ""); set("versao", ""); setFipe(null); }}
                        style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1.5px solid", borderColor: form.tipo === val ? "#E85D26" : "#E8E6E1", background: form.tipo === val ? "#FFF5F1" : "#fff", color: form.tipo === val ? "#E85D26" : "#7A7670", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {!manual ? (
                  <SeletorFipe
                    key={`${form.tipo}|${editandoId ?? "novo"}|${carregandoEdicao}`}
                    tipoAnuncio={form.tipo}
                    marcaSugerida={form.marca}
                    preco={lerPreco(form.preco)}
                    inicial={fipe}
                    onChange={escolherFipe}
                    onNaoEncontrei={() => setManual(true)}
                  />
                ) : (
                  <div style={{ fontSize: 12, color: "#7A7670", background: "#F7F6F3", border: "1.5px solid #E8E6E1", borderRadius: 10, padding: "10px 12px", lineHeight: 1.5 }}>
                    Preencha marca, modelo e versão à mão. Sem a Tabela FIPE, o anúncio não recebe o selo “💰 Abaixo da FIPE”.{" "}
                    <button type="button" onClick={() => setManual(false)} style={{ background: "none", border: "none", padding: 0, color: "#E85D26", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>
                      Buscar na Tabela FIPE
                    </button>
                  </div>
                )}

                {(manual || fipe || form.modelo) && (
                  <>
                    {manual && (
                      <div>
                        <label style={labelStyle}>Marca <span style={{ color: "#E85D26" }}>*</span></label>
                        <input placeholder="Ex: Chevrolet" value={form.marca} onChange={e => set("marca", e.target.value)} style={inputStyle} />
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Modelo <span style={{ color: "#E85D26" }}>*</span></label>
                        <input placeholder="Ex: Onix" value={form.modelo} onChange={e => set("modelo", e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Versão</label>
                        <input placeholder="Ex: Premier 1.0 Turbo Aut." value={form.versao} onChange={e => set("versao", e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                    {!manual && <div style={{ fontSize: 11.5, color: "#A8A49D", marginTop: -6 }}>Preenchido pela FIPE. Pode ajustar o texto se quiser.</div>}
                  </>
                )}

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
                    <input placeholder="Ex: 72.900" inputMode="decimal" value={form.preco} onChange={e => set("preco", e.target.value)} style={inputStyle} />
                    {lerPreco(form.preco) && <div style={{ fontSize: 11.5, color: "#7A7670", marginTop: 4 }}>Vai aparecer como <strong style={{ color: "#1A1917" }}>{formatarPreco(lerPreco(form.preco))}</strong></div>}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" id="troca" checked={form.aceitaTroca} onChange={e => set("aceitaTroca", e.target.checked)} style={{ width: 16, height: 16, accentColor: "#E85D26" }} />
                  <label htmlFor="troca" style={{ fontSize: 13, color: "#1A1917", cursor: "pointer" }}>Aceita troca</label>
                </div>
              </div>
            )}

            {etapa === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* UPLOAD DE FOTOS */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 4 }}>Fotos do veículo</div>
                  <div style={{ fontSize: 11, color: "#7A7670", marginBottom: 10 }}>{fotos.length}/20 fotos adicionadas</div>

                  {/* ÁREA DE DROP */}
                  <div
                    onClick={() => inputFotoRef.current?.click()}
                    style={{ border: "2px dashed #E8E6E1", borderRadius: 10, padding: "28px", textAlign: "center", background: "#F7F6F3", cursor: "pointer", marginBottom: 12 }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                    <div style={{ fontSize: 13, color: "#1A1917", fontWeight: 500, marginBottom: 2 }}>Clique para adicionar fotos</div>
                    <div style={{ fontSize: 11, color: "#7A7670" }}>JPG ou PNG · Até 20 fotos · 5MB cada</div>
                  </div>
                  <input
                    ref={inputFotoRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleSelecionarFotos}
                  />

                  {/* GRID DE PREVIEWS */}
                  {fotos.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                      {fotos.map((foto, i) => (
                        <div key={i} style={{ position: "relative", aspectRatio: "4/3", borderRadius: 8, overflow: "hidden", border: i === 0 ? "2px solid #E85D26" : "1.5px solid #E8E6E1" }}>
                          <img src={foto.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          {i === 0 && (
                            <span style={{ position: "absolute", bottom: 4, left: 4, background: "#E85D26", color: "#fff", fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4 }}>CAPA</span>
                          )}
                          <button
                            onClick={() => removerFoto(i)}
                            style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* OPCIONAIS */}
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

                {/* DESCRIÇÃO */}
                <div>
                  <label style={labelStyle}>Descrição</label>
                  <textarea placeholder="Descreva o veículo..." value={form.descricao} onChange={e => set("descricao", e.target.value)}
                    style={{ ...inputStyle, height: 100, resize: "vertical" as const }} />
                </div>
              </div>
            )}

            {etapa === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "#F7F6F3", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#7A7670" }}>
                  📋 Essas informações serão exibidas no anúncio para os compradores entrarem em contato.
                </div>
                {[["Nome / Loja", "nome", "text", "Ex: Auto Paulista"],
                  ["Telefone / WhatsApp", "telefone", "tel", "(14) 99999-9999"],
                  ["Cidade", "cidade", "text", "Ex: Teixeira de Freitas"]].map(([label, field, type, ph]) => (
                  <div key={field}>
                    <label style={labelStyle}>{label} <span style={{ color: "#E85D26" }}>*</span></label>
                    <input type={type} placeholder={ph} value={form[field as keyof typeof form] as string} onChange={e => set(field, e.target.value)} style={inputStyle} />
                  </div>
                ))}
                <div style={{ background: "#F7F6F3", borderRadius: 10, padding: "16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", marginBottom: 10 }}>Resumo</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 4 }}>{form.marca} {form.modelo} {form.versao}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {[form.ano, form.km && `${form.km} km`, form.cambio, form.combustivel].filter(Boolean).map(tag => (
                      <span key={tag} style={{ fontSize: 11, color: "#7A7670", background: "#fff", padding: "2px 8px", borderRadius: 4, border: "1px solid #E8E6E1" }}>{tag}</span>
                    ))}
                  </div>
                  {fotos.length > 0 && (
                    <div style={{ fontSize: 11, color: "#16A34A", marginBottom: 6 }}>📷 {fotos.length} foto{fotos.length > 1 ? "s" : ""} adicionada{fotos.length > 1 ? "s" : ""}</div>
                  )}
                  {lerPreco(form.preco) && <div style={{ fontSize: 18, fontWeight: 800, color: "#E85D26" }}>{formatarPreco(lerPreco(form.preco))}</div>}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              {etapa > 1 && (
                <button onClick={() => setEtapa(e => e - 1)}
                  style={{ flex: 1, padding: "10px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#fff", color: "#1A1917", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  ← Voltar
                </button>
              )}
              <button onClick={etapa === 3 ? publicar : avancar} disabled={carregando || uploadando}
                style={{ flex: 2, padding: "10px", background: carregando || uploadando ? "#C44818" : "#E85D26", border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 700, cursor: carregando || uploadando ? "not-allowed" : "pointer", opacity: carregando || uploadando ? 0.8 : 1 }}>
                {uploadando ? "Enviando fotos..." : carregando ? (editandoId ? "Salvando..." : "Publicando...") : etapa === 3 ? (editandoId ? "Salvar alterações ✓" : "Publicar anúncio 🚀") : "Continuar →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}