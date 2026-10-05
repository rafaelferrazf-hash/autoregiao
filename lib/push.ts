import { connect } from "node:http2";
import { createPrivateKey, sign } from "node:crypto";

// Notificações no iPhone pelo serviço da Apple (APNs), direto do servidor, sem intermediários.
// Variáveis (Vercel): APNS_CHAVE_P8 (conteúdo do arquivo .p8), APNS_CHAVE_ID, APNS_TIME_ID.
// Sem elas, nada é enviado (pushConfigurado() = false).

const TOPICO = "br.com.autoregiao.app";
const SERVIDOR = "https://api.push.apple.com"; // produção (vale também para o TestFlight)

export const pushConfigurado = () =>
  !!(process.env.APNS_CHAVE_P8 && process.env.APNS_CHAVE_ID && process.env.APNS_TIME_ID);

let jwtGuardado: { valor: string; em: number } | null = null;
function jwtApns(): string {
  // A Apple aceita o mesmo token por até 1 hora; renovamos a cada 50 minutos.
  if (jwtGuardado && Date.now() - jwtGuardado.em < 50 * 60_000) return jwtGuardado.valor;
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const corpo = `${b64({ alg: "ES256", kid: process.env.APNS_CHAVE_ID })}.${b64({ iss: process.env.APNS_TIME_ID, iat: Math.floor(Date.now() / 1000) })}`;
  const chave = createPrivateKey((process.env.APNS_CHAVE_P8 as string).replace(/\n/g, "\n"));
  const assinatura = sign("sha256", Buffer.from(corpo), { key: chave, dsaEncoding: "ieee-p1363" }).toString("base64url");
  jwtGuardado = { valor: `${corpo}.${assinatura}`, em: Date.now() };
  return jwtGuardado.valor;
}

export type Notificacao = { token: string; titulo: string; texto: string; url: string };
// "invalido": o aparelho não recebe mais (app apagado / notificações revogadas) — cancelar os alertas dele.
export type ResultadoPush = "ok" | "invalido" | "erro";

export async function enviarPushes(lista: Notificacao[]): Promise<ResultadoPush[]> {
  if (!lista.length || !pushConfigurado()) return lista.map(() => "erro");
  const sessao = connect(SERVIDOR);
  sessao.on("error", () => {});
  try {
    const jwt = jwtApns();
    return await Promise.all(lista.map(n => new Promise<ResultadoPush>(resolve => {
      const req = sessao.request({
        ":method": "POST",
        ":path": `/3/device/${n.token}`,
        authorization: `bearer ${jwt}`,
        "apns-topic": TOPICO,
        "apns-push-type": "alert",
        "apns-priority": "10",
        "content-type": "application/json",
      });
      let status = 0, resposta = "";
      req.setEncoding("utf8");
      req.on("response", h => { status = Number(h[":status"]); });
      req.on("data", d => { resposta += d; });
      req.on("end", () => {
        if (status === 200) return resolve("ok");
        if (status === 410 || /BadDeviceToken|Unregistered|DeviceTokenNotForTopic/.test(resposta)) return resolve("invalido");
        console.error("push:", status, resposta);
        resolve("erro");
      });
      req.on("error", () => resolve("erro"));
      req.setTimeout(10_000, () => { req.close(); resolve("erro"); });
      req.end(JSON.stringify({ aps: { alert: { title: n.titulo, body: n.texto }, sound: "default" }, url: n.url }));
    })));
  } finally {
    sessao.close();
  }
}
