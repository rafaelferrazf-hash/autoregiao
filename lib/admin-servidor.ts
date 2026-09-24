import { ehAdmin } from "@/lib/admin";
import { criarClienteAdmin, criarClienteServidor } from "@/lib/supabase-servidor";

// Rotas /api/admin/*: confere no servidor se quem chama é o admin (allowlist de e-mail).
// Uso: const r = await exigirAdmin(); if ("erro" in r) return r.erro;
export async function exigirAdmin() {
  const sessao = await criarClienteServidor();
  const { data: { user } } = await sessao.auth.getUser();
  if (!user) return { erro: Response.json({ erro: "Não autenticado." }, { status: 401 }) };
  if (!ehAdmin(user.email)) return { erro: Response.json({ erro: "Sem permissão." }, { status: 403 }) };
  return { admin: criarClienteAdmin(), user };
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
