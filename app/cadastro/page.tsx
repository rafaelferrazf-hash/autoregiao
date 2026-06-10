"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Cadastro() {
  const [tipo, setTipo] = useState<"comprador" | "lojista">("comprador");
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", senha: "", confirmarSenha: "", loja: "", cidade: "" });
  const [enviado, setEnviado] = useState(false);

  function handleSubmit() {
    if (!form.nome || !form.email || !form.senha) return alert("Preencha todos os campos obrigatórios.");
    if (form.senha !== form.confirmarSenha) return alert("As senhas não coincidem.");
    setEnviado(true);
  }

  if (enviado) return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 800, color: "#1A1917", marginBottom: 8 }}>Cadastro realizado!</div>
        <p style={{ fontSize: 15, color: "#7A7670", marginBottom: 24 }}>Bem-vindo ao AutoRegião, {form.nome.split(" ")[0]}!</p>
        <Link href="/" style={{ padding: "10px 28px", background: "#E85D26", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Ir para o site</Link>
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
        <span style={{ fontSize: 13, color: "#7A7670" }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ color: "#E85D26", fontWeight: 600, textDecoration: "none" }}>Entrar</Link>
        </span>
      </nav>

      {/* FORMULÁRIO */}
      <div style={{ paddingTop: 90, paddingBottom: 60, display: "flex", justifyContent: "center", padding: "90px 24px 60px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>

          {/* TÍTULO */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 800, color: "#1A1917", marginBottom: 6 }}>Criar conta</div>
            <p style={{ fontSize: 14, color: "#7A7670" }}>Encontre o carro certo perto de você</p>
          </div>

          {/* CARD */}
          <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 14, padding: "28px 28px" }}>

            {/* TIPO DE CONTA */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7A7670", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Tipo de conta</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["comprador", "🔍 Quero comprar"], ["lojista", "🏪 Sou lojista"]].map(([val, label]) => (
                  <button key={val} onClick={() => setTipo(val as "comprador" | "lojista")}
                    style={{ padding: "10px", borderRadius: 8, border: "1.5px solid", borderColor: tipo === val ? "#E85D26" : "#E8E6E1", background: tipo === val ? "#FFF5F1" : "#fff", color: tipo === val ? "#E85D26" : "#7A7670", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* CAMPOS */}
            {[
              ["Nome completo", "nome", "text", "Seu nome completo", true],
              ["E-mail", "email", "email", "seu@email.com", true],
              ["Telefone / WhatsApp", "telefone", "tel", "(14) 99999-9999", false],
            ].map(([label, field, type, placeholder, required]) => (
              <div key={field as string} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 5 }}>
                  {label as string} {required && <span style={{ color: "#E85D26" }}>*</span>}
                </div>
                <input
                  type={type as string}
                  placeholder={placeholder as string}
                  value={form[field as keyof typeof form]}
                  onChange={e => setForm({ ...form, [field as string]: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}

            {/* CAMPOS LOJISTA */}
            {tipo === "lojista" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 5 }}>Nome da loja <span style={{ color: "#E85D26" }}>*</span></div>
                  <input placeholder="Ex: Auto Paulista" value={form.loja} onChange={e => setForm({ ...form, loja: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 5 }}>Cidade <span style={{ color: "#E85D26" }}>*</span></div>
                  <input placeholder="Ex: Lençóis Paulista" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
                </div>
              </>
            )}

            {/* SENHA */}
            {[["Senha", "senha", "Mínimo 8 caracteres"], ["Confirmar senha", "confirmarSenha", "Repita a senha"]].map(([label, field, placeholder]) => (
              <div key={field} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 5 }}>{label} <span style={{ color: "#E85D26" }}>*</span></div>
                <input type="password" placeholder={placeholder}
                  value={form[field as keyof typeof form]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}

            {/* TERMOS */}
            <div style={{ fontSize: 12, color: "#7A7670", marginBottom: 20, lineHeight: 1.5 }}>
              Ao criar sua conta você concorda com os{" "}
              <a href="#" style={{ color: "#E85D26", textDecoration: "none" }}>Termos de uso</a>{" "}e a{" "}
              <a href="#" style={{ color: "#E85D26", textDecoration: "none" }}>Política de privacidade</a>.
            </div>

            {/* BOTÃO */}
            <button onClick={handleSubmit}
              style={{ width: "100%", padding: "11px", background: "#E85D26", color: "#fff", border: "none", borderRadius: 8, fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Criar minha conta
            </button>

            {/* DIVIDER */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E8E6E1" }}></div>
              <span style={{ fontSize: 12, color: "#7A7670" }}>ou</span>
              <div style={{ flex: 1, height: 1, background: "#E8E6E1" }}></div>
            </div>

            {/* LOGIN */}
            <div style={{ textAlign: "center", fontSize: 13, color: "#7A7670" }}>
              Já tem conta?{" "}
              <Link href="/login" style={{ color: "#E85D26", fontWeight: 600, textDecoration: "none" }}>Entrar agora</Link>
            </div>
          </div>

          {/* LOJISTA BANNER */}
          {tipo === "lojista" && (
            <div style={{ marginTop: 16, background: "#1A1917", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 28 }}>🎁</div>
              <div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3 }}>60 dias grátis para lojistas</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Anuncie todos os seus veículos sem custo durante o período de lançamento.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
