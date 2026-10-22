# App Store — ficha do app AutoRegião (iPhone)

Preencher no **App Store Connect → Apps → AutoRegião: Carros da Região**.
Versão **1.0.0**, compilação **10** (Codemagic, commit d4628e2).

---

## 1. Informações do app (menu "Informações do app")

| Campo | Valor |
|---|---|
| Nome | `AutoRegião: Carros da Região` (28 de 30 letras) |
| Subtítulo | `Compre e venda carros e motos` (29 de 30) |
| Categoria principal | **Compras** |
| Categoria secundária | **Estilo de vida** |
| Direitos de conteúdo | "Não, o app não contém, mostra nem acessa conteúdo de terceiros" → **NÃO**. Marque: **"Sim, contém conteúdo de terceiros e tenho os direitos necessários"** (os anúncios são publicados pelos anunciantes, que garantem os direitos — ver Termos, item 3) |
| Classificação etária | ver item 5 |

## 2. Página da versão 1.0.0 (menu "Distribuição" → "iOS App 1.0")

**Texto promocional** (até 170 letras — pode mudar sem nova revisão):
```
Carros, motos e utilitários de Teixeira de Freitas e região em um só lugar. Veja quem está perto de você e receba aviso quando chegar o carro que procura.
```

**Descrição** (até 4.000 letras):
```
O AutoRegião reúne os carros, motos e utilitários à venda em Teixeira de Freitas e região, de lojas e de particulares. Encontre o veículo certo perto de você e fale direto com o vendedor pelo WhatsApp.

BUSQUE DO SEU JEITO
• Filtros por marca, modelo, cidade, ano (de/até), preço, quilometragem, câmbio, combustível e tipo de carroceria
• "Perto de mim": mostra os veículos da cidade mais próxima e a distância de cada um
• Busca por valor de parcela estimada
• Situação do veículo: IPVA pago, licenciado, único dono, revisões em dia, laudo e garantia

SAIBA SE O PREÇO É JUSTO
• Comparação com a Tabela FIPE em cada anúncio
• Selos "Bom preço" e "Super preço" quando o valor está abaixo da FIPE
• Consulta gratuita da Tabela FIPE de carros e motos

NÃO PERCA A OPORTUNIDADE
• Crie um alerta e receba uma notificação quando aparecer um anúncio novo da sua busca
• Salve seus favoritos e compare até 3 veículos lado a lado
• Compartilhe anúncios com amigos e família

FALE DIRETO COM QUEM VENDE
• Contato pelo WhatsApp ou ligação, sem intermediários
• Página de cada loja com endereço, mapa, horário e todo o estoque
• Selo "Loja verificada" para lojas conferidas pelo AutoRegião

QUER VENDER?
• Pessoa física: anuncie seu veículo com fotos e contato direto
• Lojas e revendas: página própria, painel com estatísticas de visualizações e contatos, e relatório mensal

O AutoRegião é um espaço de divulgação: não vende veículos nem intermedeia pagamentos. A negociação é feita diretamente entre comprador e vendedor.

Dúvidas e sugestões: contato@autoregiao.com.br
```

**Palavras-chave** (até 100 letras, separadas por vírgula, sem espaço depois da vírgula):
```
autoregiao,auto regiao,carros,motos,seminovos,usados,teixeira de freitas,fipe,revenda,veiculos
```

| Campo | Valor |
|---|---|
| URL de suporte | `https://www.autoregiao.com.br/termos` |
| URL de marketing (opcional) | `https://www.autoregiao.com.br` |
| Copyright | `2026 Rafael Ferraz Barbosa` |
| Compilação | escolher a **10** |
| Versão | `1.0.0` |
| Liberação | "Liberar manualmente esta versão" (você escolhe o dia do lançamento) |

## 3. Informações para a revisão da Apple ("Informações da revisão do app")

