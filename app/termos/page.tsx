import type { Metadata } from "next";
import Link from "next/link";
import PaginaLegal from "@/components/PaginaLegal";
import { CIDADE_RESPONSAVEL, EMAIL_CONTATO, RESPONSAVEL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de Uso | AutoRegião",
  description: "Regras de uso do AutoRegião para compradores, lojistas e anunciantes.",
};

export default function Termos() {
  return (
    <PaginaLegal titulo="Termos de Uso" atualizadoEm="28 de setembro de 2026">
      <p>
        Estes Termos regulam o uso do <strong>AutoRegião</strong> (site autoregiao.com.br), plataforma de anúncios de veículos
        operada por <strong>{RESPONSAVEL}</strong>, com sede em {CIDADE_RESPONSAVEL}. Ao usar o site ou criar uma conta, você
        concorda com estes Termos e com a nossa <Link href="/privacidade">Política de Privacidade</Link>.
      </p>

      <h2>1. O que é o AutoRegião</h2>
      <p>
        O AutoRegião é um espaço onde lojistas e particulares anunciam veículos e onde compradores encontram esses anúncios e
        entram em contato direto com quem anunciou (por exemplo, pelo WhatsApp).
      </p>
      <p>
        <strong>O AutoRegião não vende, não compra e não intermedeia a negociação</strong>, não recebe pagamentos pelos veículos
        e não é parte do negócio fechado entre comprador e vendedor. Preço, condições, documentação, vistoria e entrega são
        combinados diretamente entre as partes.
      </p>

      <h2>2. Cadastro e conta</h2>
      <ul>
        <li>Para anunciar é preciso criar uma conta com dados verdadeiros e mantê-los atualizados.</li>
        <li>O uso é permitido apenas para maiores de 18 anos.</li>
        <li>Você é responsável por guardar sua senha e por tudo o que for feito com a sua conta.</li>
        <li>Podemos recusar, suspender ou encerrar contas que descumpram estes Termos.</li>
      </ul>

      <h2>3. Regras para anunciantes</h2>
      <p>Ao publicar um anúncio, você declara e garante que:</p>
      <ul>
        <li>tem o direito de vender o veículo (é o proprietário ou está autorizado por ele);</li>
        <li>as informações (marca, modelo, ano, quilometragem, preço, estado de conservação) são verdadeiras;</li>
        <li>as fotos são do próprio veículo anunciado e você tem direito de usá-las;</li>
        <li>vai informar ao comprador qualquer restrição, débito, sinistro ou pendência que conheça.</li>
      </ul>
      <p>É proibido anunciar ou usar o site para:</p>
      <ul>
        <li>veículos roubados, clonados, com documentação irregular ou que não existam;</li>
        <li>golpes, pedidos de pagamento antecipado sem garantia ou qualquer fraude;</li>
        <li>conteúdo ofensivo, discriminatório, enganoso ou que viole direitos de terceiros;</li>
        <li>coletar dados de outros usuários para fins não relacionados à compra e venda do veículo.</li>
      </ul>
      <p>
        Podemos pausar ou remover anúncios que descumpram estas regras, ou que recebam denúncias fundamentadas, sem aviso prévio.
      </p>

      <h2>4. Dicas de segurança para compradores</h2>
      <ul>
        <li>Veja o veículo pessoalmente, de preferência em local movimentado, antes de pagar qualquer valor.</li>
        <li>Confira a documentação e consulte débitos e restrições no Detran antes de fechar negócio.</li>
        <li>Desconfie de preços muito abaixo do mercado e de pedidos de sinal ou depósito antecipado.</li>
      </ul>

      <h2>5. Lojistas, planos e pagamentos</h2>
      <ul>
        <li>Lojas novas têm um período gratuito informado no cadastro. Depois dele, a continuidade dos anúncios depende da
          contratação de um plano, com valores e condições informados no site antes da contratação.</li>
        <li>Planos pagos são cobrados de forma recorrente e podem ser cancelados a qualquer momento; o cancelamento vale a
          partir do próximo ciclo de cobrança.</li>
        <li>Anúncios avulsos de particulares, quando pagos, valem pelo período informado na contratação.</li>
        <li>Cupons promocionais são pessoais, de uso único e podem ter validade.</li>
      </ul>

      <h2>6. Responsabilidades</h2>
      <p>
        O conteúdo de cada anúncio é de responsabilidade exclusiva de quem o publicou. Fazemos o possível para manter o site
        no ar e seguro, mas não garantimos funcionamento ininterrupto nem nos responsabilizamos por negócios, prejuízos ou
        desentendimentos entre compradores e vendedores.
      </p>

      <h2>7. Propriedade intelectual</h2>
      <p>
        A marca, o nome, o layout e o código do AutoRegião pertencem ao seu responsável. Ao publicar fotos e textos, você nos
        autoriza a exibi-los no site e em divulgações do próprio anúncio, enquanto ele estiver publicado.
      </p>

      <h2>8. Alterações</h2>
      <p>
        Estes Termos podem ser atualizados. Mudanças relevantes serão avisadas no site ou por e-mail. O uso continuado após a
        atualização significa concordância com a nova versão.
      </p>

      <h2>9. Foro e contato</h2>
      <p>
        Estes Termos seguem a lei brasileira. Fica eleito o foro da comarca de {CIDADE_RESPONSAVEL}, ressalvado o direito do
        consumidor de propor ação no foro do seu domicílio. Dúvidas, denúncias de anúncios ou pedidos:{" "}
        <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>.
      </p>
    </PaginaLegal>
  );
}
