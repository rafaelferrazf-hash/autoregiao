# AutoRegião — estado do projeto

Leia isto no começo de cada conversa. Atualize ao terminar uma etapa (seção "Histórico" e "Pendências").
Última atualização: 01/10/2026.

## O que é
Classificados de veículos (carros, motos, utilitários) de lojas e particulares de uma região.
Dono: **Rafael Ferraz** (Teixeira de Freitas/BA). Site: **https://www.autoregiao.com.br**.
O site está no ar e público, mas **o lançamento oficial para clientes só acontece quando tudo
estiver funcionando perfeitamente** (inclusive pagamentos reais e app na Google Play).

## Como trabalhar com o Rafael
- Ele não é programador: explicar em português simples, passo a passo, com o nome exato dos
  botões. Ele manda prints; pedir para **cobrir chaves, senhas, códigos e QR codes**.
- Fluxo: auditar → propor → ele aprova → executar. Correções pequenas e óbvias podem ser feitas direto.
- **Nunca** pedir nem aceitar chaves/senhas no chat; ele cola chaves direto na Vercel / `.env.local`.
- Eu não digito senhas nem dados de cartão em sites de terceiros.
- **Uma conversa trabalhando no código por vez** (conversas paralelas podem se atrapalhar).
- Antes de publicar: `npx tsc --noEmit`, `npm run build`, testar no navegador (preview
  `autoregiao-prod-local` em `.claude/launch.json`, porta 3000, `npm run start` após o build).
- Publicar = `git push` na `master` → Vercel publica sozinha em ~1–2 min.
- SQL: eu escrevo em `supabase/faseN-*.sql`; **o Rafael roda no SQL Editor do Supabase**.
  Se o código novo depende de coluna nova, **não publicar antes de ele rodar o SQL**.
- Commits: mensagem via `git commit -F -` com heredoc; terminar com a linha Co-Authored-By.
- Next.js 16 (ver `AGENTS.md`): `proxy.ts` no lugar de middleware, `params` é Promise,
  `useSearchParams` exige Suspense, regras de lint do React (sem setState síncrono em efeito).

