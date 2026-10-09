"use client";
import { registrarEvento } from "@/lib/dados/eventos";
import { formatarPreco } from "@/lib/formatar";
import Icone from "@/components/Icone";

// Botão do WhatsApp no card (dentro do <Link> do anúncio: não pode abrir o anúncio).
// Conta como contato no painel do lojista, igual ao botão da página do anúncio.
export default function BotaoWhatsAppCard({ id, nome, preco, telefone }: { id: string; nome: string; preco: number | null; telefone: string }) {
  function clicar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    registrarEvento(id, "whatsapp");
    const msg = encodeURIComponent(`Olá! Vi o anúncio do ${nome} por ${formatarPreco(preco)} no AutoRegião e tenho interesse.`);
    window.open(`https://wa.me/55${telefone}?text=${msg}`, "_blank");
  }
  return (
    <button type="button" onClick={clicar} title="Chamar no WhatsApp" aria-label="Chamar no WhatsApp"
      style={{ width: 44, height: 40, borderRadius: 9, border: "1.5px solid #16A34A", background: "#fff", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", padding: 0 }}>
      <Icone nome="whatsapp" tamanho={20} />
    </button>
  );
}
