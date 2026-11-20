# AutoRegião — roteiro do lançamento

Criado em 13/10/2026 · **atualizado em 20/11/2026**. Este é o roteiro único até o lançamento oficial. Cada item tem
**quem faz** e **como saber que está pronto**. Marcar ✅ ao concluir e anotar a data.

**Regra de ouro:** só lança quando **todos** os itens da "Checagem final" (Etapa 6) estiverem ✅.
Se um item crítico falhar, adia o lançamento (o site continua no ar normalmente, só não divulgamos).

**Data do lançamento: EM ABERTO** (decisão do Rafael). Este roteiro usa dias relativos: **"Dia L"** é o dia do
lançamento, **"L-7"** é uma semana antes, **"L+30"** é um mês depois.

**Data fixada:** ____ / ____ / ________

## Situação em 20/11/2026

**Pronto:**

- ✅ **Apps publicados:** Android na Google Play (23/10) e iPhone na App Store (29/10). Link único `autoregiao.com.br/app`.
- ✅ **Planos definidos (26/10):** Básico R$149/15 anúncios, Profissional R$219/40 (mais popular), Premium R$329/80.
  Preço de fundador **descartado**. Pagamento real por Pix já testado (07/10).
- ✅ **Oferta:** toda loja nova ganha **60 dias grátis contados do cadastro**, sem prazo para entrar (30/10).
- ✅ **Loja só com CNPJ (16/11):** o cadastro de lojista confere o CNPJ na Receita. Quem vende sem CNPJ anuncia como
  pessoa física (1 anúncio grátis; depois avulso R$19,90/30 dias ou R$29,90/60 dias).
- ✅ **Site público "limpo" (16/11):** os 472 anúncios de demonstração só aparecem para a Auto Paulista, o admin e a
  conta de revisão. O público vê o site vazio até as lojas reais entrarem.
- ✅ **Ferramentas para as lojas:** página "Divulgar" (posts prontos, 29/10) e **Repasse entre lojistas** (18/11,
  pronto mas **fechado**, abre no Admin → Lojas quando o Rafael decidir).
- ✅ **Material:** folders dos lojistas e panfletos dos compradores entregues (QR testados em 12/11); carro plotado;
  uniformes em confecção; apostilas 1, 2 e 4 com Sumário e Apresentação (20/11); grupo de WhatsApp com foto.
- ✅ **Redes:** página do Facebook e Instagram @autoregiaooficial com capa e 12 posts (04/11).
- ✅ **Prospecção:** 37 lojas de Teixeira no RD Station CRM; contatos desde 09/11.

**Falta (crítico):**

- ❌ **Lojas reais no site: 0** (as 4 do banco são de teste/revisão). Anúncios reais: 0. Meta: 10 lojas e 150 anúncios.
- ❌ Data do lançamento · contador/MEI (1.5) · Resend (2.15) · Vercel Pro (2.16) · testes 2.5–2.9 (2.6 agora com CNPJ)
  · cópia do banco (2.18).

Legenda: 👤 = Rafael · 🤖 = Claude (no código) · 🔴 = crítico (bloqueia o lançamento) · 🟡 = importante · 🟢 = desejável

---

## Calendário (a partir da data escolhida)

| Quando | Etapa |
|---|---|
| **Agora até L-7** | Etapa 4: lojas reais cadastradas (**o mais importante**) · Etapa 1: pendências de negócio |
| L-14 a L-7 | Etapa 2: testes completos do site e serviços pagos |
| L-7 a L-3 | Etapa 5: divulgação preparada |
| **L-3** | **Etapa 6: checagem final — decide se lança** |
| **Dia L** (de preferência terça) | **Etapa 7: dia do lançamento** |
| L a L+30 | Etapa 8: acompanhamento dos primeiros 30 dias |
| ~60 dias depois de cada cadastro | Fim do período grátis de cada loja (ver Etapa 8) |

Por que terça: se algo quebrar, há a semana inteira para corrigir.

---

## Etapa 1 — Decisões de negócio