## Contas e serviços (sem segredos aqui)
| Serviço | Uso | Conta |
|---|---|---|
| Vercel (Hobby) | hospedagem, cron diário 12:00 UTC (`/api/keepalive`), variáveis | rafaelferrazf@hotmail.com (GitHub `rafaelferrazf-hash/autoregiao`) |
| Supabase | banco, login, fotos (Storage) | — |
| Registro.br | domínio autoregiao.com.br (DNS avançado, servidores a.sec.dns.br / c.sec.dns.br) | — |
| Resend (região SP) | envio de e-mails (Auth do Supabase via SMTP + alertas do site) | rafaelferrazf05@gmail.com |
| ImprovMX | recebe *@autoregiao.com.br → rafaelferrazf05@gmail.com (pega-tudo) | rafaelferrazf05@gmail.com |
| Gmail | responde como contato@ ("Enviar e-mail como", SMTP Resend) | rafaelferrazf05@gmail.com |
| Mercado Pago | Checkout Pro dos planos — **ainda com chave de TESTE** | rafaelferrazf@hotmail.com |
| Google Search Console | propriedade de domínio verificada por TXT; sitemap enviado | rafaelferrazf05@gmail.com |
- **Admin único do site:** rafaelferrazf05@gmail.com (`NEXT_PUBLIC_ADMIN_EMAILS`). Conta de admin é só admin.
- **Lojista de teste:** rafaelferrazf@hotmail.com → loja "Auto Paulista" (plano vitalício), 2 anúncios (Civic, Onix).
- 2FA ligado em: Gmail, Registro.br, Vercel, Hotmail, GitHub. Falta: Supabase, Mercado Pago.
- Variáveis (Vercel + `.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_KEY`, `NEXT_PUBLIC_ADMIN_EMAILS`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `RESEND_API_KEY`.

## Mapa do código (principal)
- `lib/`: `supabase*.ts` (clientes), `busca.ts` (filtros, `aplicarFiltros`, `descreverFiltros`),
  `planos.ts`, `mercadopago.ts`, `alertas.ts`, `email.ts`, `fipe.ts` (API Parallelum v2 + cache),
  `nomesVeiculo.ts` (limpeza de nomes FIPE, `slug`), `vitrines.ts` (páginas /carros...),
  `favoritos.ts` (localStorage), `formatar.ts` (`lerPreco` descarta centavos), `dados/*`.
- `components/`: `CartaoVeiculo` (card único + selo FIPE), `BotaoFavorito`, `CriarAlerta`,
  `SeletorFipe` (cadastro do anúncio), `PaginaVitrine`, `Rodape`, `AppInstalavel` (PWA), `BotoesConta`.
- Páginas: `/`, `/veiculos` (busca), `/veiculo/[id]` (servidor + `VeiculoCliente`), `/carros|motos|utilitarios/[[...filtro]]`,
  `/loja/[id]`, `/favoritos`, `/alerta`, `/anunciar`, `/painel` (+ `/novo-anuncio`, `/planos`), `/admin`,
  `/login`, `/cadastro`, `/recuperar-senha`, `/redefinir-senha`, `/pagamento/retorno`, `/termos`, `/privacidade`, `/offline`.
- SQL já rodado: `rls-fase0`, `fase1-seguranca`, `fase2`, `fase3`, `fase3-fotos`, `fase4a`, `fase4b`,
  `fase5-alertas`, `fase6-fipe`, `fase7-filtros`. Modelos de e-mail do Auth: `supabase/emails/`.

## Regras de negócio importantes
- Planos (`lib/planos.ts`): básico R$89/10 anúncios, profissional R$159/30 + destaque, premium R$299/ilimitado + destaque;
  períodos 1/3(-5%)/6(-10%) meses; 60 dias grátis; 3 dias de carência; particular: 1 anúncio grátis.
- Triggers no banco: loja criada no cadastro, vínculo anúncio→loja, regras/limites do anúncio,
  destaque pelo plano, **valor da FIPE só gravado pelo servidor** (`proteger_valor_fipe`), `abaixo_fipe` calculada.
- FIPE: selo "Abaixo da FIPE" **só quando o preço é menor**; acima da FIPE nunca aparece ao comprador
  (o lojista vê no painel). Cadastro do anúncio usa a FIPE como base (com opção manual).
- Alertas: confirmação por e-mail (botão na página, por causa do pré-clique do Outlook), 1 e-mail/dia no cron.
- Pagamentos: webhook MP + reconciliação diária; assinatura do webhook só gera alerta no log.

## Histórico (resumo)
- Fases 0–4: segurança/RLS, dados reais, busca/filtros, painel, admin, planos e pagamento (teste).
- Domínio, e-mail próprio (Resend + ImprovMX + Gmail como contato@), modelos de e-mail em português.
- Fonte Plus Jakarta Sans; página 404; alertas por e-mail.
- Auditoria do concorrente CarroSP → favoritos, veículos parecidos, itens de confiança, FIPE, SEO
  (anúncio renderizado no servidor, JSON-LD, vitrines, sitemap/robots), filtros FIPE e loja/particular.
- 2FA nas contas principais. App instalável (PWA), arrastar fotos, revisão de celular (375/320px).
- Marca nova (01/10/2026), do manual em `C:\Users\rafae\AutoRegiao-Logo-Novo` (só PNG, sem vetor): logo AR, laranja
  #FF6600, grafite #1A1A1A, Exo 2 nos títulos (h1–h3). Slogan trocado para "COMPRE | VENDA | ANUNCIE" (o manual
  dizia "financia", que o site não faz). Peças em `public/marca/` e `public/icones/`; `components/Logo`.
  Para impressão grande (fachada, adesivo), pedir ao designer o arquivo vetorial.
  O logo foi **gerado com IA** (confirmado pelo Rafael): na Google Play, ícone e banner rotulados como "criados com IA"
  (capturas de tela não). Sugestão pendente: redesenho em vetor por designer e registro da marca no INPI.

