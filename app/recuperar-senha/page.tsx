"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleEnviar() {
    if (!email) return setErro("Informe o e-mail da sua conta.");
    setErro("");
    setCarregando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      setCarregando(false);
      if (error) {
        setErro(error.message.toLowerCase().includes("rate limit")
          ? "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo."
          : "Erro ao enviar o e-mail. Tente novamente.");
      } else {
        // Mensagem neutra: não revela se o e-mail existe ou não na base.
        setEnviado(true);
      }
    } catch (e) {
      setCarregando(false);
      setErro("Erro inesperado. Tente novamente.");
    }
  }

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      <nav style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/logo.png" alt="AutoRegião" width={32} height={32} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: "#1A1917" }}>
            <span style={{ color: "#E85D26" }}>Auto</span>Região
          </span>
        </Link>
        <Link href="/login" style={{ fontSize: 13, color: "#E85D26", fontWeight: 600, textDecoration: "none" }}>Voltar ao login</Link>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ maxWidth: 440, width: "100%", background: "#fff", borderRadius: 16, boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1px solid #E8E6E1", padding: "40px 36px", boxSizing: "border-box" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 6 }}>Esqueceu a senha?</h1>
          <p style={{ fontSize: 14, color: "#7A7670", marginBottom: 24, lineHeight: 1.5 }}>Informe o e-mail da sua conta e enviaremos um link para você criar uma senha nova.</p>

          {enviado ? (
            <>
              <div style={{ background: "#D1FAE5", border: "1.5px solid #6EE7B7", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#065F46", lineHeight: 1.5 }}>
                ✅ Se existir uma conta com <strong>{email.trim()}</strong>, você vai receber o link em alguns minutos. Confira também a caixa de spam.
              </div>
              <Link href="/login" style={{ display: "block", textAlign: "center", fontSize: 14, color: "#E85D26", fontWeight: 600, textDecoration: "none" }}>Voltar ao login</Link>
            </>
          ) : (
            <>
              {erro && <div style={{ background: "#FEE2E2", border: "1.5px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#991B1B" }}>⚠️ {erro}</div>}

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>E-mail</label>
                  <input type="email" placeholder="seu@email.com.br" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleEnviar()}
                    style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 15, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
                </div>
                <button onClick={handleEnviar} disabled={carregando}
                  style={{ width: "100%", padding: "14px", background: carregando ? "#C44818" : "#E85D26", color: "#fff", border: "none", borderRadius: 9, fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, cursor: carregando ? "not-allowed" : "pointer", opacity: carregando ? 0.8 : 1 }}>
                  {carregando ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: "16px 24px", textAlign: "center", borderTop: "1px solid #E8E6E1" }}>
        <p style={{ fontSize: 12, color: "#7A7670" }}>© 2026 <span style={{ color: "#E85D26" }}>AutoRegião</span></p>
      </div>

    </main>
  );
}
