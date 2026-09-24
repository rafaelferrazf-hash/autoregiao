import { supabase } from "@/lib/supabase";

export type TipoEvento = "visualizacao" | "whatsapp" | "ligacao";

// Dispara e esquece: `keepalive` garante o envio mesmo se a página abrir o WhatsApp em seguida.
export function registrarEvento(veiculoId: string, tipo: TipoEvento) {
  try {
    fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ veiculo_id: veiculoId, tipo }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Contagem nunca pode atrapalhar o visitante.
  }
}

export type EstatisticasPainel = {
  visualizacoes_30d: number;
  visualizacoes_30d_anterior: number;
  contatos_30d: number;
  contatos_30d_anterior: number;
  visitas_7d: { dia: string; total: number }[];
  contatos_recentes: { veiculo: string; tipo: TipoEvento; criado_em: string }[];
  por_veiculo: Record<string, { visualizacoes: number; contatos: number }>;
};

export async function buscarEstatisticasPainel() {
  const { data, error } = await supabase.rpc("painel_estatisticas");
  if (error || !data) return null;
  return data as EstatisticasPainel;
}
