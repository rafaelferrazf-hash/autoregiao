// Oferta das lojas (decisão do Rafael em 30/10/2026): 60 dias grátis para TODA loja nova, contados
// a partir do cadastro, sem prazo para se cadastrar. (Antes era a regra do pré-lançamento da fase26;
// a fase30 tirou a exceção no banco.) Se a oferta mudar, trocar aqui e em criar_loja_no_cadastro().
export function textoOfertaLoja(): { titulo: string; texto: string } {
  return {
    titulo: "60 dias grátis para lojistas",
    texto: "Os 60 dias começam a contar no seu cadastro. Sem cartão de crédito.",
  };
}
