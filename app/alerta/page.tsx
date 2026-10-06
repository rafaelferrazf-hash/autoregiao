"use client";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Icone from "@/components/Icone";

// Página aberta pelos links dos e-mails de alerta (?acao=confirmar|cancelar&token=...).
// A ação só acontece no clique do botão: o Outlook/Hotmail abre os links dos e-mails sozinho para
// checar vírus, e isso não pode confirmar nem cancelar nada.
export default function PaginaAlerta() {
  return (
    <Suspense fallback={null}>
      <Alerta />
    </Suspense>
  );
}

type Estado = { tipo: "inicio" } | { tipo: "carregando" } | { tipo: "feito"; texto: string } | { tipo: "erro"; texto: string };

function Alerta() {
  const params = useSearchParams();
  const acao = params.get("acao") === "cancelar" ? "cancelar" : "confirmar";
  const token = params.get("token") ?? "";
  const todos = params.get("todos") === "1";
  const [estado, setEstado] = useState<Estado>({ tipo: "inicio" });

  const textos = acao === "confirmar"
    ? { titulo: "Confirmar alerta", explicacao: "Clique no botão para começar a receber os anúncios novos que combinam com a sua busca — no máximo um e-mail por dia.", botao: "Confirmar meu alerta" }
    : todos
      ? { titulo: "Cancelar alertas", explicacao: "Você vai parar de receber todos os alertas da AutoRegião neste e-mail.", botao: "Cancelar todos os alertas" }
      : { titulo: "Cancelar alerta", explicacao: "Você vai parar de receber os e-mails deste alerta.", botao: "Cancelar este alerta" };

  async function executar() {
    setEstado({ tipo: "carregando" });
    try {
      const r = await fetch(`/api/alertas/${acao}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, todos }),
      });
      const j = await r.json();
      if (!j.ok) {
        setEstado({ tipo: "erro", texto: "Link inválido ou alerta já cancelado. Se precisar, crie um alerta novo na busca de veículos." });
      } else if (acao === "confirmar") {
        setEstado({ tipo: "feito", texto: `Alerta ativado! Quando aparecer anúncio novo para "${j.descricao}", você recebe um e-mail.` });
      } else {
        setEstado({ tipo: "feito", texto: todos ? "Pronto, você não vai mais receber alertas neste e-mail." : "Pronto, este alerta foi cancelado." });
      }
    } catch {
      setEstado({ tipo: "erro", texto: "Erro de conexão. Tente de novo." });
    }
  }

  return (
    <main style={{ background: "#F7F6F3", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", height: 60, display: "flex", alignItems: "center", padding: "0 16px", flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Logo />
        </Link>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ maxWidth: 440, width: "100%", background: "#fff", borderRadius: 16, boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1px solid #E8E6E1", padding: "40px 32px", boxSizing: "border-box" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1917", marginBottom: 8 }}><Icone nome="sino" cor="#FF6600" /> {textos.titulo}</h1>

          {estado.tipo === "feito" ? (
            <>
              <div style={{ background: "#D1FAE5", border: "1.5px solid #6EE7B7", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 14, color: "#065F46", lineHeight: 1.5 }}><Icone nome="ok" /> {estado.texto}</div>
              <Link href="/veiculos" style={{ display: "block", textAlign: "center", fontSize: 14, color: "#FF6600", fontWeight: 600, textDecoration: "none" }}>Ver veículos →</Link>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, color: "#7A7670", marginBottom: 24, lineHeight: 1.5 }}>{textos.explicacao}</p>
              {estado.tipo === "erro" && (
                <div style={{ background: "#FEE2E2", border: "1.5px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#991B1B", lineHeight: 1.5 }}>{estado.texto}</div>
              )}
              <button onClick={executar} disabled={estado.tipo === "carregando" || !token}
                style={{ width: "100%", padding: "13px", background: acao === "confirmar" ? "#FF6600" : "#1A1917", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: estado.tipo === "carregando" ? 0.7 : 1 }}>
                {estado.tipo === "carregando" ? "Aguarde..." : textos.botao}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