| # | Item | Quem | Situação |
|---|---|---|---|
| 1.1 🔴 | Valores dos planos | 👤 | ✅ 26/10: 149/219/329 (limites 15/40/80) |
| 1.2 🔴 | SQL dos planos rodado e código publicado | 👤 · 🤖 | ✅ fase23 + fase27 |
| 1.3 🟡 | Preço de fundador | 👤 | ✅ descartado (26/10) |
| 1.4 🟡 | Período grátis | 👤 | ✅ 60 dias do cadastro, sem prazo (30/10) |
| 1.5 🔴 | **Parte fiscal:** os planos são vendidos no CPF. Conversar com um contador sobre MEI/CNPJ e nota fiscal | 👤 | ⏳ pendente |
| 1.6 🔴 | **Fixar a data do lançamento** (depois de ter as lojas da Etapa 4) | 👤 | ⏳ em aberto |
| 1.7 🟡 | Decidir **quando abrir o Repasse** para os lojistas (pode ser no lançamento ou depois, quando houver lojas) | 👤 | ⏳ |

---

## Etapa 2 — Site pronto

### 2A. Textos e regras
| # | Item | Quem | Situação |
|---|---|---|---|
| 2.1 🔴 | /termos (planos, grátis, carência, reembolso, Repasse 5.5) | 🤖 · 👤 | ✅ 14/10, Repasse em 18/11 |
| 2.2 🔴 | /privacidade (LGPD) | 🤖 · 👤 | ✅ 14/10 |
| 2.3 🟡 | Se abrir CNPJ (1.5): razão social e CNPJ no rodapé e nos termos | 🤖 | ⏳ depende do 1.5 |
| 2.4 🟡 | Textos de /anunciar e /painel/planos com os valores finais | 🤖 · 👤 | ✅ |

### 2B. Teste completo do site (fazer no celular e no computador)
| # | Fluxo | Pronto quando |
|---|---|---|
| 2.5 🔴 | Comprador: página inicial → busca → filtros → anúncio → WhatsApp / Ligar | Tudo abre, o WhatsApp abre com a mensagem pronta |
| 2.6 🔴 | Lojista novo **com CNPJ**: cadastro → CNPJ conferido → e-mail de confirmação chega (Gmail **e** Hotmail) → login → perfil (logo, capa, endereço) → 1º anúncio com fotos e FIPE | Anúncio aparece na busca e na página da loja |
| 2.7 🔴 | Particular (CPF): cadastro → 1 anúncio grátis → tenta o 2º → vê a opção de anúncio avulso | OK |
| 2.8 🔴 | Pagamento real de um plano por Pix **e** por cartão → plano aplicado sozinho → e-mails do lojista e do admin chegam | Plano muda no painel em até 1 minuto |
| 2.9 🔴 | Esqueci a senha → e-mail → redefinir → entra | OK |
| 2.10 🟡 | Alerta de carro: criar → confirmar pelo e-mail → aviso chega | OK |
| 2.11 🟡 | Vendido, pausar, reativar, limite do plano | OK |
| 2.12 🟡 | Excluir conta (loja de teste sem pagamento) | Conta some |
| 2.13 🟡 | Admin: Lojas (CNPJ, selo), Banners, Relatórios, Visitas | OK |
| 2.14 🟢 | Favoritos, comparar, Perto de mim, Tabela FIPE, Divulgar, Repasse (com a Auto Paulista) | OK |

> **Não criar contas de teste no site de verdade sem combinar:** o CNPJ fica preso à loja criada. Usar a Auto Paulista
> para testar o painel e um CNPJ real de uma loja parceira (com autorização dela) só para o teste 2.6.

### 2C. Serviços (risco técnico principal)
| # | Item | Quem | Situação |
|---|---|---|---|
| 2.15 🔴 | **Resend grátis = 100 e-mails/dia, 3.000/mês.** No lançamento pode estourar e os e-mails de login param. Decidir: plano pago (~US$20/mês) **antes** do Dia L, ou acompanhar de perto | 👤 decide · 🤖 confere o uso | ⏳ |
| 2.16 🔴 | **Vercel Pro** (US$20/mês): o grátis não permite uso comercial | 👤 | ⏳ fazer em L-7 |
| 2.17 🟡 | Supabase grátis (500 MB banco, 1 GB fotos, 5 GB tráfego): olhar o Usage 1x por semana no 1º mês; Pro (US$25) quando algo chegar a ~70% | 👤 · 🤖 | ⏳ |
| 2.18 🔴 | **Cópia do banco** antes de apagar os dados de teste (o grátis não guarda backup) | 🤖 · 👤 | ⏳ |
| 2.19 🟢 | Google Search Console sem erros graves | 👤 · 🤖 | ⏳ |
| 2.20 🟢 | Atualizar o Next.js (o `npm audit` aponta falhas) — **depois** do lançamento, com testes | 🤖 | depois |

---

## Etapa 3 — Apps

