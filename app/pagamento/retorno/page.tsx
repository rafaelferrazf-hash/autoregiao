"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { verificarPagamento } from "@/lib/dados/pagamentos";

// Volta do checkout do Mercado Pago (?payment_id=...&status=...).
// Confere o pagamento no servidor — não confia no status que vem na URL.
type Estado = "conferindo" | "aprovado" | "pendente" | "recusado" | "sem_pagamento" | "sem_login" | "erro";

export default function RetornoPagamento() {
  const [estado, setEstado] = useState<Estado>("conferindo");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const id = q.get("payment_id") || q.get("collection_id");
    if (!id || id === "null") {
      // Saiu do checkout sem pagar.
      Promise.resolve().then(() => setEstado("sem_pagamento"));
      return;
    }
    verificarPagamento(id).then(r => {
      // Pagou em outro navegador/celular (sem login no AutoRegião): o plano é ativado pelo
      // aviso do Mercado Pago ou ao abrir o painel — não precisa de login aqui.
      if (r.erro === "Não autenticado.") setEstado("sem_login");
      else if (r.status === "approved") setEstado("aprovado");
      else if (r.status === "pending" || r.status === "in_process" || r.status === "authorized") setEstado("pendente");
      else if (r.status === "rejected" || r.status === "cancelled") setEstado("recusado");
      else setEstado("erro");
    });
  }, []);

  const conteudo: Record<Estado, { icone: string; titulo: string; texto: string }> = {
    conferindo: { icone: "⏳", titulo: "Conferindo seu pagamento...", texto: "Só um instante." },
    aprovado: { icone: "✅", titulo: "Pagamento aprovado!", texto: "Seu plano já está ativo e o prazo foi atualizado. Se algum anúncio estava fora do site, ele já voltou." },
    pendente: { icone: "⏳", titulo: "Aguardando o pagamento", texto: "Assim que o Mercado Pago confirmar (Pix em minutos, boleto em até 3 dias úteis), seu plano é ativado automaticamente. Você não precisa fazer mais nada." },
    recusado: { icone: "❌", titulo: "Pagamento não aprovado", texto: "O pagamento foi recusado ou cancelado. Nenhum valor foi cobrado. Você pode tentar de novo com outra forma de pagamento." },
    sem_login: { icone: "✅", titulo: "Pagamento recebido!", texto: "Obrigado! Assim que o Mercado Pago confirmar (Pix e cartão em instantes, boleto em até 3 dias úteis), seu plano é ativado automaticamente. Entre no seu painel para acompanhar." },
    sem_pagamento: { icone: "ℹ️", titulo: "Pagamento não concluído", texto: "Você saiu do Mercado Pago antes de pagar. Quando quiser, é só escolher o plano de novo." },
    erro: { icone: "⚠️", titulo: "Não conseguimos confirmar agora", texto: "Se você pagou, fique tranquilo: a confirmação chega automaticamente em alguns minutos. Confira em Planos → Meus pagamentos." },
  };
  const c = conteudo[estado];

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 16, padding: "36px 28px", maxWidth: 460, textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>{c.icone}</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 800, color: "#1A1917", marginBottom: 10 }}>{c.titulo}</h1>
        <p style={{ fontSize: 14, color: "#7A7670", lineHeight: 1.6, marginBottom: 24 }}>{c.texto}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/painel" style={{ padding: "10px 20px", background: "#E85D26", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Ir para o painel</Link>
          {(estado === "recusado" || estado === "sem_pagamento" || estado === "erro") && (
            <Link href="/painel/planos" style={{ padding: "10px 20px", border: "1.5px solid #E8E6E1", color: "#1A1917", borderRadius: 8, textDecoration: "none", fontWeight: 500, fontSize: 14 }}>Ver planos</Link>
          )}
        </div>
      </div>
    </main>
  );
}
