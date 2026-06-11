"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

const dadosVeiculos: Record<string, Record<string, Record<string, string[]>>> = {
  carro: {
    "Chevrolet": {
      "Onix": ["Onix 1.0 MT", "Onix 1.0 Turbo AT", "Onix Plus 1.0 MT", "Onix Plus 1.0 Turbo AT"],
      "Tracker": ["Tracker 1.0 Turbo MT", "Tracker 1.2 Turbo AT", "Tracker Premier"],
      "Cruze": ["Cruze LT 1.4 Turbo", "Cruze LTZ 1.4 Turbo", "Cruze Premier"],
      "S10": ["S10 LS 2.5", "S10 LT 2.8 TD", "S10 High Country 2.8 TD"],
      "Spin": ["Spin LT 1.8", "Spin LTZ 1.8", "Spin Activ 1.8"],
      "Montana": ["Montana 1.2 Turbo MT", "Montana 1.2 Turbo AT"],
    },
    "Volkswagen": {
      "Polo": ["Polo 1.0 MT", "Polo 1.0 TSI AT", "Polo Track 1.0"],
      "Virtus": ["Virtus 1.0 MT", "Virtus 1.0 TSI AT", "Virtus GTS 1.0 TSI"],
      "T-Cross": ["T-Cross 1.0 TSI MT", "T-Cross 1.4 TSI AT", "T-Cross Highline"],
      "Tiguan": ["Tiguan 1.4 TSI", "Tiguan 2.0 TSI Allspace"],
      "Nivus": ["Nivus 1.0 TSI MT", "Nivus 1.0 TSI AT"],
      "Amarok": ["Amarok 2.0 TDI", "Amarok V6 3.0 TDI"],
    },
    "Fiat": {
      "Pulse": ["Pulse Drive 1.3", "Pulse Audace 1.0 Turbo", "Pulse Impetus 1.0 Turbo"],
      "Cronos": ["Cronos 1.3 MT", "Cronos 1.3 AT", "Cronos Precision 1.3"],
      "Strada": ["Strada Endurance 1.4", "Strada Freedom 1.3 Turbo", "Strada Ultra 1.3 Turbo"],
      "Toro": ["Toro Freedom 1.8", "Toro Endurance 2.0 TD", "Toro Ultra 2.0 TD"],
      "Mobi": ["Mobi Like 1.0", "Mobi Drive 1.0"],
      "Argo": ["Argo Drive 1.0", "Argo 1.3 AT", "Argo Trekking 1.3"],
    },
    "Toyota": {
      "Corolla": ["Corolla GLi 2.0", "Corolla XEi 2.0", "Corolla Altis Hybrid"],
      "Yaris": ["Yaris XL 1.3 MT", "Yaris XLS 1.5 AT", "Yaris XLS Connect"],
      "Hilux": ["Hilux SR 2.8 TD", "Hilux SRV 2.8 TD", "Hilux SRX 2.8 TD"],
      "SW4": ["SW4 SR 2.8 TD", "SW4 SRX 2.8 TD", "SW4 Diamond 2.8 TD"],
      "RAV4": ["RAV4 2.5 Hybrid", "RAV4 2.5 Hybrid AWD"],
    },
    "Honda": {
      "Civic": ["Civic EX 1.5 Turbo", "Civic EXL 1.5 Turbo", "Civic Touring 1.5 Turbo"],
      "HR-V": ["HR-V LX 1.8", "HR-V EX 1.8", "HR-V EXL 1.8"],
      "City": ["City DX 1.5", "City EX 1.5", "City EXL 1.5"],
      "WR-V": ["WR-V EX 1.5", "WR-V EXL 1.5"],
      "Fit": ["Fit LX 1.5", "Fit EX 1.5", "Fit EXL 1.5"],
    },
    "Hyundai": {
      "HB20": ["HB20 1.0 MT", "HB20 1.0 Turbo AT", "HB20 Diamond Plus"],
      "HB20S": ["HB20S 1.0 MT", "HB20S 1.0 Turbo AT"],
      "Creta": ["Creta Action 1.0 Turbo", "Creta Comfort 1.0 Turbo", "Creta Platinum 1.0 Turbo"],
      "Tucson": ["Tucson GLS 1.6 Turbo", "Tucson Limited 1.6 Turbo"],
      "i30": ["i30 1.0 Turbo MT", "i30 1.0 Turbo AT"],
    },
    "Renault": {
      "Kwid": ["Kwid Zen 1.0", "Kwid Intense 1.0", "Kwid Outsider 1.0"],
      "Sandero": ["Sandero Zen 1.0", "Sandero Stepway 1.0 Turbo"],
      "Logan": ["Logan Life 1.0", "Logan Zen 1.0"],
      "Duster": ["Duster Zen 1.3 Turbo", "Duster Iconic 1.3 Turbo"],
      "Oroch": ["Oroch Zen 1.3 Turbo", "Oroch Iconic 1.3 Turbo"],
    },
    "Jeep": {
      "Renegade": ["Renegade Sport 1.3 Turbo", "Renegade Longitude 1.3 Turbo", "Renegade Trailhawk"],
      "Compass": ["Compass Sport 1.3 Turbo", "Compass Longitude 1.3 Turbo", "Compass Trailhawk"],
      "Commander": ["Commander Limited 1.3 Turbo", "Commander Overland 2.0 TD"],
    },
    "Nissan": {
      "Kicks": ["Kicks S 1.6", "Kicks SV 1.6", "Kicks Exclusive 1.6"],
      "Frontier": ["Frontier S 2.3 TD", "Frontier SV 2.3 TD", "Frontier PRO-4X 2.3 TD"],
      "Versa": ["Versa Sense 1.6", "Versa Advance 1.6", "Versa Exclusive 1.6"],
    },
    "Ford": {
      "Ranger": ["Ranger XL 2.0 TD", "Ranger XLS 2.0 TD", "Ranger Storm 3.0 TD"],
      "Bronco": ["Bronco Sport Big Bend", "Bronco Sport Badlands"],
      "Territory": ["Territory SE 1.5 Turbo", "Territory Titanium 1.5 Turbo"],
    },
  },
  moto: {
    "Honda": {
      "CB": ["CB 300F Twister", "CB 500F", "CB 500X", "CB 650R"],
      "CG": ["CG 160 Start", "CG 160 Fan", "CG 160 Titan", "CG 160 Job"],
      "Biz": ["Biz 110i"],
      "PCX": ["PCX 160"],
      "XRE": ["XRE 190", "XRE 300"],
      "NXR": ["NXR 160 Bros"],
    },
    "Yamaha": {
      "Factor": ["Factor 125i", "Factor 150i"],
      "Fazer": ["Fazer 250", "Fazer 150"],
      "MT": ["MT-03", "MT-07", "MT-09"],
      "Crosser": ["Crosser 150", "Crosser Z 150"],
      "NMAX": ["NMAX 160"],
      "Lander": ["Lander 250"],
    },
    "Kawasaki": {
      "Ninja": ["Ninja 300", "Ninja 400", "Ninja 650"],
      "Z": ["Z 300", "Z 400", "Z 650"],
      "Versys": ["Versys 650", "Versys-X 300"],
    },
    "Suzuki": {
      "GSX": ["GSX-S750", "GSX-S1000"],
      "V-Strom": ["V-Strom 650", "V-Strom 1050"],
      "Burgman": ["Burgman 125i", "Burgman 400"],
    },
    "BMW": {
      "G": ["G 310 R", "G 310 GS", "G 450 GS"],
      "R": ["R 1250 GS", "R 1250 RT"],
      "S": ["S 1000 RR", "S 1000 XR"],
    },
  },
  utilitario: {
    "Mercedes-Benz": {
      "Sprinter": ["Sprinter 311 CDI", "Sprinter 313 CDI", "Sprinter 415 CDI"],
      "Vito": ["Vito 119 CDI", "Vito 124 CDI"],
    },
    "Volkswagen": {
      "Kombi": ["Kombi 1.4 Flex"],
      "Transporter": ["Transporter 2.0 TDI"],
      "Crafter": ["Crafter 2.0 TDI"],
    },
    "Fiat": {
      "Ducato": ["Ducato Minibus", "Ducato Cargo", "Ducato Ambulância"],
      "Doblò": ["Doblò Cargo 1.8", "Doblò Adventure 1.8"],
    },
    "Ford": {
      "Transit": ["Transit 2.0 TDCi Van", "Transit 2.0 TDCi Minibus"],
      "Transit Custom": ["Transit Custom 2.0 TDCi"],
    },
    "Renault": {
      "Master": ["Master 2.3 dCi Furgão", "Master 2.3 dCi Minibus"],
      "Kangoo": ["Kangoo Express 1.6"],
    },
    "Chevrolet": {
      "Express": ["Express 6.0 V8"],
      "Cobalt": ["Cobalt 1.8 LTZ"],
    },
  },
};