## Pendências (em ordem sugerida)
1. **App na Google Play (TWA)** — em andamento:
   - ✅ Conta de desenvolvedor criada (pessoal, nome público "AutoRegião", e-mail público contato@, taxa paga;
     perfil de pagamentos com o nome legal completo **Rafael Ferraz Barbosa**, igual ao documento).
   - ✅ Verificações do Play Console concluídas (identidade, dispositivo Android, telefone) em 01/10/2026.
   - ✅ App criado no Play Console: "AutoRegião: Carros da Região", pacote `br.com.autoregiao.app`, grátis, pt-BR.
   - Configuração do app ("Termine de configurar seu app"): ✅ Política de privacidade (/privacidade, atualizada
     para cobrir app/alertas/favoritos/Resend); ✅ Detalhes do login (conta demo `revisao@autoregiao.com.br`,
     loja "Demonstração AutoRegião" em plano premium até 01/10/2027 — senha só com o Rafael; instruções PT/EN;
     desativar a loja depois da aprovação). ⏳ Próximas: Anúncios (Não) ✅, Classificação de conteúdo, Público-alvo
     (18+), Segurança dos dados, Apps governamentais (Não), Recursos financeiros (nenhum), Saúde (Não), Categoria
     e contato, Ficha da loja (✅ textos, ícone, banner e 5 capturas enviados em 02/10) — respostas em `docs/google-play-ficha.md`.
   - ⚠️ **Antes de pedir produção:** verificar a política de pagamentos do Google Play para a assinatura dos planos
     das lojas (Mercado Pago dentro do app/TWA). Se necessário, esconder a compra de planos no app Android
     (lojista assina pelo site). Questionário IARC respondido como "sem compra de itens digitais".
   - ✅ 02/10/2026: todas as 11 tarefas de configuração concluídas; faixa "Teste fechado - Alpha" com país Brasil,
     testadores = Grupo do Google `testadores-autoregiao@googlegroups.com` (qualquer pessoa pode entrar; só
     proprietário posta/vê membros), feedback contato@; versão 1.0.2 (código 3) **enviada para revisão do Google**.
     Link de participação aparece na aba Testadores depois da aprovação. Os 14 dias contam a partir daí.
   - ✅ assetlinks.json com 3 impressões SHA-256 (chave do Google em uso 26:2D:E7…, chave anterior clássica
     1F:FE:49…, chave de envio B3:AA:21…) — verificado "linked: true" na API do Google.
   - Próxima versão do app: subir `appVersionCode` para 4 no `gerar.cjs` (o campo do nome é `appVersion`).
   - Testadores: usar Grupo do Google (groups.google.com) em vez de lista de e-mails; mandar 15–16 convites.
   - Teste no celular do Rafael com o .apk funcionou (abertura nova aprovada: opção B, grafite + logo completo).
   - ✅ Pacote gerado: projeto em `C:\Users\rafae\autoregiao-android` (Bubblewrap core, `br.com.autoregiao.app`,
     targetSdk 36, versão 1.0.2/3: logo novo, abertura em grafite com o logo completo — gerador em `android-ferramentas\gerador\gerar.cjs`; ele também troca a imagem da abertura). Arquivos assinados em `...\autoregiao-android\publicar\` (`.aab` para a loja,
     `.apk` para testar). Ferramentas (JDK 17, Android SDK) em `C:\Users\rafae\android-ferramentas`
     (o `sdkmanager`/`android.exe` é bloqueado pelo Controle Inteligente de Aplicativos do Windows — o Gradle baixa
     o SDK sozinho; NÃO desligar essa proteção). Montar: `gradlew.bat bundleRelease assembleRelease` com
     JAVA_HOME/ANDROID_HOME apontando para essas pastas; assinar com jarsigner (aab) e zipalign+apksigner (apk).
   - Chave de envio: `android-ferramentas\chave\autoregiao-upload.jks` (alias `autoregiao`). Senha guardada pelo
     Rafael no Gerenciador de Senhas do Google ("play.google.com / autoregiao - chave do app"); cópia do .jks no
     Google Drive dele. Para assinar daqui, a senha está criptografada (DPAPI, só abre no usuário do Windows dele)
     em `android-ferramentas\chave\senha-protegida.dpapi`: em PowerShell,
     `[System.Net.NetworkCredential]::new("", (Get-Content <arquivo> | ConvertTo-SecureString)).Password`
     → pôr em `$env:KS_SENHA` e usar `-storepass:env KS_SENHA` / `--ks-pass env:KS_SENHA`. Nunca exibir a senha. SHA-256 `B3:AA:21:8C:...:7E:8C:0C` já em `public/.well-known/assetlinks.json`
     (validado pela API do Google). **Depois do 1º envio, acrescentar a impressão digital da chave de assinatura
     do Google Play** (Play Console → Integridade do app) no assetlinks.json.
   - Textos da ficha e respostas dos questionários: `docs/google-play-ficha.md`. Imagem de destaque 1024×500 e ícone 512
     já em `autoregiao-android\publicar\`. Capturas de tela (5, 1080×1920, com moldura) também lá — refazer com anúncios reais antes do lançamento.
   - Depois: teste fechado com **12+ testadores por 14 dias** → solicitar acesso à produção.
2. **Mercado Pago em produção** — trocar `MP_ACCESS_TOKEN`/`MP_WEBHOOK_SECRET` pelos de produção,
   configurar webhook de produção, pagamento real de R$89 e estorno.
3. 2FA no Supabase e no Mercado Pago.
4. Antes do lançamento: trocar os anúncios de teste por reais; revisar textos de /termos e /privacidade.
5. Futuro: App Store (US$99/ano), notificações push, planos pagos para particulares.
