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
};

// Veículo com o join `lojas(nome, cidade)`.
export type VeiculoComLoja = Veiculo & {
  lojas: { nome: string; cidade: string } | null;
};

export type NovoVeiculo = Omit<Veiculo, "id" | "loja_id" | "destaque" | "criado_em" | "created_at">;

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
