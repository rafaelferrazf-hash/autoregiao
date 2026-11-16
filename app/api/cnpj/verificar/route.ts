import { criarClienteAdmin } from "@/lib/supabase-servidor";
import { cnpjValido, consultarCnpj, soDigitosCnpj } from "@/lib/cnpj";

// Conferência do CNPJ no cadastro de lojista (antes de criar a conta). Não grava nada.
// Responde: número válido? já tem loja com ele? e o que a Receita diz (nome, situação, cidade).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cnpj = soDigitosCnpj(new URL(request.url).searchParams.get("cnpj") ?? "");
  if (!cnpjValido(cnpj)) return Response.json({ valido: false });

  const { data } = await criarClienteAdmin().from("lojas").select("id").eq("cnpj", cnpj).limit(1);
  if (data?.length) return Response.json({ valido: true, ja_cadastrado: true });

  const receita = await consultarCnpj(cnpj);
  if (receita === "nao_encontrado") return Response.json({ valido: true, ja_cadastrado: false, nao_encontrado: true });
  return Response.json({ valido: true, ja_cadastrado: false, receita });
}
