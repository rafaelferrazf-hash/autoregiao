"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function handleLogin() {
    if (!email || !senha) return setErro("Preencha e-mail e senha.");
    setErro("");
    setCarregando(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      setCarregando(false);
      if (error) {
        setErro(error.message.includes("Invalid login") ? "E-mail ou senha incorretos." : "Erro ao entrar. Tente novamente.");
      } else {
        setSucesso(true);
        setTimeout(() => { window.location.href = "/painel"; }, 1500);
      }
    } catch (e) {
      setCarregando(false);
      setErro("Erro inesperado. Tente novamente.");
    }
  }

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      <style>{`
        .login-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .login-banner { display: flex !important; }
        @media (max-width: 768px) {
          .login-grid { grid-template-columns: 1fr !important; }
          .login-banner { display: none !important; }
          .login-form { padding: 24px 20px !important; }
        }
      `}</style>

      <nav style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/logo.png" alt="AutoRegião" width={32} height={32} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: "#1A1917" }}>
            <span style={{ color: "#E85D26" }}>Auto</span>Região
          </span>
        </Link>
        <div style={{ fontSize: 13, color: "#7A7670" }}>
          Não tem conta? <Link href="/cadastro" style={{ color: "#E85D26", fontWeight: 600, textDecoration: "none" }}>Cadastre-se grátis</Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div className="login-grid" style={{ maxWidth: 900, width: "100%", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1px solid #E8E6E1" }}>

          {/* FORMULÁRIO */}
          <div className="login-form" style={{ padding: "40px 36px" }}>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 6 }}>Bem-vindo de volta!</h1>
            <p style={{ fontSize: 14, color: "#7A7670", marginBottom: 24, lineHeight: 1.5 }}>Entre na sua conta para acessar seus anúncios e favoritos.</p>

            <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "#F7F6F3", borderRadius: 8, padding: 4 }}>
              <button style={{ flex: 1, padding: "9px 0", borderRadius: 6, border: "none", background: "#fff", fontSize: 14, fontWeight: 600, color: "#1A1917", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>Entrar</button>
              <Link href="/cadastro" style={{ flex: 1, padding: "9px 0", borderRadius: 6, background: "transparent", fontSize: 14, fontWeight: 500, color: "#7A7670", textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>Cadastrar</Link>
            </div>

            {sucesso && <div style={{ background: "#D1FAE5", border: "1.5px solid #6EE7B7", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#065F46" }}>✅ Login realizado! Redirecionando...</div>}
            {erro && <div style={{ background: "#FEE2E2", border: "1.5px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#991B1B" }}>⚠️ {erro}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>E-mail</label>
                <input type="email" placeholder="seu@email.com.br" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 15, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.5 }}>Senha</label>
                  <a href="#" style={{ fontSize: 12, color: "#E85D26", textDecoration: "none", fontWeight: 500 }}>Esqueci minha senha</a>
                </div>
                <input type="password" placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
                  style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 15, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="lembrar" checked={lembrar} onChange={e => setLembrar(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#E85D26", cursor: "pointer" }} />
                <label htmlFor="lembrar" style={{ fontSize: 14, color: "#7A7670", cursor: "pointer" }}>Lembrar de mim</label>
              </div>
              <button onClick={handleLogin} disabled={carregando}
                style={{ width: "100%", padding: "14px", background: carregando ? "#C44818" : "#E85D26", color: "#fff", border: "none", borderRadius: 9, fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, cursor: carregando ? "not-allowed" : "pointer", opacity: carregando ? 0.8 : 1 }}>
                {carregando ? "Entrando..." : "Entrar na minha conta"}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E8E6E1" }}></div>
              <span style={{ fontSize: 12, color: "#7A7670" }}>ou entre com</span>
              <div style={{ flex: 1, height: 1, background: "#E8E6E1" }}></div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, padding: "11px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#fff", fontSize: 14, fontWeight: 500, color: "#1A1917", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>G</span> Google
              </button>
              <button style={{ flex: 1, padding: "11px", border: "1.5px solid #E8E6E1", borderRadius: 8, background: "#fff", fontSize: 14, fontWeight: 500, color: "#1A1917", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>📱</span> WhatsApp
              </button>
            </div>

            <div style={{ textAlign: "center", fontSize: 13, color: "#7A7670", marginTop: 20 }}>
              Já tem conta? <Link href="/cadastro" style={{ color: "#E85D26", fontWeight: 600, textDecoration: "none" }}>Cadastrar agora</Link>
            </div>
          </div>

          {/* BANNER — escondido no mobile */}
          <div className="login-banner" style={{ background: "#1A1917", padding: "48px 40px", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, background: "radial-gradient(circle, rgba(232,93,38,0.2) 0%, transparent 70%)", pointerEvents: "none" }}></div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🚗</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 16 }}>
                O carro certo,<br /><span style={{ color: "#E85D26" }}>perto de você.</span>
              </h2>
              <p style={{ fontSize: 14, color: "#7A7670", lineHeight: 1.65, marginBottom: 32 }}>Mais de 1.200 veículos de lojistas verificados da sua região.</p>
              {[["✅", "Lojas verificadas pela AutoRegião"], ["📍", "Veículos perto de você"], ["💬", "Chat direto com o lojista"], ["🔒", "Negociação segura"]].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{text}</span>
                </div>
              ))}
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <Link href="/cadastro" style={{ display: "inline-block", padding: "10px 24px", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Criar conta grátis →</Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div style={{ padding: "16px 24px", textAlign: "center", borderTop: "1px solid #E8E6E1" }}>
        <p style={{ fontSize: 12, color: "#7A7670" }}>© 2026 <span style={{ color: "#E85D26" }}>AutoRegião</span></p>
      </div>

    </main>
  );
}