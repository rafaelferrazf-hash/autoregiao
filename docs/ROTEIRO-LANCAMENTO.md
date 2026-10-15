# AutoRegião — roteiro do lançamento

Criado em 13/10/2026. Este é o roteiro único até o lançamento oficial. Cada etapa tem **quem faz**,
**como saber que está pronta** e **o que fazer se der errado**. Marcar ✅ ao concluir e anotar a data.

**Regra de ouro:** só lança quando **todos** os itens da "Checagem final" (Etapa 6) estiverem ✅.
Se um item crítico falhar, adia o lançamento (o site continua no ar normalmente, só não divulgamos).

Legenda: 👤 = Rafael · 🤖 = Claude (no código) · 🔴 = crítico (bloqueia o lançamento) · 🟡 = importante · 🟢 = desejável

---

## Calendário sugerido

| Período | Etapa |
|---|---|
| 13/10 – 17/10 | Etapa 1: decisões de negócio (planos, data, nome fiscal) |
| 13/10 – 24/10 | Etapa 2: site pronto (textos legais, ajustes, testes completos) |
| 20/10 – 31/10 | Etapa 3: apps nas lojas (Google Play produção + App Store) |
| 13/10 – 31/10 | Etapa 4: lojas reais cadastradas (**o mais importante**) |
| 27/10 – 31/10 | Etapa 5: divulgação preparada |
| **sex 30/10** | **Etapa 6: checagem final — decide se lança** |
| **ter 03/11** | **Etapa 7: dia do lançamento** |
| 03/11 – 03/12 | Etapa 8: acompanhamento dos primeiros 30 dias |

Por que terça 03/11: dá folga para a revisão da Google (até 7 dias depois de pedir a produção, por volta
de 20/10) e da Apple (1 a 3 dias). Terça é melhor que sexta: se algo quebrar, há a semana inteira para corrigir.

---

## Etapa 1 — Decisões de negócio (13/10 – 17/10)

| # | Item | Quem | Pronto quando |
|---|---|---|---|
| 1.1 🔴 | **Valores dos planos.** Hoje no código, ainda não publicados: Básico R$69/15, Profissional R$129/40, Premium R$249/ilimitado. Decidir se fica assim, se muda, ou se vai com 2 planos | 👤 decide · 🤖 ajusta | ✅ 13/10: 69/129/249, 3 planos |
| 1.2 🔴 | Rodar `supabase/fase23-planos-novos.sql` (limites no banco) e só **depois** publicar o código | 👤 SQL · 🤖 publica | ✅ 13/10 (fase23 rodada e publicada) |
| 1.3 🟡 | **"Preço de fundador"**: as primeiras lojas pagam o valor de lançamento enquanto se mantiverem assinantes? Decidir sim ou não e por quanto tempo | 👤 | Regra escrita aqui |
| 1.4 🟡 | Período grátis de 60 dias: manter para todas as lojas que entrarem no lançamento? (sugestão: sim, é o principal argumento de venda) | 👤 | Decidido |
| 1.5 🔴 | **Parte fiscal:** você vende planos como pessoa física (CPF). Conversar com um contador sobre abrir um MEI/CNPJ e emitir nota fiscal. Não sou contador, então essa conversa é com ele | 👤 | Conversa com o contador feita, decisão anotada |
| 1.6 🟡 | Confirmar a **data do lançamento** (sugestão: 03/11) | 👤 | Data fixada |

---

## Etapa 2 — Site pronto (13/10 – 24/10)

