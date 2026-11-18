"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import Icone from "@/components/Icone";
import FotoCard from "@/components/FotoCard";
import { formatarKm, formatarPreco } from "@/lib/formatar";
import { abaixoDaFipe, ROTULO_CONDICAO, type AcessoRepasse, type RepasseComLoja } from "@/lib/repasse";

// Peças das telas do Repasse (/repasse, /repasse/novo, /repasse/[id]).

export function useAcessoRepasse() {
  const [acesso, setAcesso] = useState<AcessoRepasse | null>(null);
  useEffect(() => {
    let vivo = true;
    fetch("/api/repasse/acesso", { cache: "no-store" })
      .then(r => r.json())
      .then(a => { if (vivo) setAcesso(a); })
      .catch(() => { if (vivo) setAcesso({ logado: false, pode: false, podePublicar: false, liberado: false }); });
    return () => { vivo = false; };
  }, []);
  return acesso;
}

export function TopoRepasse({ voltar = "/painel", rotuloVoltar = "Painel" }: { voltar?: string; rotuloVoltar?: string }) {
  return (
    <nav style={{ background: "#1A1A1A", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "sticky", top: 0, zIndex: 20 }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}><Logo fundoEscuro /></Link>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#FF6600", fontWeight: 700, fontSize: 13.5 }}>
          <Icone nome="repasse" /> Repasse
        </span>
        <Link href={voltar} style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>← {rotuloVoltar}</Link>
      </div>
    </nav>
  );
}

const TEXTO_MOTIVO: Record<string, { titulo: string; texto: string }> = {
  fechado: { titulo: "O Repasse ainda não foi liberado", texto: "Em breve as lojas parceiras do AutoRegião vão poder oferecer e comprar carros de repasse entre si por aqui. Avisaremos quando abrir." },
  sem_loja: { titulo: "Área exclusiva para lojistas", texto: "O Repasse é um espaço só para lojas cadastradas no AutoRegião negociarem carros entre si." },
  sem_cnpj: { titulo: "Informe o CNPJ da sua loja", texto: "Para entrar no Repasse, a loja precisa ter o CNPJ conferido. Informe no Perfil da Loja, dentro do painel." },
  plano_vencido: { titulo: "Seu plano está vencido", texto: "O Repasse é para lojas com o plano em dia. Renove o plano para voltar a ver e oferecer carros." },
};

export function PortaoRepasse({ acesso }: { acesso: AcessoRepasse }) {
  const m = TEXTO_MOTIVO[acesso.motivo ?? "fechado"] ?? TEXTO_MOTIVO.fechado;
  return (
    <div style={{ maxWidth: 520, margin: "48px auto", padding: "0 16px" }}>
      <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 14, padding: "32px 22px", textAlign: "center" }}>
        <div style={{ color: "#FF6600", marginBottom: 12 }}><Icone nome="cadeado" tamanho={44} traco={1.5} /></div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1A1917", marginBottom: 8 }}>{m.titulo}</h1>
        <p style={{ fontSize: 14, color: "#7A7670", lineHeight: 1.6, marginBottom: 20 }}>{m.texto}</p>
        <Link href="/painel" style={{ display: "inline-block", padding: "11px 20px", background: "#FF6600", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Voltar ao painel</Link>
      </div>
    </div>
  );
}

export function CartaoRepasse({ r, rodape }: { r: RepasseComLoja; rodape?: React.ReactNode }) {
  const abaixo = abaixoDaFipe(r);
  const loja = r.lojas;
  return (
    <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Link href={`/repasse/${r.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ position: "relative", aspectRatio: "4 / 3", background: "#EFEDE8" }}>
          {r.fotos?.[0]
            ? <FotoCard src={r.fotos[0]} alt={r.nome} />
            : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#C9C5BD" }}><Icone nome="carro" tamanho={48} traco={1.2} /></div>}
          <span style={{ position: "absolute", top: 8, left: 8, padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
            background: r.condicao === "reparo" ? "#FEF3C7" : "#DCFCE7", color: r.condicao === "reparo" ? "#92400E" : "#166534" }}>
            <Icone nome={r.condicao === "reparo" ? "ferramenta" : "ok"} /> {ROTULO_CONDICAO[r.condicao]}
          </span>
          {r.status !== "ativo" && (
            <span style={{ position: "absolute", top: 8, right: 8, padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "#1A1A1A", color: "#fff" }}>
              {r.status === "pausado" ? "Pausado" : "Repassado"}
            </span>
          )}
        </div>
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#1A1917", lineHeight: 1.3 }}>{r.nome}</div>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#7A7670" }}>
            <span><Icone nome="calendario" /> {r.ano}</span>
            <span><Icone nome="km" /> {formatarKm(r.km)}</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1A1917", marginTop: 2 }}>{formatarPreco(r.preco)}</div>
          {abaixo && (
            <div style={{ fontSize: 12, color: "#15803D", fontWeight: 600 }}>
              <Icone nome="abaixo" /> {formatarPreco(abaixo.valor)} abaixo da FIPE ({abaixo.pct}%)
            </div>
          )}
          <div style={{ fontSize: 12, color: "#7A7670", marginTop: "auto", paddingTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <Icone nome="loja" /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loja?.nome ?? "Loja"}</span>
            {loja?.verificada && <Icone nome="escudo" cor="#2563EB" />}
            {r.cidade && <span style={{ marginLeft: "auto", whiteSpace: "nowrap" }}><Icone nome="local" /> {r.cidade}</span>}
          </div>
        </div>
      </Link>
      {rodape}
    </div>
  );
}
