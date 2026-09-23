"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function RedefinirSenha() {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  // "verificando" enquanto o supabase-js lê o token do link; "valido" libera o formulário.
  const [estado, setEstado] = useState<"verificando" | "valido" | "invalido">("verificando");

  useEffect(() => {
    // O link do e-mail chega com #access_token=...&type=recovery (ou #error=... se expirou).
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get("error")) {
      setEstado("invalido");
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((evento, session) => {
      if (evento === "PASSWORD_RECOVERY" && session) setEstado("valido");
    });

    // getSession espera o supabase-js terminar de processar o token da URL.
    supabase.auth.getSession().then(({ data }) => {
      setEstado(atual => atual === "valido" ? atual : (data.session ? "valido" : "invalido"));
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSalvar() {
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    if (senha !== confirmacao) return setErro("As senhas não conferem.");
    setErro("");
    setCarregando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      setCarregando(false);
      if (error) {
        setErro(error.message.toLowerCase().includes("different from the old")
          ? "A senha nova precisa ser diferente da anterior."
          : "Erro ao salvar a senha. Tente novamente.");
      } else {
        setSucesso(true);
        setTimeout(() => { window.location.href = "/painel"; }, 1500);
      }
    } catch (e) {
      setCarregando(false);
      setErro("Erro inesperado. Tente novamente.");
    }
  }

  const inputStyle = { width: "100%", padding: "12px 14px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 15, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" as const };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: "#7A7670", textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 6 };

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      <nav style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/logo.png" alt="AutoRegião" width={32} height={32} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: "#1A1917" }}>
            <span style={{ color: "#E85D26" }}>Auto</span>Região
          </span>
        </Link>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ maxWidth: 440, width: "100%", background: "#fff", borderRadius: 16, boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1px solid #E8E6E1", padding: "40px 36px", boxSizing: "border-box" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 6 }}>Criar senha nova</h1>

          {estado === "verificando" && (
            <p style={{ fontSize: 14, color: "#7A7670", lineHeight: 1.5 }}>Verificando o link...</p>
          )}

          {estado === "invalido" && (
            <>
              <div style={{ background: "#FEE2E2", border: "1.5px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", margin: "16px 0", fontSize: 13, color: "#991B1B", lineHeight: 1.5 }}>
                ⚠️ Este link é inválido ou já expirou. Peça um link novo — ele vale por tempo limitado e só pode ser usado uma vez.
              </div>
              <Link href="/recuperar-senha" style={{ display: "block", textAlign: "center", fontSize: 14, color: "#E85D26", fontWeight: 600, textDecoration: "none" }}>Pedir novo link</Link>
            </>
          )}

          {estado === "valido" && (
            <>
              <p style={{ fontSize: 14, color: "#7A7670", marginBottom: 24, lineHeight: 1.5 }}>Escolha uma senha nova para a sua conta.</p>

              {sucesso && <div style={{ background: "#D1FAE5", border: "1.5px solid #6EE7B7", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#065F46" }}>✅ Senha alterada! Redirecionando para o painel...</div>}
              {erro && <div style={{ background: "#FEE2E2", border: "1.5px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#991B1B" }}>⚠️ {erro}</div>}

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Senha nova</label>
                  <input type="password" placeholder="Mínimo 6 caracteres" value={senha} onChange={e => setSenha(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Confirmar senha</label>
                  <input type="password" placeholder="Repita a senha" value={confirmacao} onChange={e => setConfirmacao(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSalvar()} style={inputStyle} />
                </div>
                <button onClick={handleSalvar} disabled={carregando || sucesso}
                  style={{ width: "100%", padding: "14px", background: carregando ? "#C44818" : "#E85D26", color: "#fff", border: "none", borderRadius: 9, fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, cursor: carregando ? "not-allowed" : "pointer", opacity: carregando ? 0.8 : 1 }}>
                  {carregando ? "Salvando..." : "Salvar senha nova"}
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