### 2A. Textos e regras
| # | Item | Quem | Pronto quando |
|---|---|---|---|
| 2.1 🔴 | Revisar **/termos**: planos, preços, período grátis, carência de 3 dias, cancelamento, reembolso, responsabilidade pelo anúncio (o site não vende carro, só anuncia) | 🤖 rascunha · 👤 aprova | ✅ 14/10 (d4628e2) |
| 2.2 🔴 | Revisar **/privacidade** (LGPD): quais dados guardamos, para quê, Resend, Mercado Pago, localização (só na memória), excluir conta | 🤖 · 👤 | ✅ 14/10 (d4628e2) |
| 2.3 🟡 | Se abrir CNPJ (1.5): colocar razão social e CNPJ no rodapé e nos termos | 🤖 | Rodapé atualizado |
| 2.4 🟡 | Revisar os textos de /anunciar e /painel/planos com os valores finais | 🤖 · 👤 | Aprovado |

### 2B. Teste completo do site (roteiro de testes)
Fazer **no celular e no computador**, com contas de teste. Anotar o que falhar e corrigir antes de seguir.

| # | Fluxo | Pronto quando |
|---|---|---|
| 2.5 🔴 | Comprador: página inicial → busca → filtros → anúncio → WhatsApp / Ligar | Tudo abre, o WhatsApp abre com a mensagem pronta |
| 2.6 🔴 | Lojista novo: cadastro → e-mail de confirmação chega (Gmail **e** Hotmail/Outlook) → login → perfil da loja (logo, capa, endereço) → 1º anúncio com fotos e FIPE | Anúncio aparece na busca e na página da loja |
| 2.7 🔴 | Particular: cadastro → 1 anúncio grátis → tenta o 2º → é bloqueado com mensagem clara | OK |
| 2.8 🔴 | **Pagamento real** de um plano por Pix e por cartão (valor novo) → plano aplicado sozinho → e-mails do lojista e do admin chegam | Plano muda no painel em até 1 minuto |
| 2.9 🔴 | Esqueci a senha → e-mail → redefinir → entra | OK |
| 2.10 🟡 | Alerta de carro: criar → confirmar pelo e-mail → no dia seguinte chega o aviso | OK |
| 2.11 🟡 | Marcar como vendido, pausar, reativar, limite do plano | OK |
| 2.12 🟡 | Excluir conta (loja de teste sem pagamento) | Conta some |
| 2.13 🟡 | Admin: Lojas, Verificar selo, Banners, Relatórios | OK |
| 2.14 🟢 | Favoritos, comparar, Perto de mim, Tabela FIPE | OK |

### 2C. Limites dos serviços grátis (risco técnico principal)
| # | Item | Quem | Pronto quando |
|---|---|---|---|
| 2.15 🔴 | **Resend grátis = 100 e-mails por dia / 3.000 por mês.** No lançamento (cadastros + confirmações + alertas) isso pode estourar e os e-mails de login deixam de chegar. Decidir: passar para o plano pago (~US$20/mês) **antes** do dia, ou acompanhar de perto | 👤 decide · 🤖 confere o uso | Decisão tomada; se pago, plano ativo |
| 2.16 🔴 | **Vercel Pro** (US$20/mês): o plano grátis não permite uso comercial | 👤 | Vercel mostra "Pro" (fazer na semana do lançamento) |
| 2.17 🟡 | Supabase grátis: 500 MB banco, 1 GB fotos, 5 GB tráfego. Olhar o Usage antes e 1x por semana no 1º mês. O Pro custa US$25/mês: passar quando qualquer número chegar a ~70% | 👤 olha · 🤖 orienta | Print do Usage conferido |
| 2.18 🟡 | **Cópia do banco** antes de apagar os dados de teste (o Supabase grátis não guarda backup). Eu preparo o passo a passo para exportar | 🤖 · 👤 | Arquivo da cópia guardado no Drive |
| 2.19 🟢 | Google Search Console: sem erros graves; sitemap lido | 👤 print · 🤖 analisa | OK |

---

## Etapa 3 — Apps nas lojas (20/10 – 31/10)

