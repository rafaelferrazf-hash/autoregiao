// Chamadas do /admin para as rotas protegidas /api/admin/* (a checagem de admin é no servidor).

export type StatusLoja = "vitalicio" | "desativada" | "assinante" | "trial" | "vencida";

export type ResumoAdmin = {
  totais: { lojas: number; lojas_7d: number; veiculos_ativos: number; veiculos_7d: number; usuarios: number; usuarios_30d: number; visualizacoes_30d: number; contatos_30d: number };
  status: { vitalicio: number; assinante: number; trial: number; vencida: number; desativada: number };
  lojas: { id: string; nome: string; cidade: string; plano: string; veiculos: number; status: StatusLoja; protegida: boolean; ativo: boolean; vencimento: string }[];
  anuncios: { id: string; nome: string; loja: string; preco: number | null; ativo: boolean; criado_em: string | null }[];
  usuarios: { id: string; email: string; nome: string; cadastro: string; confirmado: boolean; ultimo_acesso: string | null; loja: string | null; admin: boolean }[];
};

async function chamar(url: string, metodo: string, corpo?: unknown): Promise<{ ok: boolean; erro?: string }> {
  try {
    const resp = await fetch(url, {
      method: metodo,
      headers: corpo ? { "Content-Type": "application/json" } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    const json = await resp.json().catch(() => ({}));
    return resp.ok ? { ok: true } : { ok: false, erro: json.erro || `Erro ${resp.status}` };
  } catch {
    return { ok: false, erro: "Falha de conexão." };
  }
}

export async function carregarResumoAdmin(): Promise<ResumoAdmin | null> {
  try {
    const resp = await fetch("/api/admin/resumo", { cache: "no-store" });
    return resp.ok ? await resp.json() : null;
  } catch {
    return null;
  }
}

export const estenderLoja = (id: string, dias: number) => chamar(`/api/admin/lojas/${id}`, "PATCH", { acao: "estender", dias });
export const definirLojaAtiva = (id: string, ativo: boolean) => chamar(`/api/admin/lojas/${id}`, "PATCH", { acao: ativo ? "reativar" : "desativar" });
export const definirAnuncioAtivoAdmin = (id: string, ativo: boolean) => chamar(`/api/admin/anuncios/${id}`, "PATCH", { acao: ativo ? "reativar" : "pausar" });
export const removerAnuncioAdmin = (id: string) => chamar(`/api/admin/anuncios/${id}`, "DELETE");
