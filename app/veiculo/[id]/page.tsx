"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Veiculo() {
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [entrada, setEntrada] = useState("14580");
  const [prazo, setPrazo] = useState("60");
  const [menuAberto, setMenuAberto] = useState(false);

  const fotos = [0, 1, 2, 3, 4, 5];
  const parcela = Math.round((72900 - Number(entrada)) * (0.0149 / (1 - Math.pow(1.0149, -Number(prazo)))));

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh" }}>

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile-btn { display: none !important; }
        .veiculo-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
        .contato-sticky { position: sticky; top: 76px; }
        .contato-fixo-mobile { display: none !important; }
        .thumbnails-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
        .caracteristicas-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .breadcrumb { display: flex !important; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .veiculo-grid { grid-template-columns: 1fr !important; }
          .contato-sticky { display: none !important; }
          .contato-fixo-mobile { display: flex !important; }
          .thumbnails-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .caracteristicas-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .breadcrumb { display: none !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E8E6E1" }}>
        <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo.png" alt="AutoRegião" width={32} height={32} style={{ objectFit: "contain" }} />
            <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: "#1A1917" }}>
              <span style={{ color: "#E85D26" }}>Auto</span>Região
            </span>
          </Link>

          <div className="breadcrumb" style={{ alignItems: "center", gap: 6, fontSize: 13, color: "#7A7670" }}>
            <Link href="/" style={{ color: "#7A7670", textDecoration: "none" }}>Início</Link>
            <span>›</span>
            <Link href="/veiculos" style={{ color: "#7A7670", textDecoration: "none" }}>Chevrolet</Link>
            <span>›</span>
            <span style={{ color: "#1A1917", fontWeight: 500 }}>Onix LT 1.0 2022</span>
          </div>

          <div style={{ display: "flex", gap: 8 }} className="nav-desktop">
            <Link href="/login" style={{ padding: "7px 16px", border: "1.5px solid #E8E6E1", borderRadius: 7, background: "transparent", fontSize: 13, fontWeight: 500, color: "#1A1917", textDecoration: "none", display: "flex", alignItems: "center" }}>Entrar</Link>
            <Link href="/cadastro" style={{ padding: "7px 16px", background: "#E85D26", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center" }}>Cadastrar loja</Link>
          </div>

          <button className="nav-mobile-btn" onClick={() => setMenuAberto(!menuAberto)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, flexDirection: "column", gap: 5 }}>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, transition: "all 0.2s", transform: menuAberto ? "rotate(45deg) translate(5px, 5px)" : "none" }}></span>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, opacity: menuAberto ? 0 : 1 }}></span>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, transition: "all 0.2s", transform: menuAberto ? "rotate(-45deg) translate(5px, -5px)" : "none" }}></span>
          </button>
        </div>
        {menuAberto && (
          <div style={{ borderTop: "1px solid #E8E6E1", background: "#fff", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
            {["Buscar veículos", "Revendas", "Tabela FIPE", "Financiamento", "Anunciar"].map(item => (
              <a key={item} href="#" style={{ textDecoration: "none", color: "#1A1917", fontSize: 15, fontWeight: 500 }}>{item}</a>
            ))}
            <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #E8E6E1" }}>
              <Link href="/login" style={{ flex: 1, padding: "10px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 14, fontWeight: 500, color: "#1A1917", textDecoration: "none", textAlign: "center" }}>Entrar</Link>
              <Link href="/cadastro" style={{ flex: 1, padding: "10px", background: "#E85D26", borderRadius: 7, color: "#fff", fontSize: 14, fontWeight: 500, textDecoration: "none", textAlign: "center" }}>Cadastrar loja</Link>
            </div>
          </div>
        )}
      </nav>

      {/* CONTEÚDO */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "76px 16px 100px" }}>
        <div className="veiculo-grid">

          {/* COLUNA ESQUERDA */}
          <div>
            {/* GALERIA */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ position: "relative", height: 300, borderRadius: 12, overflow: "hidden", marginBottom: 10, border: "1.5px solid #E8E6E1" }}>
                <Image src="/sem-foto.png" alt="Foto do veículo" fill style={{ objectFit: "cover" }} sizes="100vw" />
                <span style={{ position: "absolute", top: 12, left: 12, background: "#E85D26", color: "#fff", fontSize: 11, fontWeight: 500, padding: "4px 12px", borderRadius: 20 }}>⭐ Em Destaque</span>
                <span style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, padding: "4px 10px", borderRadius: 6 }}>📷 {fotoAtiva + 1} / 6</span>
                <button onClick={() => setFotoAtiva(Math.max(0, fotoAtiva - 1))} style={{ position: "absolute", top: "50%", left: 10, transform: "translateY(-50%)", width: 36, height: 36, background: "rgba(255,255,255,0.85)", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}>‹</button>
                <button onClick={() => setFotoAtiva(Math.min(5, fotoAtiva + 1))} style={{ position: "absolute", top: "50%", right: 10, transform: "translateY(-50%)", width: 36, height: 36, background: "rgba(255,255,255,0.85)", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}>›</button>
              </div>
              <div className="thumbnails-grid">
                {fotos.map(i => (
                  <div key={i} onClick={() => setFotoAtiva(i)} style={{ position: "relative", height: 56, borderRadius: 7, overflow: "hidden", border: fotoAtiva === i ? "2px solid #E85D26" : "1.5px solid #E8E6E1", cursor: "pointer" }}>
                    <Image src="/sem-foto.png" alt={`Foto ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="80px" />
                  </div>
                ))}
              </div>
            </div>

            {/* TAGS E TÍTULO */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 4, background: "rgba(232,93,38,0.08)", color: "#E85D26" }}>⭐ Destaque</span>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 4, background: "rgba(22,163,74,0.08)", color: "#16A34A" }}>✅ Loja Verificada</span>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 4, background: "#F7F6F3", color: "#7A7670", border: "1px solid #E8E6E1" }}>📍 Lençóis Paulista</span>
              </div>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 6 }}>Chevrolet Onix LT 1.0 Turbo</h1>
              <p style={{ fontSize: 14, color: "#7A7670", marginBottom: 14 }}>2022 · 38.000 km · Flex · Automático · Prata</p>

              {/* PREÇO */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: 16, background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 800, color: "#1A1917", lineHeight: 1 }}>R$ 72.900</div>
                  <div style={{ fontSize: 13, color: "#7A7670", marginTop: 4 }}>ou 60x de R$ 1.580 · Taxa 1,49% a.m.</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#7A7670", textTransform: "uppercase" }}>Tabela FIPE</div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#16A34A", marginTop: 2 }}>↓ 4% abaixo</div>
                  <div style={{ fontSize: 10.5, color: "#7A7670" }}>FIPE: R$ 75.800</div>
                </div>
              </div>
            </div>

            {/* CARACTERÍSTICAS */}
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Características</div>
              <div className="caracteristicas-grid">
                {[["📅", "Ano", "2022/2022"], ["📍", "Quilometragem", "38.000 km"], ["⛽", "Combustível", "Flex"],
                  ["⚙️", "Câmbio", "Automático"], ["🏎️", "Motor", "1.0 Turbo"], ["🎨", "Cor", "Prata"],
                  ["🚪", "Portas", "4 portas"], ["👥", "Lugares", "5 lugares"], ["📋", "Final placa", "7"]
                ].map(([icon, label, value], i) => (
                  <div key={label} style={{ padding: "12px 14px", borderRight: (i + 1) % 3 !== 0 ? "1px solid #E8E6E1" : "none", borderBottom: i < 6 ? "1px solid #E8E6E1" : "none" }}>
                    <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 10, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DESCRIÇÃO */}
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Descrição</div>
              <div style={{ padding: "16px 18px", fontSize: 14, lineHeight: 1.7, color: "#1A1917" }}>
                <p style={{ marginBottom: 10 }}>Onix LT 1.0 Turbo 2022 em perfeito estado de conservação. Único dono, todas as revisões feitas na concessionária com comprovantes. IPVA 2025 pago e licenciado.</p>
                <p style={{ marginBottom: 10 }}>Pneus novos, freios revisados, ar condicionado gelando. Interior impecável, sem manchas ou rasgos.</p>
                <p>Aceito troca por veículo de menor valor com volta. Financiamento facilitado via BV Financeira e Santander com aprovação na hora.</p>
              </div>
            </div>

            {/* OPCIONAIS */}
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>Opcionais</div>
              <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["Ar-condicionado", "Direção elétrica", "Vidros elétricos", "Travas elétricas", "Airbag duplo", "ABS", "Central multimídia", "Bluetooth", "Câmera de ré", "Sensor de estacionamento", "Faróis de neblina", "Rodas de liga"].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1A1917" }}>
                    <span style={{ fontSize: 13, color: "#16A34A" }}>✅</span> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* SIMULADOR */}
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917" }}>💰 Simular financiamento</div>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 500, color: "#7A7670", textTransform: "uppercase", marginBottom: 5 }}>Valor de entrada</div>
                    <input type="number" value={entrada} onChange={e => setEntrada(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 500, color: "#7A7670", textTransform: "uppercase", marginBottom: 5 }}>Prazo</div>
                    <select value={prazo} onChange={e => setPrazo(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }}>
                      <option value="60">60 meses</option>
                      <option value="48">48 meses</option>
                      <option value="36">36 meses</option>
                      <option value="24">24 meses</option>
                    </select>
                  </div>
                </div>
                <div style={{ background: "#F7F6F3", border: "1.5px solid #E8E6E1", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#7A7670" }}>Parcela estimada</div>
                    <div style={{ fontSize: 10.5, color: "#7A7670", marginTop: 2 }}>Taxa aprox. 1,49% a.m. · {prazo}x</div>
                  </div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 800, color: "#E85D26" }}>R$ {isNaN(parcela) ? "---" : parcela.toLocaleString("pt-BR")}</div>
                </div>
                <button style={{ width: "100%", marginTop: 12, padding: 10, background: "#1A1917", color: "#fff", border: "none", borderRadius: 8, fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Solicitar financiamento →</button>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA — desktop */}
          <div className="contato-sticky" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: "#1A1917", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, background: "#E85D26", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏪</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#fff" }}>Auto Paulista</div>
                  <div style={{ fontSize: 11.5, color: "#7A7670", marginTop: 2 }}>📍 Lençóis Paulista, SP</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, color: "#E85D26" }}>⭐ 4.8</div>
                  <div style={{ fontSize: 10.5, color: "#7A7670", marginTop: 1 }}>24 avaliações</div>
                </div>
              </div>
              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <button style={{ width: "100%", padding: 13, background: "#25D366", color: "#fff", border: "none", borderRadius: 9, fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📱 Chamar no WhatsApp</button>
                <button style={{ width: "100%", padding: 11, background: "#F7F6F3", color: "#1A1917", border: "1.5px solid #E8E6E1", borderRadius: 9, fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>💬 Enviar mensagem</button>
                <button style={{ width: "100%", padding: 11, background: "#F7F6F3", color: "#1A1917", border: "1.5px solid #E8E6E1", borderRadius: 9, fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>📞 Ver telefone</button>
              </div>
              <div style={{ padding: "12px 18px", borderTop: "1px solid #E8E6E1", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11.5, color: "#7A7670" }}>👁️ 342 visualizações</span>
                <span style={{ fontSize: 11.5, color: "#7A7670" }}>🕐 Responde em ~1h</span>
              </div>
            </div>
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: 14, display: "flex", gap: 8 }}>
              {[["🤍", "Favoritar"], ["📤", "Compartilhar"], ["📋", "Comparar"], ["🔔", "Alertar"]].map(([icon, label]) => (
                <button key={label} style={{ flex: 1, padding: "10px 6px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#F7F6F3", cursor: "pointer", textAlign: "center", fontSize: 11, fontWeight: 500, color: "#1A1917", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>{label}
                </button>
              ))}
            </div>
            <div style={{ background: "rgba(22,163,74,0.08)", border: "1.5px solid rgba(22,163,74,0.15)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#16A34A", marginBottom: 10 }}>🛡️ Compre com segurança</div>
              {["Loja verificada pela AutoRegião", "Anúncio com fotos reais", "Negocie direto com o lojista", "Solicite laudo cautelar"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#1A1917", marginBottom: 6 }}>
                  <span style={{ color: "#16A34A" }}>✅</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTÕES FIXOS MOBILE */}
      <div className="contato-fixo-mobile" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #E8E6E1", padding: "12px 16px", gap: 10, zIndex: 50 }}>
        <button style={{ flex: 1, padding: "13px", background: "#25D366", color: "#fff", border: "none", borderRadius: 9, fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📱 WhatsApp</button>
        <button style={{ flex: 1, padding: "13px", background: "#E85D26", color: "#fff", border: "none", borderRadius: 9, fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📞 Ligar</button>
      </div>

    </main>
  );
}