### Google Play
| # | Item | Quem | Pronto quando |
|---|---|---|---|
| 3.1 🔴 | Completar os 14 dias com 12+ testadores (~20/10). Pedir aos testadores para **não desinstalarem** | 👤 | Botão "Solicitar a produção" liberado |
| 3.2 🔴 | Responder o questionário da produção (opiniões dos testadores, o que mudou) | 🤖 escreve · 👤 envia | Pedido enviado |
| 3.3 🔴 | Depois da aprovação: conferir que o app abre o site sem a barra do navegador (assetlinks.json) | 👤 testa · 🤖 corrige | Abre em tela cheia |
| 3.4 🟡 | Refazer as 5 capturas de tela com **anúncios reais** (depois da Etapa 4) | 🤖 · 👤 | Fichas atualizadas |

**Plano B:** se a Google recusar ou atrasar, **lança só com o site** (e o iPhone, se estiver pronto).
O app entra depois, com um segundo aviso de divulgação. O site já funciona instalado pelo navegador (PWA).

### App Store (iPhone): plano do lançamento do app
Ficha e respostas da revisão: `docs/app-store-ficha.md`. App: id 6820997830, versão 1.0.0 (compilação 10),
só Brasil, **liberação manual**.

| # | Item | Quem | Pronto quando |
|---|---|---|---|
| 3.5 🔴 | Testar no TestFlight: login, anúncio, fotos, WhatsApp, notificação de alerta, excluir conta, planos escondidos | 👤 testa | ✅ 14/10 (compilação 10) |
| 3.6 🔴 | Capturas de tela 6,9" e ficha (descrição, palavras-chave, suporte, privacidade) | 🤖 prepara · 👤 envia | ✅ 14/10 |
| 3.7 🔴 | Rótulos de privacidade ("Privacidade do app") e conta demo para o revisor | 🤖 · 👤 | ✅ 14/10 |
| 3.8 🔴 | Enviar para a revisão (submit) | 👤 | ✅ enviado 14/10 ~15:10 → ⏳ aguardando resposta |

#### Fase A: enquanto a Apple revisa (agora, normalmente 1 a 3 dias)
- **Congelar o app:** nada de nova montagem no Codemagic nem de mexer na versão 1.0.0. Uma compilação nova
  volta para o fim da fila de revisão. **O site pode mudar à vontade**, porque o app mostra o site.
- **Não mexer na conta `revisao@`** (senha, loja, anúncios): o revisor entra com ela.
- O e-mail da Apple chega no **rafaelferrazf@hotmail.com**. Status no App Store Connect → Apps → AutoRegião:
  "Aguardando revisão" → "Em revisão" → **"Aguardando liberação do desenvolvedor"** (= aprovado).
- 🤖 Preparar já, para usar quando o app for liberado:
  - [ ] Selos **em português** ("Baixar na App Store" / "Disponível no Google Play"; o atual está em inglês).
    Os oficiais vêm das páginas de marketing da Apple e da Google. 👤 baixa, 🤖 coloca no site
  - [ ] Link único **autoregiao.com.br/app**: abre a App Store no iPhone, a Google Play no Android e a página
    inicial no computador. Serve para o QR code dos panfletos, adesivos das lojas e Instagram
  - [ ] Faixa do Safari "Abrir no app / Obter" (Smart App Banner da Apple) para quem visita o site pelo iPhone
  - [ ] Tudo isso fica **desligado** até a Fase C (chave `APP_IPHONE.publicado` em `lib/site.ts`)

#### Se a Apple recusar ("Rejected")
Não é o fim: responder na **Central de Resoluções** (App Store Connect → o app → mensagem da Apple) e reenviar.
Cada nova rodada leva mais ~1–2 dias. 👤 manda print da mensagem (sem dados pessoais), 🤖 escreve a resposta
em inglês e faz a correção. Motivos mais prováveis para um app como o nosso:

