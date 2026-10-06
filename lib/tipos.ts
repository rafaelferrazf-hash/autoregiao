// Tipos das tabelas do Supabase, conforme as colunas reais do banco (lidas em 24/09/2026).
// Atenção: `ano` e `km` são TEXT no banco, não número.

export type Veiculo = {
  id: string;
  loja_id: string | null;
  usuario_id: string | null;
  nome: string;
  tipo: string | null;
  marca: string | null;
  modelo: string | null;
  versao: string | null;
  ano: string | null;
  km: string | null;
  cambio: string | null;
  combustivel: string | null;
  cor: string | null;
  portas: string | null;
  carroceria?: string | null;   // Hatch, Sedã, SUV... (fase12-carroceria.sql)
  preco: number | null;
  aceita_troca: boolean | null;
  descricao: string | null;
  opcionais: string[] | null;
  fotos: string[] | null;
  destaque: boolean | null;
  ativo: boolean | null;
  status: string | null;
  nome_contato: string | null;
  telefone: string | null;
  cidade: string | null;
  criado_em: string | null;
  created_at: string | null;
  // Tabela FIPE (supabase/fase6-fipe.sql). O lojista escolhe tipo/marca/modelo/ano; o valor
  // (fipe_valor/codigo/mes/em) só o servidor grava.
  fipe_tipo: string | null;
  fipe_marca: string | null;
  fipe_modelo: string | null;
  fipe_ano: string | null;
  fipe_nome: string | null;
  fipe_valor: number | null;
  fipe_codigo: string | null;
  fipe_mes: string | null;
  fipe_em: string | null;
  abaixo_fipe?: boolean | null;
  demonstracao?: boolean | null;
  vendido_em?: string | null;     // "Finalizar" = vendido (fase15): fora do ar para sempre  // anúncio de demonstração (fase13): fora do Google, do sitemap e dos alertas   // calculada pelo banco (fase7-filtros.sql); nunca gravada pelo site
};

// Veículo com o join `lojas(nome, cidade)`.
export type VeiculoComLoja = Veiculo & {
  // estado/endereco/criado_em/whatsapp/telefone só vêm na página do anúncio (buscarVeiculo).
  lojas: {
    nome: string; cidade: string;
    estado?: string | null; endereco?: string | null; criado_em?: string | null; whatsapp?: string | null; telefone?: string | null; logo_url?: string | null;
  } | null;
};

export type NovoVeiculo = Omit<Veiculo, "id" | "loja_id" | "destaque" | "criado_em" | "created_at" | "fipe_valor" | "fipe_codigo" | "fipe_mes" | "fipe_em" | "abaixo_fipe">;

export type Loja = {
  id: string;
  usuario_id: string | null;
  nome: string;
  cidade: string;
  estado: string | null;
  telefone: string | null;
  whatsapp: string | null;
  descricao: string | null;
  endereco: string | null;
  horario: string | null;
  logo_url?: string | null;   // logo/foto da loja (fase8-logo-loja.sql)
  capa_url?: string | null;   // foto de capa/fachada (fase11-capa-loja.sql)
  plano_proximo?: string | null;     // plano menor já pago, começa em plano_proximo_em (fase15)
  plano_proximo_em?: string | null;
  plano: string | null;
  ativo: boolean | null;
  expira_em: string | null;
  criado_em: string | null;
};

export type Cupom = {
  id: string;
  codigo: string;
  dias: number;
  usos_maximos: number;
  usos_realizados: number;
  ativo: boolean | null;
  expira_em: string | null;
  criado_em: string | null;
};

export type CupomUsado = {
  id: string;
  cupom_id: string | null;
  loja_id: string | null;
  usuario_id: string | null;
  usado_em: string | null;
};
