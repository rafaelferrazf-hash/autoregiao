# App de iPhone do AutoRegião

Mesmo modelo do app Android: o app abre o site `https://www.autoregiao.com.br/?origem=app`, com recursos
nativos por cima (Capacitor 8):

- **Avisos no celular** dos alertas de veículos (APNs, enviados pelo cron do site — `lib/push.ts`);
- **Compartilhar** pelo menu do iPhone (`lib/nativo.ts`);
- **Tela sem internet** própria (`www/offline.html`);
- user agent com `AutoRegiaoApp` → o site esconde a compra de planos (`lib/appLoja.ts`);
- "Excluir minha conta" no Perfil da Loja (exigência da Apple).

Pacote: `br.com.autoregiao.app`, só iPhone, retrato, pt-BR.

## Montar
Não dá para montar app de iPhone no Windows: o Codemagic (Mac na nuvem) monta e manda ao TestFlight
usando `codemagic.yaml` (na raiz do repositório).

Mudou ícone/abertura? Trocar `assets/icon-only.png` (1024, sem transparência) e `assets/splash*.png`
(2732) e rodar `npm run icones`. Mudou plugin/config? `npx cap sync ios` e fazer commit da pasta `ios/`.