✅ **Android** na Google Play desde 23/10 e ✅ **iPhone** na App Store desde 29/10. Os apps mostram o site: o que muda
no site chega nos apps na hora, sem revisão.

| # | Item | Quem | Quando |
|---|---|---|---|
| 3.1 🟡 | **Contas do revisor** `revisao@` e `revisao.vencido@`: **não apagar nem mexer**. A Apple e a Google entram com elas em toda versão nova | 👤 | sempre |
| 3.2 🟡 | Capturas de tela com **anúncios reais** nas duas lojas (nova versão do app) | 🤖 · 👤 | depois da Etapa 4 |
| 3.3 🟡 | Pedir às lojas parceiras e testadores uma **avaliação sincera** (pedir pode; brinde em troca de nota ou avaliação falsa é proibido) | 👤 | 1ª semana depois do Dia L |
| 3.4 🟡 | Responder todas as avaliações (App Store Connect e Play Console) | 👤 · 🤖 escreve | sempre |
| 3.5 🟢 | Android 1.0.4: suavizar o "piscar" branco na abertura + avisos do Play Console | 🤖 | depois |
| 3.6 🔴 | Renovar o Apple Developer (US$99/ano) — se vencer, o app sai da loja | 👤 | até 09/10/2027 |

> Dentro dos apps não há cadastro nem compra de planos (regra da Apple). Lojista se cadastra e assina **pelo site**.

---

## Etapa 4 — Lojas e anúncios reais — **o mais importante**

Um site de classificados vazio no dia do lançamento passa a impressão de abandonado, e o comprador não volta.
**Meta mínima para lançar: 10 lojas reais e 150 anúncios reais com fotos.** Meta boa: 20 lojas e 300 anúncios.

| # | Item | Quem | Situação |
|---|---|---|---|
| 4.1 🔴 | Lista das lojas de Teixeira e região | 👤 | ✅ 37 lojas no RD Station |
| 4.2 🔴 | Contato e visita: 60 dias grátis contados do cadastro (Apostilas 1 e 2) | 👤 | ⏳ desde 09/11 |
| 4.3 🔴 | **Cadastro:** o **lojista cadastra sozinho**, no celular dele, com o CNPJ da loja; o Rafael acompanha e tira dúvidas (Apostila 4) | 👤 | ⏳ 0 de 10 |
| 4.4 🟡 | Conferir cada loja (endereço, telefone, CNPJ) e dar o selo **"Loja verificada"** no /admin | 👤 | ⏳ |
| 4.5 🟡 | Logo e capa nas páginas das lojas | 👤 · lojistas | ⏳ |
| 4.6 🟢 | 2–3 lojas no Premium para a vitrine "Ofertas em destaque" ter conteúdo real | 👤 | ⏳ |
| 4.7 🟢 | Post de boas-vindas no Instagram para cada loja nova (com o OK dela) | 👤 · 🤖 arte | ⏳ |

> As lojas reais aparecem para todo mundo assim que entram, e os anúncios de demonstração continuam escondidos do
> público. Dá para cadastrar com calma antes do Dia L.

---

## Etapa 5 — Divulgação preparada (L-7 a L-3)

**Plano completo (tráfego pago, telões, orçamento): `docs/PLANO-MARKETING.md`.**

| # | Item | Quem | Situação |
|---|---|---|---|
| 5.1 🟡 | Instagram e Facebook (perfil, bio com link, posts) | 👤 · 🤖 | ✅ 04/11; posts da semana do lançamento ⏳ |
| 5.2 🟡 | **Perfil da Empresa no Google** (Google Maps) | 👤 | ⏳ |
| 5.3 🟡 | Mensagem de WhatsApp para Status e grupos da região (texto + imagem) | 🤖 · 👤 envia | ⏳ |
| 5.4 🟡 | Lojas divulgam que estão no AutoRegião (página "Divulgar" no painel) | lojistas | pronto no site |
| 5.5 🟢 | Rádio, jornal, blog local, influenciador de carros | 👤 | ⏳ |
| 5.6 🟢 | Vender as vagas de banner do carrossel e do anúncio flutuante (despachantes, financeiras, oficinas, seguros) | 👤 | ⏳ |
| 5.7 🟢 | Campanha paga para lojistas e compradores (definir cidades, verba e forma de pagamento) | 👤 | ⏳ |
| 5.8 🟢 | Distribuir os panfletos dos compradores (só a partir do Dia L) | 👤 | ⏳ |

