import { criarClienteAdmin, criarClienteServidor } from "@/lib/supabase-servidor";
import { acessoDivulgar, segundaDaSemana, type AcessoDivulgar } from "@/lib/divulgar";
import type { LojaArte } from "./artes";

// Loja do lojista logado + regras da página "Divulgar" (quem tem e quantos posts com frase ainda restam na semana).
export type ContextoDivulgar = {
  loja: LojaArte & { plano: string | null; expira_em: string | null };
  acesso: AcessoDivulgar;
  semana: string;
  usados: { veiculo_id: string; frase: string }[];
};

export async function contextoDivulgar(): Promise<ContextoDivulgar | { erro: string; status: number }> {
  const sessao = await criarClienteServidor();
  const { data: { user } } = await sessao.auth.getUser();
  if (!user) return { erro: "Faça login para usar a página Divulgar.", status: 401 };

  const admin = criarClienteAdmin();
  const { data: loja } = await admin.from("lojas")
    .select("id, nome, cidade, logo_url, capa_url, plano, expira_em")
    .eq("usuario_id", user.id).maybeSingle();
  if (!loja) return { erro: "Sua conta não tem loja.", status: 403 };

  const semana = segundaDaSemana();
  const { data: usados } = await admin.from("posts_divulgacao")
    .select("veiculo_id, frase").eq("loja_id", loja.id).eq("semana", semana);
  return { loja, acesso: acessoDivulgar(loja.plano, loja.expira_em), semana, usados: usados ?? [] };
}
