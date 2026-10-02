import type { Metadata } from "next";
import Link from "next/link";
import PaginaLegal from "@/components/PaginaLegal";
import { EMAIL_CONTATO } from "@/lib/site";

// Página exigida pela Google Play: como pedir a exclusão da conta e dos dados (site e app AutoRegião).
export const metadata: Metadata = {
  title: "Excluir minha conta | AutoRegião",
  description: "Como pedir a exclusão da sua conta e dos seus dados no AutoRegião (site e app).",
};

const assunto = encodeURIComponent("Excluir minha conta");
const corpo = encodeURIComponent("Olá! Quero excluir minha conta do AutoRegião e os meus dados.\n\nE-mail da conta: \nNome da loja (se houver): \n");

export default function ExcluirConta() {
  return (
    <PaginaLegal titulo="Excluir minha conta" atualizadoEm="2 de outubro de 2026">
      <p>
        Você pode pedir a exclusão da sua conta do <strong>AutoRegião</strong> (site www.autoregiao.com.br e app AutoRegião)
        e dos dados ligados a ela a qualquer momento.
      </p>

      <h2>Como pedir</h2>
      <ol>
        <li>
          Envie um e-mail para <a href={`mailto:${EMAIL_CONTATO}?subject=${assunto}&body=${corpo}`}>{EMAIL_CONTATO}</a> com o
          assunto <strong>&quot;Excluir minha conta&quot;</strong>, <strong>a partir do mesmo e-mail cadastrado na conta</strong>
          (assim confirmamos que o pedido é seu).
        </li>
        <li>Respondemos confirmando o pedido e concluímos a exclusão em até <strong>30 dias</strong>.</li>
      </ol>
      <p>
        Se quiser só tirar os anúncios do ar, não precisa excluir a conta: no <Link href="/painel">painel</Link> dá para pausar
        ou excluir cada anúncio na hora.
      </p>

      <h2 id="excluir-dados">Excluir só alguns dados (sem excluir a conta)</h2>
      <ul>
        <li><strong>Anúncios e fotos:</strong> no <Link href="/painel">painel</Link>, toque em excluir no anúncio — ele e as fotos
          são apagados na hora;</li>
        <li><strong>Dados da loja</strong> (telefone, endereço, descrição etc.): edite ou apague no Perfil da Loja, no painel;</li>
        <li><strong>Alertas de veículos:</strong> use o link &quot;Cancelar&quot; em qualquer e-mail de alerta;</li>
        <li><strong>Outros dados</strong> (por exemplo, as estatísticas de visualizações): envie e-mail para{" "}
          <a href={`mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent("Excluir meus dados")}`}>{EMAIL_CONTATO}</a> com o
          assunto <strong>&quot;Excluir meus dados&quot;</strong>, dizendo quais dados quer apagar. Concluímos em até 30 dias.</li>
      </ul>

      <h2>O que é apagado</h2>
      <ul>
        <li>Dados da conta: nome, e-mail, telefone e senha;</li>
        <li>Dados da loja: nome, endereço, telefones, descrição e horário;</li>
        <li>Todos os anúncios e as fotos dos veículos;</li>
        <li>Estatísticas de visualizações e contatos dos seus anúncios;</li>
        <li>Alertas de veículos cadastrados com o seu e-mail.</li>
      </ul>

      <h2>O que pode ser mantido</h2>
      <p>
        Registros de pagamentos de planos (data, valor e identificação da transação) podem ser guardados pelo prazo exigido
        pela lei fiscal (em geral, 5 anos), apenas para cumprir obrigações legais.
      </p>

      <h2>Alertas e favoritos (sem conta)</h2>
      <p>
        Para cancelar um alerta de veículos, use o link &quot;Cancelar&quot; que vem em todo e-mail de alerta. Os favoritos
        ficam guardados só no seu aparelho: para apagá-los, tire a estrela dos anúncios ou limpe os dados do app/navegador.
      </p>

      <p>
        Mais detalhes na nossa <Link href="/privacidade">Política de Privacidade</Link>.
      </p>
    </PaginaLegal>
  );
}
