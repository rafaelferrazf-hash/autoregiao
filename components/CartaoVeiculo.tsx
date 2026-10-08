import Image from "next/image";
import Link from "next/link";
import BotaoFavorito from "@/components/BotaoFavorito";
import { formatarKm, formatarPreco } from "@/lib/formatar";
import type { Veiculo } from "@/lib/tipos";
import Icone from "@/components/Icone";
import { seloDePreco } from "@/lib/precoFipe";
import FotoCard from "@/components/FotoCard";
import { linkDoVeiculo } from "@/lib/linkVeiculo";

export type DadosCartao = Pick<Veiculo, "id" | "nome" | "ano" | "km" | "preco" | "fotos" | "destaque">
  & Partial<Pick<Veiculo, "combustivel" | "cidade" | "fipe_valor" | "condicoes">>
  & { lojas?: { nome: string | null; cidade: string | null } | null };

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

// Card de anúncio usado em todas as listas (início, busca, loja, favoritos, parecidos).
// `mostrarLoja`: some na página da própria loja, onde seria repetido.
export default function CartaoVeiculo({ car, mostrarLoja = true }: { car: DadosCartao; mostrarLoja?: boolean }) {
  const local = [car.lojas?.nome, car.lojas?.cidade || car.cidade].filter(Boolean).join(" · ");
  return (
    <Link href={linkDoVeiculo(car)} style={{ textDecoration: "none" }}>
      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: car.destaque ? "1.5px solid #FF6600" : "1.5px solid #E8E6E1", position: "relative", height: "100%" }}>
        {car.destaque && <span style={{ position: "absolute", top: 8, left: 8, background: "#FF6600", color: "#fff", fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 20, zIndex: 2, display: "inline-flex", alignItems: "center", gap: 3 }}><Icone nome="estrelaCheia" tamanho={11} /> Destaque</span>}
        <BotaoFavorito id={car.id} />
        <div style={{ position: "relative", height: 150, width: "100%", background: "#F7F6F3" }}>
          {car.fotos && car.fotos.length > 0
            ? <FotoCard src={car.fotos[0]} alt={car.nome ?? "Veículo"} />
            : <Image src="/sem-foto.png" alt={car.nome ?? "Veículo"} fill style={{ objectFit: "cover" }} sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw" />}
        </div>
        <div style={{ padding: "10px 12px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1917", marginBottom: 4 }}>{car.nome}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 8 }}>
            {[car.ano, formatarKm(car.km), car.combustivel].filter(Boolean).map(tag => (
              <span key={tag} style={{ fontSize: 10, color: "#7A7670", background: "#F7F6F3", padding: "2px 5px", borderRadius: 4 }}>{tag}</span>
            ))}
            {(car.condicoes ?? []).slice(0, 2).map(c => (
              <span key={c} style={{ fontSize: 10, color: "#15803D", background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "1px 5px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 2 }}><Icone nome="check" tamanho={10} traco={2.6} /> {c}</span>
            ))}
          </div>
          <div style={{ paddingTop: 8, borderTop: "1px solid #E8E6E1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#1A1917" }}>{formatarPreco(car.preco)}</span>
            <SeloPreco v={car} />
          </div>
          {mostrarLoja && local && (
            <div style={{ fontSize: 10.5, color: "#7A7670", marginTop: 5, display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ width: 5, height: 5, background: "#FF6600", borderRadius: "50%", display: "inline-block", flexShrink: 0 }}></span>
              {local}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
