import { ehAdmin } from "@/lib/admin";
import { ehVitalicio } from "@/lib/planos";
import { criarClienteAdmin, criarClienteServidor } from "@/lib/supabase-servidor";

// Números reais do painel /admin. Só para e-mails da allowlist; lê com a service key.
export const dynamic = "force-dynamic";

type StatusLoja = "vitalicio" | "assinante" | "trial" | "vencida";

export async function GET() {
  const sessao = await criarClienteServidor();
  const { data: { user } } = await sessao.auth.getUser();
  if (!user) return Response.json({ erro: "Não autenticado." }, { status: 401 });
  if (!ehAdmin(user.email)) return Response.json({ erro: "Sem permissão." }, { status: 403 });

  const admin = criarClienteAdmin();
  const agora = Date.now();
  const dias = (n: number) => new Date(agora - n * 86_400_000).toISOString();

  const [lojasRes, veiculosRes, usuariosRes, visRes, contRes] = await Promise.all([
    admin.from("lojas").select("id, nome, cidade, plano, expira_em, criado_em").order("criado_em", { ascending: false }),
    admin.from("veiculos").select("id, nome, preco, status, ativo, loja_id, criado_em, lojas(nome)").order("criado_em", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("eventos_veiculo").select("id", { count: "exact", head: true }).eq("tipo", "visualizacao").gte("criado_em", dias(30)),
    admin.from("eventos_veiculo").select("id", { count: "exact", head: true }).neq("tipo", "visualizacao").gte("criado_em", dias(30)),
  ]);

  const lojas = lojasRes.data ?? [];
  const veiculos = veiculosRes.data ?? [];
  const usuarios = usuariosRes.data?.users ?? [];

  const statusDe = (plano: string | null, expira: string | null): StatusLoja => {
    if (ehVitalicio(plano)) return "vitalicio";
    if (!expira || new Date(expira).getTime() <= agora) return "vencida";
    return !plano || plano === "trial" ? "trial" : "assinante";
  };

  const lojasDetalhe = lojas.map(l => {
    const status = statusDe(l.plano, l.expira_em);
    const restante = l.expira_em ? Math.ceil((new Date(l.expira_em).getTime() - agora) / 86_400_000) : null;
    return {
      id: l.id,
      nome: l.nome,
      cidade: l.cidade,
      plano: ehVitalicio(l.plano) ? "Vitalício" : !l.plano || l.plano === "trial" ? "Grátis" : l.plano,
      veiculos: veiculos.filter(v => v.loja_id === l.id && v.ativo !== false).length,
      status,
      vencimento: status === "vitalicio" ? "Nunca"
        : !l.expira_em ? "—"
        : status === "vencida" ? `Venceu ${new Date(l.expira_em).toLocaleDateString("pt-BR")}`
        : `${restante} ${restante === 1 ? "dia" : "dias"}`,
    };
  });

  const veiculosAtivos = veiculos.filter(v => v.ativo !== false);

  return Response.json({
    totais: {
      lojas: lojas.length,
      lojas_7d: lojas.filter(l => l.criado_em && l.criado_em >= dias(7)).length,
      veiculos_ativos: veiculosAtivos.length,
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
    },
    lojas: lojasDetalhe,
    anuncios: veiculos.slice(0, 8).map(v => ({
      id: v.id,
      nome: v.nome,
      loja: (v.lojas as unknown as { nome: string } | null)?.nome ?? "Particular",
      preco: v.preco,
      status: v.ativo === false ? "inativo" : (v.status || "ativo"),
    })),
  });
}
