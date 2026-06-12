"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Cadastro() {
  const [tipo, setTipo] = useState<"comprador" | "lojista" | "particular">("comprador");
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", senha: "", confirmarSenha: "", loja: "", cidade: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  async function handleSubmit() {
    setErro("");
    if (!form.nome || !form.email || !form.senha) return setErro("Preencha todos os campos obrigatórios.");
    if (form.senha.length < 8) return setErro("A senha deve ter pelo menos 8 caracteres.");
    if (form.senha !== form.confirmarSenha) return setErro("As senhas não coincidem.");
    if (tipo === "lojista" && (!form.loja || !form.cidade)) return setErro("Preencha o nome da loja e a cidade.");
    setCarregando(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: { data: { nome: form.nome, telefone: form.telefone, tipo } }
    });
    if (error) {
      setCarregando(false);
      if (error.message.includes("already registered")) return setErro("Este e-mail já está cadastrado. Tente fazer login.");
      return setErro("Erro ao criar conta. Tente novamente.");
    }
    if (tipo === "lojista" && data.user) {
      const expira = new Date();
      expira.setDate(expira.getDate() + 60);
      await supabase.from("lojas").insert({
        nome: form.loja,
        cidade: form.cidade,
        telefone: form.telefone,
        usuario_id: data.user.id,
        ativo: true,
        expira_em: expira.toISOString(),
      });
    }
    setCarregando(false);
    setSucesso(true);
  }

  if (sucesso) return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ textAlign: "center", padding: "40px 24px" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 800, color: "#1A1917", marginBottom: 8 }}>Cadastro realizado!</div>
        <p style={{ fontSize: 15, color: "#7A7670", marginBottom: 8 }}>Bem-vindo ao AutoRegião, {form.nome.split(" ")[0]}!</p>
        <p style={{ fontSize: 13, color: "#7A7670", marginBottom: 24 }}>Verifique seu e-mail para confirmar a conta.</p>
        <Link href="/login" style={{ padding: "12px 28px", background: "#E85D26", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15 }}>Ir para o login</Link>
      </div>
    </main>
  );

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh" }}>

      <style>{`
        .nav-desktop-cad { display: block !important; }
        .nav-mobile-cad { display: none !important; }
        @media (max-width: 768px) {
          .nav-desktop-cad { display: none !important; }
          .nav-mobile-cad { display: flex !important; }
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
          <span className="nav-desktop-cad" style={{ fontSize: 13, color: "#7A7670" }}>
            Já tem conta?{" "}
            <Link href="/login" style={{ color: "#E85D26", fontWeight: 600, textDecoration: "none" }}>Entrar</Link>
          </span>
          <button className="nav-mobile-cad" onClick={() => setMenuAberto(!menuAberto)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, flexDirection: "column", gap: 5 }}>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, transition: "all 0.2s", transform: menuAberto ? "rotate(45deg) translate(5px, 5px)" : "none" }}></span>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, opacity: menuAberto ? 0 : 1 }}></span>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, transition: "all 0.2s", transform: menuAberto ? "rotate(-45deg) translate(5px, -5px)" : "none" }}></span>
          </button>
        </div>
        {menuAberto && (
          <div style={{ borderTop: "1px solid #E8E6E1", background: "#fff", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 14, color: "#7A7670", textAlign: "center" }}>
              Já tem conta?{" "}
              <Link href="/login" style={{ color: "#E85D26", fontWeight: 600, textDecoration: "none" }}>Entrar agora</Link>
            </div>
          </div>
        )}
      </nav>

      {/* FORMULÁRIO */}
      <div style={{ padding: "80px 16px 40px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 800, color: "#1A1917", marginBottom: 6 }}>Criar conta</div>
            <p style={{ fontSize: 14, color: "#7A7670" }}>Encontre o carro certo perto de você</p>
          </div>

          <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 14, padding: "24px 20px" }}>

            {/* TIPO */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7A7670", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Tipo de conta</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[["comprador", "🔍 Comprar"], ["particular", "🚗 Vender"], ["lojista", "🏪 Lojista"]].map(([val, label]) => (
                  <button key={val} onClick={() => setTipo(val as "comprador" | "lojista" | "particular")}
                    style={{ padding: "12px", borderRadius: 8, border: "1.5px solid", borderColor: tipo === val ? "#E85D26" : "#E8E6E1", background: tipo === val ? "#FFF5F1" : "#fff", color: tipo === val ? "#E85D26" : "#7A7670", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {erro && (
              <div style={{ background: "#FEE2E2", border: "1.5px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#991B1B", fontWeight: 500 }}>
                ⚠️ {erro}
              </div>
            )}

            {[
              ["Nome completo", "nome", "text", "Seu nome completo", true],
              ["E-mail", "email", "email", "seu@email.com", true],
              ["Telefone / WhatsApp", "telefone", "tel", "(14) 99999-9999", false],
            ].map(([label, field, type, placeholder, required]) => (
              <div key={field as string} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 5 }}>
                  {label as string} {required && <span style={{ color: "#E85D26" }}>*</span>}
                </div>
                <input type={type as string} placeholder={placeholder as string} value={form[field as keyof typeof form]}
                  onChange={e => setForm({ ...form, [field as string]: e.target.value })}
                  style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 15, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}

            {tipo === "particular" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 5 }}>Veículo que deseja vender <span style={{ color: "#E85D26" }}>*</span></div>
                  <input placeholder="Ex: Chevrolet Onix 2022" value={form.loja} onChange={e => setForm({ ...form, loja: e.target.value })}
                    style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 15, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 5 }}>Cidade <span style={{ color: "#E85D26" }}>*</span></div>
                  <input placeholder="Ex: Lençóis Paulista" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })}
                    style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 15, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
                </div>
              </>
            )}

            {tipo === "lojista" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 5 }}>Nome da loja <span style={{ color: "#E85D26" }}>*</span></div>
                  <input placeholder="Ex: Auto Paulista" value={form.loja} onChange={e => setForm({ ...form, loja: e.target.value })}
                    style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 15, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 5 }}>Cidade <span style={{ color: "#E85D26" }}>*</span></div>
                  <input placeholder="Ex: Lençóis Paulista" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })}
                    style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 15, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
                </div>
              </>
            )}

            {[["Senha", "senha", "Mínimo 8 caracteres"], ["Confirmar senha", "confirmarSenha", "Repita a senha"]].map(([label, field, placeholder]) => (
              <div key={field} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 5 }}>{label} <span style={{ color: "#E85D26" }}>*</span></div>
                <input type="password" placeholder={placeholder} value={form[field as keyof typeof form]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 15, color: "#1A1917", background: "#F7F6F3", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}

            <div style={{ fontSize: 12, color: "#7A7670", marginBottom: 20, lineHeight: 1.6 }}>
              Ao criar sua conta você concorda com os{" "}
              <a href="#" style={{ color: "#E85D26", textDecoration: "none" }}>Termos de uso</a>{" "}e a{" "}
              <a href="#" style={{ color: "#E85D26", textDecoration: "none" }}>Política de privacidade</a>.
            </div>

            <button onClick={handleSubmit} disabled={carregando}
              style={{ width: "100%", padding: "14px", background: carregando ? "#C44818" : "#E85D26", color: "#fff", border: "none", borderRadius: 8, fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, cursor: carregando ? "not-allowed" : "pointer", opacity: carregando ? 0.8 : 1 }}>
              {carregando ? "Criando conta..." : "Criar minha conta"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E8E6E1" }}></div>
              <span style={{ fontSize: 12, color: "#7A7670" }}>ou</span>
              <div style={{ flex: 1, height: 1, background: "#E8E6E1" }}></div>
            </div>

            <div style={{ textAlign: "center", fontSize: 14, color: "#7A7670" }}>
              Já tem conta?{" "}
              <Link href="/login" style={{ color: "#E85D26", fontWeight: 600, textDecoration: "none" }}>Entrar agora</Link>
            </div>
          </div>

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