---

## Etapa 6 — Checagem final ("vai ou não vai") — L-3

Lança no Dia L **só se todos estiverem ✅**:

- [ ] Data fixada (1.6) e decisão fiscal tomada (1.5)
- [ ] Roteiro de testes 2.5 a 2.9 passou no celular e no computador
- [ ] Pagamento real por Pix **e** cartão funcionou (2.8)
- [ ] Resend decidido (2.15) e Vercel Pro ativo (2.16)
- [ ] **10+ lojas reais e 150+ anúncios reais no ar** (Etapa 4)
- [ ] Cópia do banco feita (2.18)

Se faltar algum: nova data, uma semana depois. **Lançar quebrado custa mais que atrasar.**

---

## Etapa 7 — Dia do lançamento

Fazer **de manhã cedo**, nesta ordem (cerca de 1 hora). Eu acompanho cada passo com você.

| Ordem | Passo | Quem |
|---|---|---|
| 1 | Vercel Pro ativo (2.16) e Resend no plano decidido (2.15) | 👤 |
| 2 | Cópia do banco do dia (mesmo passo do 2.18) | 👤 |
| 3 | Decidir o que fica para o revisor da Apple/Google: a loja "Demonstração AutoRegião" (`revisao@`) precisa de uns 3 anúncios, visíveis só para ela | 👤 · 🤖 |
| 4 | **Apagar os dados de demonstração** (SQL que eu preparo e você roda): os 472 anúncios demo, as 30 lojas fictícias, a lista `acesso_demonstracao` e as fotos de `public/demo/` | 🤖 prepara · 👤 roda |
| 5 | Decidir o que fazer com a **Auto Paulista** (loja de teste, Premium até 05/2027): manter só para demonstração nas visitas, sem anúncios públicos, ou desativar | 👤 |
| 6 | Conferir **sem login**, numa aba anônima: página inicial, busca, uma loja, um anúncio. Não pode aparecer nada de teste | 🤖 · 👤 |
| 7 | Fazer 1 cadastro de **comprador/particular** com um e-mail novo e confirmar que o e-mail chega; depois excluir a conta | 👤 |
| 8 | Se decidido (1.7): **abrir o Repasse** no Admin → Lojas | 👤 |
| 9 | **Divulgar:** Instagram, Facebook, WhatsApp, lojas parceiras compartilham, panfletos | 👤 |
| 10 | Ficar de olho a tarde toda: e-mails de "Nova assinatura", contato@, WhatsApp, erros | 👤 · 🤖 |

**Se algo quebrar no dia:** mandar print para o Claude. Para erro no site, a Vercel volta a versão anterior em 1 clique
(Deployments → versão anterior → "Promote to Production"). Eu te guio.

---

## Etapa 8 — Primeiros 30 dias

| Quando | O que olhar | Quem |
|---|---|---|
| Todo dia, 1ª semana | Mensagens no contato@ e no WhatsApp, e-mails de assinatura | 👤 |
| 2x por semana | Uso do Resend e do Supabase (prints para mim) | 👤 · 🤖 |
| Semanal | Lojas sem anúncio novo há 7 dias: ligar e ajudar | 👤 |
| Semanal | Avaliações nas lojas de apps: responder todas | 👤 |
| Dia 1º de cada mês | Relatório mensal enviado às lojas (aba Relatórios no /admin) | 👤 · cron |
| L+30 | Balanço: visitas, contatos por WhatsApp, lojas, assinaturas → ajustar preços e divulgação | 👤 · 🤖 |
| **~53 dias depois do cadastro de cada loja** | Uma semana antes do fim dos 60 dias grátis, ligar com o relatório de contatos e oferecer o plano | 👤 |

> O relatório mensal com os contatos recebidos é o principal argumento para a loja continuar pagando.
> Lembrete do RD Station: registrar cada loja e a data do cadastro para saber quando termina o período grátis.

---

## Depois do lançamento (não bloqueia)
- Refazer os prints das apostilas com a Auto Paulista em Premium (e depois com uma loja real)
- Atualizar o Next.js (falhas do `npm audit`), com testes
- Importar o estoque das lojas por planilha (é o que mais trava lojas grandes)
- Vídeo nos anúncios
- Logo em vetor por um designer + registro da marca no INPI
- Planos pagos para particulares (hoje: avulso)
- Limpeza de fotos de vendidos (quando o Storage passar de ~50%)
- Publicidade por cidade/região, quando o site crescer para outras cidades