- **Login necessário:** Sim
- **Usuário:** `revisao@autoregiao.com.br`
- **Senha:** *(a mesma da Google Play — só o Rafael tem; digitar direto no App Store Connect)*
- **Contato:** Rafael Ferraz Barbosa · e-mail rafaelferrazf@hotmail.com · telefone com DDD
- **Observações** (colar):
```
AutoRegião is a regional vehicle classifieds app (cars, motorcycles and utility vehicles) for Teixeira de Freitas, Bahia, Brazil, and nearby cities. Buyers browse listings and contact sellers directly via WhatsApp or phone. The app does not sell anything and has no in-app purchases.

How to test:
1) Browse the home screen and the search (filters, "Perto de mim" = near me, which asks for location only when tapped and uses it on the device).
2) Open a listing: photos, FIPE price comparison, share button (native iOS share sheet), WhatsApp contact.
3) Search results → "Avisar neste celular" creates a new-listing alert delivered as a push notification.
4) Log in with the demo account above: it is a store account ("Demonstração AutoRegião") with sample listings.
5) Account deletion: Painel → menu "Perfil da loja" → "Excluir minha conta" (at the bottom). It is also described at https://www.autoregiao.com.br/excluir-conta

Note: the service is in pre-launch, so some listings are demonstration samples. Offline: the app shows a "sem conexão" screen.
```

## 4. Privacidade do app ("Privacidade do app")

- **URL da Política de Privacidade:** `https://www.autoregiao.com.br/privacidade`
- **"Você ou seus parceiros coletam dados deste app?"** → **Sim**
- **Rastreamento ("Tracking")?** → **Não** (não usamos dados para publicidade nem compartilhamos com corretores de dados)

Marcar os tipos abaixo. Para **todos**: "Vinculado à identidade do usuário" conforme a coluna, **sem rastreamento**.

| Tipo de dado (Apple) | Para que (finalidade) | Vinculado ao usuário? |
|---|---|---|
| Informações de contato → **Nome** | Funcionalidade do app | Sim |
| Informações de contato → **Endereço de e-mail** | Funcionalidade do app | Sim |
| Informações de contato → **Número de telefone** | Funcionalidade do app | Sim |
| Conteúdo do usuário → **Fotos ou vídeos** | Funcionalidade do app | Sim |
| Conteúdo do usuário → **Outros conteúdos do usuário** (texto dos anúncios) | Funcionalidade do app | Sim |
| Compras → **Histórico de compras** (planos/anúncios pagos no site) | Funcionalidade do app | Sim |
| Identificadores → **ID do usuário** (conta) | Funcionalidade do app | Sim |
| Uso → **Interação com o produto** (visualizações e cliques contados de forma anônima) | Análises; Funcionalidade do app | **Não** |
| Histórico de pesquisa → **Histórico de buscas** (buscas salvas nos alertas) | Funcionalidade do app | Sim |
| Outros dados → **Outros tipos de dados** (código gerado a partir do CPF/WhatsApp do anúncio grátis) | Funcionalidade do app (prevenção de fraude) | Sim |

**Não marcar:** Localização (fica só no aparelho, não é enviada), Saúde, Financeiro (cartão fica com o Mercado Pago), Contatos, Histórico de navegação, Diagnóstico, Dados sensíveis, Dados de publicidade (banners só somam totais anônimos).

## 5. Classificação etária

Responder **"Nenhum" / "Não"** em todos os itens (violência, conteúdo sexual, palavrões, drogas, jogos de azar, terror, medicina etc.).
- Conteúdo gerado por usuário: **Sim** (anúncios publicados pelos usuários; há botão "Denunciar este anúncio")
- Acesso irrestrito à web: **Não** (o app abre só o site do AutoRegião)
- Compras dentro do app: **Não** · Publicidade: **Sim** (banners patrocinados)
- Preço: Grátis · Disponibilidade: **só Brasil** · Liberação manual
- **Enviado para revisão em 14/10/2026** (versão 1.0.0, compilação 10).

## 6. Capturas de tela

