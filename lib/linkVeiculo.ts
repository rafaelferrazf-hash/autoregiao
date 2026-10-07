import { slug } from "@/lib/nomesVeiculo";

// Endereço do anúncio com o nome do carro (bom para o Google e para o link no WhatsApp):
// /veiculo/honda-civic-ex-1-5-turbo-2011-261be1bb-8cca-445a-8951-5f5fa20b812c
// O que vale é o código no fim; endereços antigos (/veiculo/<código>) redirecionam para o novo.
const CODIGO = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function linkDoVeiculo(v: { id: string; nome?: string | null }): string {
  const nome = v.nome ? slug(v.nome).slice(0, 80).replace(/-+$/, "") : "";
  return `/veiculo/${nome ? `${nome}-` : ""}${v.id}`;
}

export function codigoDoEndereco(parte: string): string | null {
  return CODIGO.exec(parte)?.[0].toLowerCase() ?? null;
}
