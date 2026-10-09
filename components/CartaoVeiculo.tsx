import Image from "next/image";
import Link from "next/link";
import BotaoFavorito from "@/components/BotaoFavorito";
import { formatarKm, formatarPreco } from "@/lib/formatar";
import type { Veiculo } from "@/lib/tipos";
import Icone from "@/components/Icone";
import { seloDePreco } from "@/lib/precoFipe";
import GaleriaCard from "@/components/GaleriaCard";
import BotaoComparar from "@/components/BotaoComparar";
import { linkDoVeiculo } from "@/lib/linkVeiculo";
import BotaoWhatsAppCard from "@/components/BotaoWhatsAppCard";
import DistanciaCidade from "@/components/DistanciaCidade";
import { ENTRADA_PADRAO, parcelaMensal } from "@/lib/financiamento";

export type DadosCartao = Pick<Veiculo, "id" | "nome" | "ano" | "km" | "preco" | "fotos" | "destaque">
  & Partial<Pick<Veiculo, "combustivel" | "cidade" | "fipe_valor" | "condicoes" | "marca" | "modelo" | "versao" | "telefone" | "prioridade">>
  & { lojas?: { nome: string | null; cidade: string | null; logo_url?: string | null; whatsapp?: string | null; telefone?: string | null } | null };

// Selo "Abaixo da FIPE": só aparece quando é vantagem para o comprador (preço acima da FIPE não é
// mostrado em lugar nenhum do site).
export function abaixoDaFipe(v: { preco: number | null; fipe_valor?: number | null }) {
  return !!v.preco && !!v.fipe_valor && v.preco < v.fipe_valor;
}

