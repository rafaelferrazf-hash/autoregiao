// Repasse entre lojistas (supabase/fase34). Regras e textos usados na tela e no servidor.

export const LIMITE_REPASSE_ATIVOS = 4;    // carros no ar no repasse por loja (não conta no limite do plano)
export const MAX_FOTOS_REPASSE = 5;

export type Repasse = {
  id: string;
  loja_id: string;
  usuario_id: string;
  veiculo_id: string | null;
  tipo: string;
  nome: string;
  marca: string | null; modelo: string | null; versao: string | null;
  ano: string | null; km: string | null; cambio: string | null; combustivel: string | null; cor: string | null;
  preco: number;
  condicao: "pronto" | "reparo";
  reparos: string | null;
  descricao: string | null;
  fotos: string[];
  cidade: string | null;
  fipe_tipo: string | null; fipe_marca: string | null; fipe_modelo: string | null; fipe_ano: string | null; fipe_nome: string | null;
  fipe_valor: number | null; fipe_mes: string | null;
  status: "ativo" | "pausado" | "repassado";
  criado_em: string;
  atualizado_em: string;
  repassado_em: string | null;
};

export type LojaDoRepasse = {
  nome: string; cidade: string | null; estado: string | null; whatsapp: string | null; telefone: string | null;
  logo_url: string | null; verificada: boolean | null;
};
export type RepasseComLoja = Repasse & { lojas: LojaDoRepasse | null };

export type AcessoRepasse = {
  logado: boolean;
  pode: boolean;            // vê a página
  podePublicar: boolean;    // pode cadastrar carros
  liberado: boolean;        // o Rafael já liberou para os lojistas
  motivo?: "sem_loja" | "sem_cnpj" | "plano_vencido" | "fechado";
};

export const ROTULO_CONDICAO: Record<Repasse["condicao"], string> = {
  pronto: "Pronto para venda",
  reparo: "Precisa de reparo",
};

// Diferença para a FIPE (positiva = abaixo da FIPE).
export function abaixoDaFipe(r: Pick<Repasse, "preco" | "fipe_valor">): { valor: number; pct: number } | null {
  if (!r.fipe_valor || !r.preco || r.preco >= r.fipe_valor) return null;
  const valor = r.fipe_valor - r.preco;
  return { valor, pct: Math.round((valor / r.fipe_valor) * 100) };
}

// WhatsApp da loja com mensagem pronta.
export function linkWhatsRepasse(r: Pick<Repasse, "nome" | "preco">, loja: LojaDoRepasse | null): string | null {
  let n = (loja?.whatsapp || loja?.telefone || "").replace(/\D/g, "");
  if (n.length >= 12 && n.startsWith("55")) n = n.slice(2);
  if (n.length < 10 || n.length > 11) return null;
  const preco = r.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const msg = `Olá! Vi no Repasse do AutoRegião o ${r.nome} por ${preco}. Ainda está disponível?`;
  return `https://wa.me/55${n}?text=${encodeURIComponent(msg)}`;
}
