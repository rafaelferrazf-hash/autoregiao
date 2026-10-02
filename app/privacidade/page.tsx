import type { Metadata } from "next";
import Link from "next/link";
import PaginaLegal from "@/components/PaginaLegal";
import { CIDADE_RESPONSAVEL, EMAIL_CONTATO, RESPONSAVEL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidade | AutoRegião",
  description: "Como o AutoRegião coleta, usa e protege seus dados pessoais, conforme a LGPD.",
};

export default function Privacidade() {
  return (
    <PaginaLegal titulo="Política de Privacidade" atualizadoEm="1º de outubro de 2026">
      <p>
        Esta Política explica quais dados pessoais o <strong>AutoRegião</strong> coleta, para que usa e quais são os seus
        direitos, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Ela vale para o site
        www.autoregiao.com.br e para o <strong>app AutoRegião</strong> (Android e app instalável pelo navegador), que exibe
        o mesmo conteúdo do site.
      </p>

      <h2>1. Quem é o responsável pelos seus dados</h2>
      <p>
        O controlador dos dados é <strong>{RESPONSAVEL}</strong>, {CIDADE_RESPONSAVEL}. Para qualquer assunto sobre seus dados,
        fale com a gente em <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>.
      </p>

      <h2>2. Quais dados coletamos</h2>
      <ul>
        <li><strong>Cadastro:</strong> nome, e-mail, telefone e tipo de conta. A senha é guardada de forma criptografada pelo
          nosso provedor de autenticação — nós não temos acesso a ela.</li>
        <li><strong>Dados da loja:</strong> nome, cidade, estado, telefone, WhatsApp, endereço, horário e descrição, quando você
          os informa.</li>
        <li><strong>Anúncios:</strong> dados do veículo, fotos, preço, nome de contato, telefone e cidade.</li>
        <li><strong>Uso do site:</strong> contamos visualizações de anúncios e cliques nos botões de WhatsApp e Ligar para mostrar
          esses números ao anunciante. Para não contar a mesma pessoa várias vezes, geramos um código anônimo a partir do
          endereço de internet e do navegador. <strong>Não guardamos o seu endereço IP</strong> e não identificamos quem clicou.</li>
        <li><strong>Alertas de veículos:</strong> se você criar um alerta, guardamos o seu e-mail e a busca escolhida (marca,
          preço etc.) para avisar sobre anúncios novos. Não é preciso ter conta.</li>
        <li><strong>Favoritos:</strong> os anúncios que você salva com a estrela ficam guardados <strong>só no seu
          aparelho</strong> (armazenamento do navegador/app); não recebemos essa lista.</li>
      </ul>
      <p>
        O app não acessa sua localização, contatos, câmera, microfone ou arquivos do aparelho (fotos de anúncios só são
        enviadas quando o anunciante as escolhe no cadastro do anúncio).
      </p>

      <h2>3. Para que usamos</h2>
      <ul>
        <li>Criar e manter a sua conta e permitir o login (execução do contrato — art. 7º, V da LGPD);</li>
        <li>Publicar anúncios e a página da loja, e permitir que compradores entrem em contato (execução do contrato);</li>
        <li>Mostrar estatísticas de visualizações e contatos ao anunciante (legítimo interesse);</li>
        <li>Enviar e-mails do serviço, como confirmação de cadastro e recuperação de senha (execução do contrato);</li>
        <li>Enviar os alertas de veículos que você pediu e confirmou — no máximo um e-mail por dia, com link para cancelar em
          todos (consentimento);</li>
        <li>Prevenir fraudes e moderar anúncios irregulares (legítimo interesse);</li>
        <li>Cumprir obrigações legais, inclusive fiscais quando houver pagamentos (obrigação legal).</li>
      </ul>
      <p>Não vendemos seus dados e não os usamos para publicidade de terceiros.</p>

      <h2>4. O que fica público</h2>
      <p>
        Por natureza do serviço, <strong>os dados de anúncios e da página da loja são públicos</strong>: nome da loja, cidade,
        telefone e WhatsApp informados, endereço, descrição, fotos e dados dos veículos. Seu e-mail e os dados de cadastro não
        são exibidos publicamente.
      </p>

      <h2>5. Com quem compartilhamos</h2>
      <p>Usamos prestadores de serviço que tratam dados em nosso nome, apenas para o funcionamento do site:</p>
      <ul>
        <li><strong>Supabase</strong> — banco de dados, armazenamento de fotos e autenticação;</li>
        <li><strong>Vercel</strong> — hospedagem do site;</li>
        <li><strong>Resend</strong> — envio dos e-mails do serviço e dos alertas;</li>
        <li><strong>Google Play</strong> — distribuição do app Android (o Google pode coletar dados de instalação conforme a
          política dele);</li>
        <li><strong>Provedor de pagamentos</strong> (ex.: Mercado Pago), quando houver planos pagos — ele recebe os dados
          necessários à cobrança; nós não guardamos dados de cartão.</li>
      </ul>
      <p>
        Esses provedores podem manter servidores fora do Brasil. Nesses casos, a transferência internacional segue as
        garantias previstas na LGPD. Também podemos compartilhar dados quando exigido por lei ou por ordem judicial.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Usamos apenas cookies <strong>essenciais</strong>, necessários para manter você conectado à sua conta. Não usamos
        cookies de publicidade nem de rastreamento de terceiros.
      </p>

      <h2>7. Por quanto tempo guardamos</h2>
      <ul>
        <li>Dados da conta e da loja: enquanto a conta existir. Após o pedido de exclusão, apagamos em até 30 dias, exceto o que
          a lei obrigar a manter;</li>
        <li>Anúncios excluídos: removidos do site na hora, com as fotos;</li>
        <li>Contagem de visualizações e cliques: até 12 meses;</li>
        <li>Alertas: até você cancelar (pelo link em qualquer e-mail de alerta) — pedidos não confirmados podem ser apagados.</li>
      </ul>

      <h2>8. Seus direitos</h2>
      <p>Pelo art. 18 da LGPD, você pode, a qualquer momento:</p>
      <ul>
        <li>confirmar se tratamos seus dados e acessá-los;</li>
        <li>corrigir dados incompletos, inexatos ou desatualizados (boa parte pode ser feita no próprio painel);</li>
        <li>pedir a exclusão da conta e dos dados, a portabilidade ou informações sobre compartilhamento;</li>
        <li>revogar consentimentos e se opor a tratamentos baseados em legítimo interesse.</li>
      </ul>
      <p>
        Para excluir a conta, veja o passo a passo em <a href="/excluir-conta">Excluir minha conta</a>.
        Para exercer qualquer direito, escreva para <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a> a partir do e-mail
        da sua conta. Respondemos em até 15 dias. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
      </p>

      <h2>9. Segurança</h2>
      <p>
        Usamos conexão criptografada (https), controle de acesso por conta e regras no banco de dados que impedem um usuário
        de ver ou alterar dados de outro. Nenhum sistema é 100% seguro; se ocorrer um incidente relevante, avisaremos os
        afetados e a ANPD, conforme a lei.
      </p>

      <h2>10. Menores de idade</h2>
      <p>O AutoRegião é destinado a maiores de 18 anos e não coleta intencionalmente dados de menores.</p>

      <h2>11. Alterações</h2>
      <p>
        Esta Política pode ser atualizada. A data da última versão fica no topo da página e mudanças relevantes serão
        avisadas. Veja também os nossos <Link href="/termos">Termos de Uso</Link>.
      </p>
    </PaginaLegal>
  );
}