// Selo "Super preço" / "Bom preço" (lib/precoFipe.ts). Cores: super = verde forte, bom = verde claro.
export function SeloPreco({ v, grande = false }: { v: { preco: number | null; fipe_valor?: number | null }; grande?: boolean }) {
  const s = seloDePreco(v);
  if (!s) return null;
  const forte = s.tipo === "super";
  return (
    <span title={`${s.pct}% abaixo da Tabela FIPE`} style={{ fontSize: grande ? 12.5 : 10, fontWeight: 700, color: forte ? "#fff" : "#15803D", background: forte ? "#16A34A" : "#DCFCE7", padding: grande ? "4px 10px" : "2px 7px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}>
      <Icone nome="abaixo" tamanho={grande ? 14 : 12} traco={2.2} /> {s.rotulo}
    </span>
  );
}

// Título do card: "MARCA MODELO" em destaque e a versão embaixo (ex.: HONDA CIVIC / EXL 2.0 Flex Aut.).
// Anúncios antigos sem marca/modelo usam o nome inteiro.
function tituloDoCard(car: DadosCartao): { titulo: string; versao: string } {
  if (!car.marca || !car.modelo) return { titulo: car.nome ?? "Veículo", versao: "" };
  let versao = (car.versao ?? "").trim();
  if (versao.toLowerCase().startsWith(car.modelo.toLowerCase())) versao = versao.slice(car.modelo.length).trim();
  return { titulo: `${car.marca} ${car.modelo}`, versao };
}

// Card de anúncio usado em todas as listas (início, vitrine, busca, loja, favoritos, parecidos).
// Básico/particular: card simples. Profissional (e período grátis): etiqueta "Destaque".
// Premium: etiqueta + borda laranja + logo da loja sobre a foto e "Loja Premium" (lib/planos, supabase/fase17).
// `mostrarLoja`: some na página da própria loja, onde seria repetido.
export default function CartaoVeiculo({ car, mostrarLoja = true, largura }: { car: DadosCartao; mostrarLoja?: boolean; largura?: number }) {
  const premium = (car.prioridade ?? 0) >= 2;
  const logo = premium ? car.lojas?.logo_url : null;
  const { titulo, versao } = tituloDoCard(car);
  const cidade = car.lojas?.cidade || car.cidade;
  const telefone = (car.telefone || car.lojas?.whatsapp || car.lojas?.telefone || "").replace(/\D/g, "");
  const icone = { display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" } as const;
  return (
    <Link href={linkDoVeiculo(car)} style={{ textDecoration: "none", display: "block", width: largura, height: "100%", flexShrink: 0 }}>
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: premium ? "1.5px solid #FF6600" : "1.5px solid #E8E6E1", position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
        {/* FOTO */}
        <div style={{ position: "relative", aspectRatio: "4 / 3", width: "100%", background: "#F7F6F3" }}>
          {car.fotos && car.fotos.length > 0
            ? <GaleriaCard fotos={car.fotos} alt={car.nome ?? "Veículo"} />
            : <Image src="/sem-foto.png" alt={car.nome ?? "Veículo"} fill style={{ objectFit: "cover" }} sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw" />}
          <BotaoComparar id={car.id} />
          <BotaoFavorito id={car.id} />
          {car.destaque && <span style={{ position: "absolute", top: 13, left: 46, background: "#FF6600", color: "#fff", fontSize: 10.5, fontWeight: 600, padding: "3px 8px", borderRadius: 20, zIndex: 3, display: "inline-flex", alignItems: "center", gap: 3, pointerEvents: "none" }}><Icone nome="estrelaCheia" tamanho={11} /> Destaque</span>}
          {logo && (
            <div style={{ position: "absolute", right: 12, bottom: -20, zIndex: 4, width: 46, height: 46, borderRadius: "50%", overflow: "hidden", border: "2.5px solid #fff", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={car.lojas?.nome ?? "Loja"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )}
        </div>

        {/* TEXTO */}
        <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ paddingRight: logo ? 50 : 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1A1917", textTransform: "uppercase", letterSpacing: 0.2, lineHeight: 1.25 }}>{titulo}</div>
            {versao && <div style={{ fontSize: 12.5, color: "#7A7670", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{versao}</div>}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "#4A4740", minWidth: 0 }}>
              {formatarKm(car.km) && <span style={icone}><Icone nome="km" tamanho={15} /> {formatarKm(car.km)}</span>}
              {car.ano && <span style={icone}><Icone nome="calendario" tamanho={15} /> {car.ano}</span>}
            </div>
            <div style={{ textAlign: "right", marginLeft: "auto" }}>
              <SeloPreco v={car} />
              <div style={{ fontSize: 19, fontWeight: 800, color: "#1A1917", lineHeight: 1.1, marginTop: 4, whiteSpace: "nowrap" }}>{formatarPreco(car.preco)}</div>
              {!!car.preco && <div style={{ fontSize: 11, color: "#7A7670", marginTop: 2, whiteSpace: "nowrap" }}>ou ≈ R$ {parcelaMensal(car.preco * (1 - ENTRADA_PADRAO)).toLocaleString("pt-BR")}/mês</div>}
            </div>
          </div>

          {(car.condicoes ?? []).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
              {(car.condicoes ?? []).slice(0, 3).map(c => (
                <span key={c} style={{ fontSize: 10.5, color: "#15803D", background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "1px 6px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 2 }}><Icone nome="check" tamanho={10} traco={2.6} /> {c}</span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 12 }}>
            {telefone.length >= 10 && <BotaoWhatsAppCard id={car.id} nome={car.nome} preco={car.preco} telefone={telefone} />}
            <span style={{ flex: 1, height: 40, borderRadius: 9, background: "#FF6600", color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>Ver detalhes</span>
          </div>

          <div style={{ fontSize: 11.5, color: "#7A7670", marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
            {mostrarLoja && car.lojas?.nome && (premium
              ? <span style={{ ...icone, gap: 4, color: "#B45309", fontWeight: 700 }}><Icone nome="coroa" tamanho={13} /> {car.lojas.nome} · Loja Premium</span>
              : <span style={{ ...icone, gap: 4 }}><Icone nome="loja" tamanho={13} /> {car.lojas.nome}</span>)}
            {mostrarLoja && !car.lojas && <span style={{ ...icone, gap: 4 }}><Icone nome="usuario" tamanho={13} /> Particular</span>}
            {cidade && <span style={{ ...icone, gap: 4 }}><Icone nome="local" tamanho={13} /> {cidade}<DistanciaCidade cidade={cidade} /></span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
