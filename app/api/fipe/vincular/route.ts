import { criarClienteAdmin, criarClienteServidor } from "@/lib/supabase-servidor";
import { atualizarFipeDoVeiculo } from "@/lib/fipe";
import { UUID } from "@/lib/admin-servidor";

// Chamado pelo cadastro do anúncio logo depois de salvar: grava o valor da FIPE do modelo
// escolhido. Só o dono do anúncio (ou da loja do anúncio) pode pedir.
export async function POST(request: Request) {
  const { id } = await request.json().catch(() => ({}));
  if (typeof id !== "string" || !UUID.test(id)) return Response.json({ ok: false }, { status: 400 });

  const { data: { user } } = await (await criarClienteServidor()).auth.getUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });

  const { data: v } = await criarClienteAdmin().from("veiculos").select("usuario_id, lojas(usuario_id)").eq("id", id).maybeSingle();
  const dono = v && (v.usuario_id === user.id || (v.lojas as unknown as { usuario_id: string | null } | null)?.usuario_id === user.id);
  if (!dono) return Response.json({ ok: false }, { status: 404 });

  try {
    const valor = await atualizarFipeDoVeiculo(id);
    return Response.json({ ok: true, valor });
  } catch (e) {
    console.error("fipe vincular:", e);
    return Response.json({ ok: false }, { status: 502 });
  }
}