| Regra da Apple | O que alegam | Nossa resposta já pronta |
|---|---|---|
| 4.2 Funcionalidade mínima | "É só um site dentro de um app" | Recursos do aparelho: notificações de alerta, compartilhar nativo, localização "Perto de mim", tela sem conexão. Explicar com prints |
| 1.2 Conteúdo de usuários | Faltam meios de denunciar ou **bloquear** usuários | Denunciar ✅ (af25b47). Se pedirem "bloquear": fazer "Ocultar anúncios deste vendedor" (~1 dia de trabalho) |
| 2.1 Informação incompleta | Não conseguiram entrar na conta demo | Conferir a conta `revisao@` e responder |
| 5.1.1 Excluir conta | Não acharam o botão | Explicar o caminho (já está nas observações) |
| 3.1.1 Pagamentos | Viram preço de plano | Os planos ficam escondidos no app. Achar a tela que escapou e corrigir **no site** (sem nova montagem) |

#### Fase B: aprovado, aguardando o lançamento
- O app **fica parado** em "Aguardando liberação do desenvolvedor" até você apertar o botão. Só não enviar
  outra versão nesse meio-tempo, porque ela substitui a aprovada.
- **Quando liberar:** a Apple diz que a liberação pode levar **até 24 horas** para aparecer na loja.
  Por isso **liberar na segunda 02/11 de manhã**, um dia antes do lançamento.
  Nada de mal acontece se alguém achar o app antes: ele mostra o mesmo site que já está no ar.
- Como liberar: App Store Connect → Apps → AutoRegião → versão 1.0.0 → botão **"Liberar esta versão"**.
- Depois de liberar (segunda à tarde), 👤 testa:
  1. Abrir `https://apps.apple.com/br/app/id6820997830` no iPhone: a página da loja aparece
  2. Apagar a versão do TestFlight e **instalar pela App Store**
  3. Abrir, entrar na conta, ver um anúncio, tocar no WhatsApp, criar um "Avisar neste celular"
  4. Procurar "AutoRegião" na busca da App Store (o nome pode levar alguns dias para aparecer na busca;
     o link direto funciona antes)

#### Fase C: dia do lançamento (terça 03/11), parte do iPhone
- 🤖 Ligar `APP_IPHONE.publicado = true` (slide "Baixe o app" no carrossel, selos, /app, faixa do Safari) e publicar
- Divulgar com o link `autoregiao.com.br/app` (serve para iPhone e Android)
- Se o Android ainda não estiver aprovado: ligar só o iPhone. O `/app` manda o Android para o site

#### Fase D: depois do lançamento
| Quando | O quê | Quem |
|---|---|---|
| 1ª semana | Pedir aos testadores e às lojas parceiras uma **avaliação sincera** na App Store (pedir pode; oferecer brinde em troca de nota ou escrever avaliação falsa é proibido pela Apple) | 👤 |
| Sempre | Responder todas as avaliações em App Store Connect → Avaliações | 👤 · 🤖 escreve |
| Quando tiver anúncios reais | **Versão 1.0.1**: capturas com anúncios reais e tirar das observações a frase "alguns anúncios são de demonstração". As capturas só mudam enviando uma versão nova (o "Texto promocional" muda a qualquer hora) | 🤖 · 👤 |
| Sempre | Mudanças **só no site** chegam no app na hora, sem revisão. Mudanças **do app** (permissões, abertura, faixa) = nova montagem + nova revisão | — |
| 09/10/2027 | Renovação do Apple Developer (US$ 99/ano, cartão no nome dele). Se vencer, o app sai da loja | 👤 |

**Plano B:** igual ao da Google. Lança sem o app do iPhone e anuncia quando for aprovado.

### Quando os apps forem aprovados
| 3.9 🟡 | Ligar o slide e os botões "Baixe o app" (`APP_ANDROID/APP_IPHONE.publicado = true` em `lib/site.ts`) | 🤖 | Slide aparece no carrossel |
|---|---|---|---|
| 3.10 🟡 | Conta do revisor `revisao@` / loja "Demonstração AutoRegião": **não apagar**. A Apple e a Google revisam **toda versão nova** e entram com ela. Tirar os anúncios dela da vista do público (deixar só para a própria conta) em vez de desativar | 🤖 · 👤 | Público não vê a loja; revisor ainda entra |