type FotoPreview = { file: File; preview: string };

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

  const toggleOpcional = (op: string) => {
    setForm(f => ({
      ...f,
      opcionais: f.opcionais.includes(op)
        ? f.opcionais.filter(o => o !== op)
        : [...f.opcionais, op]
    }));
  };

  const marcas = Object.keys(dadosVeiculos[form.tipo] || {});
  const modelos = form.marca ? Object.keys(dadosVeiculos[form.tipo]?.[form.marca] || {}) : [];
  const versoes = form.marca && form.modelo ? dadosVeiculos[form.tipo]?.[form.marca]?.[form.modelo] || [] : [];

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
      if (!form.marca) { setErro("Selecione a marca."); return false; }
      if (!form.modelo) { setErro("Selecione o modelo."); return false; }
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErro("Você precisa estar logado para publicar um anúncio.");
      setCarregando(false);
      return;
    }

    // Upload das fotos
    setUploadando(true);
    const urlsFotos: string[] = [];
    for (const foto of fotos) {
      const ext = foto.file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("veiculos")
        .upload(path, foto.file, { contentType: foto.file.type });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("veiculos").getPublicUrl(path);
        urlsFotos.push(urlData.publicUrl);
      }
    }
    setUploadando(false);

    const nomeVeiculo = [form.marca, form.modelo, form.versao, form.ano].filter(Boolean).join(" ");

    const { error } = await supabase.from("veiculos").insert({
      nome: nomeVeiculo,
      tipo: form.tipo,
      marca: form.marca,
      modelo: form.modelo,
      versao: form.versao,
      ano: parseInt(form.ano),
      km: parseInt(form.km),
      cambio: form.cambio,
      combustivel: form.combustivel,
      cor: form.cor,
      portas: form.portas,
      preco: parseInt(form.preco.replace(/\D/g, "")),
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
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo.png" alt="AutoRegião" width={36} height={36} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 800, color: "#1A1917" }}><span style={{ color: "#E85D26" }}>Auto</span>Região</span>
        </Link>
        <Link href="/painel" style={{ fontSize: 13, color: "#7A7670", textDecoration: "none" }}>← Voltar ao painel</Link>
      </nav>

      <div style={{ paddingTop: 80, paddingBottom: 60, display: "flex", justifyContent: "center", padding: "80px 24px 60px" }}>
        <div style={{ width: "100%", maxWidth: 600 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 4 }}>Novo anúncio</div>
            <p style={{ fontSize: 14, color: "#7A7670" }}>Preencha os dados do veículo para publicar</p>
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
                      <button key={val} onClick={() => { set("tipo", val); set("marca", ""); set("modelo", ""); set("versao", ""); }}
                        style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1.5px solid", borderColor: form.tipo === val ? "#E85D26" : "#E8E6E1", background: form.tipo === val ? "#FFF5F1" : "#fff", color: form.tipo === val ? "#E85D26" : "#7A7670", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Marca <span style={{ color: "#E85D26" }}>*</span></label>
                    <select value={form.marca} onChange={e => { set("marca", e.target.value); set("modelo", ""); set("versao", ""); }} style={inputStyle}>
                      <option value="">Selecione a marca</option>
                      {marcas.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Modelo <span style={{ color: "#E85D26" }}>*</span></label>
                    <select value={form.modelo} onChange={e => { set("modelo", e.target.value); set("versao", ""); }} style={inputStyle} disabled={!form.marca}>
                      <option value="">Selecione o modelo</option>
                      {modelos.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Versão</label>
                  <select value={form.versao} onChange={e => set("versao", e.target.value)} style={inputStyle} disabled={!form.modelo}>
                    <option value="">Selecione a versão</option>
                    {versoes.map(v => <option key={v}>{v}</option>)}
                  </select>
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
                  ["Cidade", "cidade", "text", "Ex: Lençóis Paulista"]].map(([label, field, type, ph]) => (
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
                  {form.preco && <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: "#E85D26" }}>R$ {form.preco}</div>}
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
                style={{ flex: 2, padding: "10px", background: carregando || uploadando ? "#C44818" : "#E85D26", border: "none", borderRadius: 8, color: "#fff", fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, cursor: carregando || uploadando ? "not-allowed" : "pointer", opacity: carregando || uploadando ? 0.8 : 1 }}>
                {uploadando ? "Enviando fotos..." : carregando ? "Publicando..." : etapa === 3 ? "Publicar anúncio 🚀" : "Continuar →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}