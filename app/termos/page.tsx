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
    <PaginaLegal titulo="Termos de Uso" atualizadoEm="14 de outubro de 2026">
      <p>
        Estes Termos regulam o uso do <strong>AutoRegião</strong> (site autoregiao.com.br e apps para Android e iPhone), plataforma de anúncios de veículos
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
      <p>
        Recursos de apoio exibidos no site têm caráter apenas informativo: os selos &quot;Bom preço&quot; e &quot;Super preço&quot;
        comparam o preço anunciado com a Tabela FIPE do mês; a &quot;parcela estimada&quot; é uma simulação e <strong>não é
        oferta de crédito</strong>; e a distância &quot;a X km&quot; é aproximada, calculada entre cidades.
      </p>

      <h2>2. Cadastro e conta</h2>
      <ul>
        <li>Para anunciar é preciso criar uma conta com dados verdadeiros e mantê-los atualizados.</li>
        <li>O uso é permitido apenas para maiores de 18 anos.</li>
        <li>Você é responsável por guardar sua senha e por tudo o que for feito com a sua conta.</li>
        <li>Podemos recusar, suspender ou encerrar contas que descumpram estes Termos.</li>
        <li><strong>Revendas e lojistas</strong> (quem vende veículos com frequência ou como atividade comercial) devem anunciar
          pelos planos de loja. Contas de pessoa física usadas por revendas podem ser desativadas e seus anúncios removidos.</li>
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

      <h2>5. Planos, anúncios pagos e pagamentos</h2>
      <h3>5.1 Lojas</h3>
      <ul>
        <li>Lojas novas têm um período gratuito informado no cadastro. Depois dele, a continuidade dos anúncios depende da
          contratação de um plano, com valores, limite de anúncios e benefícios informados no site antes da contratação.</li>
        <li>A <strong>ordem dos anúncios</strong> na busca e na página inicial considera o plano contratado (Premium, depois
          Profissional, depois Básico) e, dentro de cada plano, os anúncios mais recentes. Anúncios de pessoa física aparecem
          depois dos anúncios de lojas.</li>
        <li>Os planos são pagos por período (1, 3 ou 6 meses), pelo Mercado Pago (Pix, cartão ou boleto). Os dias pagos são
          somados ao prazo que a loja ainda tem. A renovação não é automática: avisamos no painel antes do vencimento.</li>
        <li>Após o vencimento há 3 dias de carência. Depois disso, os anúncios da loja deixam de aparecer no site (não são
          apagados) e voltam assim que o plano for renovado.</li>
        <li>As lojas recebem um <strong>relatório mensal</strong> com visualizações e contatos dos anúncios, por e-mail e, quando
          houver WhatsApp cadastrado, também por WhatsApp.</li>
        <li>O selo <strong>&quot;Loja verificada&quot;</strong> indica que conferimos, na data da verificação, o CNPJ, o endereço e o
          telefone da loja. Ele não é garantia sobre os veículos nem sobre os negócios feitos com a loja.</li>
      </ul>
      <h3>5.2 Pessoas físicas</h3>
      <ul>
        <li>Cada pessoa física tem direito a <strong>1 anúncio grátis, por 60 dias</strong>, sem renovação. Para isso pedimos o
          CPF e o WhatsApp, apenas para conferir que é 1 anúncio grátis por pessoa (veja a{" "}
          <Link href="/privacidade">Política de Privacidade</Link>).</li>
        <li>Depois de usado o anúncio grátis, novos anúncios são pagos como <strong>anúncio avulso</strong>, por 30 ou 60 dias,
          com o valor informado no site antes do pagamento. O pagamento é feito uma vez, pelo Mercado Pago.</li>
        <li>Ao fim do prazo, o anúncio sai do ar automaticamente.</li>
      </ul>
      <h3>5.3 Arrependimento, reembolso e cupons</h3>
      <ul>
        <li><strong>Arrependimento:</strong> você pode desistir de um plano ou anúncio avulso em até 7 dias após o pagamento, com
          reembolso integral (art. 49 do Código de Defesa do Consumidor), pedindo pelo e-mail de contato abaixo. Depois desse
          prazo, não há reembolso proporcional do período já pago, que continua valendo até o fim.</li>
        <li>Cupons promocionais são pessoais, de uso único e podem ter validade.</li>
      </ul>
      <h3>5.4 Banners patrocinados</h3>
      <ul>
        <li>O carrossel da página inicial pode exibir <strong>banners patrocinados</strong> de lojas e de negócios do ramo
          (despachantes, seguradoras, autopeças etc.), sempre identificados como &quot;Patrocinado&quot;.</li>
        <li>O conteúdo do banner é de responsabilidade do anunciante. O AutoRegião não endossa os produtos ou serviços
          anunciados e pode recusar ou retirar banners que descumpram estes Termos.</li>
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