---

## Etapa 4 — Lojas e anúncios reais (13/10 – 31/10) — **o mais importante**

Um site de classificados vazio no dia do lançamento passa a impressão de abandonado, e o comprador não volta.
**Meta mínima para lançar: 10 lojas reais e 150 anúncios reais com fotos.** Meta boa: 20 lojas e 300 anúncios.

| # | Item | Quem | Pronto quando |
|---|---|---|---|
| 4.1 🔴 | Lista das lojas de Teixeira e região (nome, contato, quantos carros têm). Começar pelas que anunciam na Mobiauto / OLX | 👤 | Lista com 30+ lojas |
| 4.2 🔴 | Visitar ou mandar mensagem: 60 dias grátis + (se decidido) preço de fundador | 👤 · 🤖 escreve a mensagem | 10+ lojas toparam |
| 4.3 🔴 | **Ajudar a cadastrar**: muitas lojas não vão ter tempo. Oferecer cadastrar os carros por elas (você ou alguém contratado), com as fotos que elas mandarem | 👤 | Anúncios no ar |
| 4.4 🟡 | Conferir cada loja (endereço, telefone) e dar o selo **"Loja verificada"** | 👤 no /admin | Selo nas lojas conferidas |
| 4.5 🟡 | Logo e capa nas páginas das lojas | 👤 · lojistas | Lojas com logo |
| 4.6 🟢 | 2–3 lojas fecham Premium logo no início, para a vitrine "Ofertas em destaque" ter conteúdo real | 👤 | Vitrine com lojas reais |

> Os anúncios demo e as lojas de teste só aparecem para as contas liberadas. As lojas reais já aparecem
> para todo mundo assim que entram, então dá para cadastrar com calma antes do dia.

---

## Etapa 5 — Divulgação preparada (27/10 – 31/10)

**Plano completo (tráfego pago para lojistas e compradores, telões, orçamento, calendário): `docs/PLANO-MARKETING.md`.**

| # | Item | Quem | Pronto quando |
|---|---|---|---|
| 5.1 🟡 | Instagram da AutoRegião (perfil, bio com o link, 6–9 posts prontos para a semana) | 👤 · 🤖 textos | Perfil pronto |
| 5.2 🟡 | **Perfil da Empresa no Google** (Google Maps) | 👤 | Perfil verificado |
| 5.3 🟡 | Mensagem de WhatsApp para status e grupos da região (texto + imagem) | 🤖 texto · 👤 envia | Pronta |
| 5.4 🟡 | Kit para as lojas divulgarem ("Nossos carros também estão no AutoRegião" + link da página da loja) | 🤖 | Kit enviado às lojas |
| 5.5 🟢 | Rádio, jornal ou blog local, influenciador de carros da região | 👤 | Contato feito |
| 5.6 🟢 | Banners pagos do carrossel: oferecer as 4 vagas a despachantes, financeiras, oficinas, seguros | 👤 | 1+ vaga vendida |

---

## Etapa 6 — Checagem final ("vai ou não vai") — sexta 30/10

Lança na terça **só se todos os 🔴 estiverem ✅**:

- [ ] Planos finais publicados e o SQL da fase23 rodado (1.1, 1.2)
- [ ] Termos e privacidade aprovados (2.1, 2.2)
- [ ] Roteiro de testes 2.5 a 2.9 passou no celular e no computador
- [ ] Pagamento real com o valor novo funcionou (2.8)
- [ ] Decisão sobre o Resend tomada (2.15)
- [ ] 10+ lojas reais e 150+ anúncios reais no ar (Etapa 4)
- [ ] Cópia do banco feita (2.18)
- [ ] Apps: aprovados **ou** plano B aceito (lançar só com o site)