iPhone **6,9"** (1320 × 2868 px), de 3 a 10 imagens: arquivos em `docs/app-store-capturas/`.

## 7. Resposta à 1ª rejeição (20/10/2026)
Motivos: 4.1(b) cópia de marca; 2.1 conta demo com plano vencido; 2.1(b) modelo de negócio; 2.1(a) app fechou em "Take Photo" (iPad).
Correções: compilação 11 com NSCameraUsageDescription/NSPhotoLibraryUsageDescription; no app sem convite para pagar pelo site;
conta `revisao.vencido@autoregiao.com.br` (loja com plano vencido — `supabase/revisao-apple-conta-vencida.sql`).

Resposta (colar em "Revisão de apps" → responder à mensagem):
```
Hello, and thank you for the review.

Guideline 4.1(b) – AutoRegião is my own brand and service. I am Rafael Ferraz Barbosa, the owner of the developer account and the creator of AutoRegião. The domain autoregiao.com.br is registered in my name (public record: https://registro.br/tecnologia/ferramentas/whois/?search=autoregiao.com.br), and the Privacy Policy at https://www.autoregiao.com.br/privacidade identifies me as the party responsible for the service. This is the official app of www.autoregiao.com.br. I can send any additional document if needed.

Guideline 2.1(a) – Fixed. The crash happened because the camera/photo library usage descriptions were missing. Build 11 adds NSCameraUsageDescription and NSPhotoLibraryUsageDescription, and "Take Photo" now works.

Guideline 2.1 – Demo account with an expired plan: revisao.vencido@autoregiao.com.br (password in the App Review Information notes). The original demo account (revisao@autoregiao.com.br) has an active plan. Please note that the app has no purchase flow: it shows no prices, no purchase buttons and no links to buy.

Guideline 2.1(b) – Business model:
1. Only car dealerships (businesses) that advertise their vehicle inventory pay, plus individuals who want to advertise more than one vehicle (the first listing is free). Buyers never pay anything.
2. Plans are purchased only on our website, www.autoregiao.com.br (payment by Mercado Pago). They cannot be purchased in the app, and the app does not mention prices or direct users to buy.
3. A dealership with an active plan can sign in and manage its listings (create, edit, pause, mark as sold). An individual can publish the free listing.
4. Nothing is sold in the app. The paid service is advertising of physical goods (used cars sold in person by local dealers), bought on our website. The app works as a free companion to this web-based service, with no purchasing and no calls to action for purchases outside the app (Guideline 3.1.3(f)).
5. No. The app does not sell physical goods or digital content. Vehicles are negotiated directly between buyer and seller, outside the app (WhatsApp or phone).

Thank you!
Rafael Ferraz Barbosa
```

## 8. Resposta à 2ª rejeição (22/10/2026) — Guideline 3.1.1
Motivo: o app tinha cadastro de conta para empresas (lojas), visto como acesso a compra externa.
Correção (só no site, sem nova compilação): dentro dos apps (`useEmAppDaLoja`) o /cadastro é só de COMPRADOR (sem escolher tipo),
o botão do topo diz "Cadastrar", /anunciar mostra só "Já anuncia? Entrar" + WhatsApp de atendimento (neutro, sem convite
para pagar) e o PortaoParticular não cria o 1º anúncio no app. Lojas e pessoas físicas se cadastram pelo site.
Resposta (colar em "Revisão de apps" e reenviar a mesma compilação 11):
```
Hello, and thank you.

Guideline 3.1.1 – Fixed. The business account registration has been removed from the app. Inside the app, sign-up is now only for buyers (personal accounts to save favorites and alerts). Sellers, businesses and individuals, can only register outside the app, and the app has no links, buttons or text directing them there. Existing business accounts can still sign in to manage their listings, as allowed by guideline 3.1.3(f).

The change is already live (the app loads our web content), so the same build 11 can be reviewed again.

Thank you very much,
Rafael Ferraz Barbosa
```
