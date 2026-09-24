import { ehAdmin } from "@/lib/admin";
import { exigirAdmin } from "@/lib/admin-servidor";
import { ehVitalicio } from "@/lib/planos";

// Dados do painel /admin (dashboard + abas Lojas, Anúncios e Usuários). Só admin; service key.
export const dynamic = "force-dynamic";

type StatusLoja = "vitalicio" | "desativada" | "assinante" | "trial" | "vencida";

export async function GET() {
  const r = await exigirAdmin();
  if ("erro" in r) return r.erro;
  const admin = r.admin;
  const agora = Date.now();
  const dias = (n: number) => new Date(agora - n * 86_400_000).toISOString();

  const [lojasRes, veiculosRes, usuariosRes, visRes, contRes] = await Promise.all([
    admin.from("lojas").select("id, nome, cidade, plano, expira_em, criado_em, ativo, usuario_id").order("criado_em", { ascending: false }),
    admin.from("veiculos").select("id, nome, preco, status, ativo, loja_id, criado_em, lojas(nome)").order("criado_em", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("eventos_veiculo").select("id", { count: "exact", head: true }).eq("tipo", "visualizacao").gte("criado_em", dias(30)),
    admin.from("eventos_veiculo").select("id", { count: "exact", head: true }).neq("tipo", "visualizacao").gte("criado_em", dias(30)),
  ]);

  const lojas = lojasRes.data ?? [];
  const veiculos = veiculosRes.data ?? [];
  const usuarios = usuariosRes.data?.users ?? [];

  const statusDe = (l: { plano: string | null; expira_em: string | null; ativo: boolean | null }): StatusLoja => {
    if (ehVitalicio(l.plano)) return "vitalicio";
    if (l.ativo === false) return "desativada";
    if (!l.expira_em || new Date(l.expira_em).getTime() <= agora) return "vencida";
    return !l.plano || l.plano === "trial" ? "trial" : "assinante";
  };

  const lojasDetalhe = lojas.map(l => {
    const status = statusDe(l);
    const restante = l.expira_em ? Math.ceil((new Date(l.expira_em).getTime() - agora) / 86_400_000) : null;
    const vencida = !!l.expira_em && new Date(l.expira_em).getTime() <= agora;
    return {
      id: l.id,
      nome: l.nome,
      cidade: l.cidade,
      plano: ehVitalicio(l.plano) ? "Vitalício" : !l.plano || l.plano === "trial" ? "Grátis" : l.plano,
      veiculos: veiculos.filter(v => v.loja_id === l.id && v.ativo !== false).length,
      status,
      protegida: ehVitalicio(l.plano),
      ativo: l.ativo !== false,
      vencimento: ehVitalicio(l.plano) ? "Nunca"
        : !l.expira_em ? "—"
        : vencida ? `Venceu ${new Date(l.expira_em).toLocaleDateString("pt-BR")}`
        : `${restante} ${restante === 1 ? "dia" : "dias"} (${new Date(l.expira_em).toLocaleDateString("pt-BR")})`,
    };
  });

  const lojaPorUsuario = new Map(lojas.map(l => [l.usuario_id, l.nome]));

  return Response.json({
    totais: {
      lojas: lojas.length,
      lojas_7d: lojas.filter(l => l.criado_em && l.criado_em >= dias(7)).length,
      veiculos_ativos: veiculos.filter(v => v.ativo !== false).length,
      veiculos_7d: veiculos.filter(v => v.criado_em && v.criado_em >= dias(7)).length,
      usuarios: usuarios.length,
      usuarios_30d: usuarios.filter(u => u.created_at >= dias(30)).length,
      visualizacoes_30d: visRes.count ?? 0,
      contatos_30d: contRes.count ?? 0,
    },
    status: {
      vitalicio: lojasDetalhe.filter(l => l.status === "vitalicio").length,
      assinante: lojasDetalhe.filter(l => l.status === "assinante").length,
      trial: lojasDetalhe.filter(l => l.status === "trial").length,
      vencida: lojasDetalhe.filter(l => l.status === "vencida").length,
      desativada: lojasDetalhe.filter(l => l.status === "desativada").length,
    },
    lojas: lojasDetalhe,
    anuncios: veiculos.map(v => ({
      id: v.id,
      nome: v.nome,
      loja: (v.lojas as unknown as { nome: string } | null)?.nome ?? "Particular",
      preco: v.preco,
      ativo: v.ativo !== false,
      criado_em: v.criado_em,
    })),
    usuarios: usuarios
      .map(u => ({
        id: u.id,
        email: u.email ?? "",
        nome: (u.user_metadata?.nome as string | undefined) ?? "",
        cadastro: u.created_at,
        confirmado: !!u.email_confirmed_at,
        ultimo_acesso: u.last_sign_in_at ?? null,
        loja: lojaPorUsuario.get(u.id) ?? null,
        admin: ehAdmin(u.email),
      }))
      .sort((a, b) => b.cadastro.localeCompare(a.cadastro)),
  });
}