Se faltar algum: nova data, uma semana depois. Sem pressa, porque **lançar quebrado custa mais que atrasar**.

---

## Etapa 7 — Dia do lançamento (terça 03/11)

Fazer **de manhã cedo**, nesta ordem (cerca de 1 hora). Eu acompanho cada passo com você.

| Ordem | Passo | Quem |
|---|---|---|
| 1 | Vercel Pro ativo (2.16) e Resend no plano decidido (2.15) | 👤 |
| 2 | Cópia do banco do dia (mesmo passo do 2.18) | 👤 |
| 3 | Antes de apagar: conferir se os anúncios da loja do revisor (`revisao@`) estão marcados como demonstração. Se estiverem, guardar uns 3 para o revisor das próximas versões (3.10) |
| 3b | **Apagar os dados de teste** no SQL Editor (as lojas fictícias e os 450 + 20 anúncios demo): <br>`delete from public.veiculos where demonstracao = true;`<br>`delete from public.lojas where demonstracao = true;` | 👤 |
| 4 | Decidir o que fazer com a loja de teste "Auto Paulista" (Civic e Onix de teste): apagar os 2 anúncios ou desativar a loja | 👤 · 🤖 |
| 5 | Esvaziar a lista `acesso_demonstracao` e tirar as fotos demo do site (`public/demo/`), se não forem mais usadas | 🤖 SQL e código · 👤 roda |
| 6 | Conferir **sem login** e numa aba anônima: página inicial, busca, uma loja, um anúncio. Não pode aparecer nada de teste | 🤖 · 👤 |
| 7 | Ligar os botões dos apps aprovados (3.9). O iPhone já foi liberado na App Store na segunda 02/11 (Etapa 3, Fase B) | 🤖 |
| 8 | Fazer 1 cadastro de teste com um e-mail novo e confirmar que o e-mail chega. Depois apagar a conta | 👤 |
| 9 | **Divulgar**: Instagram, WhatsApp, lojas parceiras compartilham | 👤 |
| 10 | Ficar de olho a tarde toda: e-mails de "Nova assinatura", mensagens no contato@, erros | 👤 · 🤖 |

**Se algo quebrar no dia:** mandar print para o Claude. Para erro no site, a Vercel volta a versão
anterior em 1 clique (Deployments → versão anterior → "Promote to Production"). Eu te guio.

---

## Etapa 8 — Primeiros 30 dias

| Quando | O que olhar | Quem |
|---|---|---|
| Todo dia, 1ª semana | Mensagens no contato@, WhatsApp das lojas, e-mails de assinatura | 👤 |
| 2x por semana | Uso do Resend e do Supabase (prints para mim) | 👤 · 🤖 |
| Semanal | Lojas sem anúncio novo há 7 dias: ligar e ajudar | 👤 |
| Semanal | Avaliações nas lojas de apps: responder todas | 👤 |
| Dia 01/12 | 1º relatório mensal real enviado às lojas (aba Relatórios no /admin) | 👤 · cron |
| Dia 30 | Balanço: visitas, contatos por WhatsApp, lojas, assinaturas → ajustar preços e divulgação | 👤 · 🤖 |
| **~02/01/2027** | **Fim dos 60 dias grátis** das lojas do lançamento. Uma semana antes, ligar para cada uma com o relatório de contatos | 👤 |

> Em dezembro/janeiro, ao fim dos 60 dias grátis, sabemos se as lojas pagam.
> O relatório mensal com os contatos recebidos é o principal argumento de venda.

---

## Depois do lançamento (não bloqueia)
- Importar o estoque das lojas por planilha (é o que mais trava lojas grandes)
- Vídeo nos anúncios
- Logo em vetor por um designer + registro da marca no INPI
- Planos pagos para particulares
- Limpeza de fotos de vendidos (quando o Storage passar de ~50%)
