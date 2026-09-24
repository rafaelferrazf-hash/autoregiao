import { randomInt } from "node:crypto";
import { exigirAdmin } from "@/lib/admin-servidor";

// Gera um cupom AR-XXXXXX de 30 dias e 1 uso. Só para e-mails da allowlist de admin.
// A tabela `cupons` não aceita escrita pelo navegador (ver supabase/fase1-seguranca.sql),
// por isso a gravação usa a service key — depois de validar o admin aqui no servidor.
export async function POST() {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  const admin = r.admin;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  // Tenta de novo se, por azar, o código sorteado já existir.
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    let codigo = "AR-";
    for (let i = 0; i < 6; i++) codigo += chars[randomInt(chars.length)];

    const { data: existente } = await admin.from("cupons").select("id").eq("codigo", codigo).maybeSingle();
    if (existente) continue;

    const { error } = await admin.from("cupons").insert({
      codigo,
      dias: 30,
      usos_maximos: 1,
      usos_realizados: 0,
      ativo: true,
    });
    if (error) return Response.json({ erro: error.message }, { status: 500 });
    return Response.json({ codigo });
  }
  return Response.json({ erro: "Não foi possível gerar um código único. Tente de novo." }, { status: 500 });
}
