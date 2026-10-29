import { readFile } from "node:fs/promises";
import { join } from "node:path";
import QRCode from "qrcode";
import { formatarKm, formatarPreco } from "@/lib/formatar";

// Artes da página "Divulgar" (geradas no servidor pelo ImageResponse, só flexbox).
// Mesmo visual dos esboços aprovados (docs/kit-lojas-parceiras/_scripts/*.py).

const LAR = "#FF6600", GRA = "#1A1A1A", BRA = "#FFFFFF", CLARO = "#CFCFCF", CIN = "#6B6B6B", VERDE = "#16A34A", AMARELO = "#FFC400";

export type LojaArte = { id: string; nome: string; cidade: string | null; logo_url: string | null; capa_url: string | null };
export type VeiculoArte = {
  id: string; marca: string | null; modelo: string | null; versao: string | null; ano: string | null; km: string | null;
  cambio: string | null; combustivel: string | null; preco: number | null; fotos: string[] | null; condicoes: string[] | null;
  abaixoFipe: boolean;
};

let recursos: Promise<{ fontes: { name: string; data: Buffer; weight: 500 | 700 | 800; style: "normal" }[]; logo: string }> | null = null;

export function carregarRecursos() {
  recursos ??= (async () => {
    const pasta = join(process.cwd(), "assets/fontes");
    const [exo, jak, jakb, svg] = await Promise.all([
      readFile(join(pasta, "Exo2-ExtraBold.ttf")),
      readFile(join(pasta, "PlusJakartaSans-Medium.ttf")),
      readFile(join(pasta, "PlusJakartaSans-Bold.ttf")),
      readFile(join(process.cwd(), "public/marca/logo-horizontal-branco.svg")),
    ]);
    return {
      fontes: [
        { name: "Exo", data: exo, weight: 800, style: "normal" },
        { name: "Jakarta", data: jak, weight: 500, style: "normal" },
        { name: "Jakarta", data: jakb, weight: 700, style: "normal" },
      ],
      logo: "data:image/svg+xml;base64," + svg.toString("base64"),
    };
  })();
  return recursos;
}

export async function qrDataUri(texto: string) {
  const svg = await QRCode.toString(texto, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: GRA, light: BRA } });
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

// Tamanho de letra que cabe na largura (estimativa pela quantidade de letras).
const caber = (texto: string, max: number, largura: number, fator = 0.62) => Math.min(max, Math.floor(largura / Math.max(1, texto.length * fator)));

const abs = (o: Record<string, unknown>) => ({ position: "absolute" as const, display: "flex" as const, ...o });

function SeloLoja({ loja, tamanho }: { loja: LojaArte; tamanho: number }) {
  return (
    <div style={{ display: "flex", width: tamanho, height: tamanho, borderRadius: tamanho, background: BRA, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {loja.logo_url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={loja.logo_url} width={tamanho - 10} height={tamanho - 10} style={{ borderRadius: tamanho, objectFit: "cover" }} alt="" />
        : <div style={{ display: "flex", width: tamanho - 10, height: tamanho - 10, borderRadius: tamanho, background: LAR, color: BRA, alignItems: "center", justifyContent: "center", fontFamily: "Exo", fontSize: tamanho * 0.5 }}>{loja.nome.trim().charAt(0).toUpperCase()}</div>}
    </div>
  );
}

function Chip({ texto, fundo, tam }: { texto: string; fundo: string; tam: number }) {
  return <div style={{ display: "flex", background: fundo, color: BRA, fontFamily: "Jakarta", fontWeight: 700, fontSize: tam, padding: `${tam * 0.4}px ${tam * 0.7}px`, borderRadius: tam * 2 }}>{texto}</div>;
}

function Faixa({ frase, topo, tam }: { frase: string; topo: number; tam: number }) {
  const t = frase.toUpperCase();
  return (
    <div style={abs({ left: -40, top: topo, width: 1160, height: tam * 1.6, background: AMARELO, transform: "rotate(-4deg)", alignItems: "center", justifyContent: "center" })}>
      <div style={{ display: "flex", fontFamily: "Exo", fontSize: caber(t, tam, 900, 0.68), color: GRA }}>{t}</div>
    </div>
  );
}

function Ok({ texto }: { texto: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "Jakarta", fontSize: 32, color: BRA }}>
      <div style={{ display: "flex", width: 34, height: 34, borderRadius: 34, background: LAR, alignItems: "center", justifyContent: "center" }}>
        <svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9" stroke={BRA} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      {texto}
    </div>
  );
}

function linhaDetalhes(v: VeiculoArte) {
  return [v.ano, v.km ? formatarKm(v.km) : null, v.cambio, v.combustivel].filter(Boolean).join(" · ");
}

function versaoCurta(v: VeiculoArte) {
  const versao = (v.versao ?? "").trim();
  return v.modelo && versao.toLowerCase().startsWith(v.modelo.toLowerCase()) ? versao.slice(v.modelo.length).trim() : versao;
}

// ---------- Post de um veículo ----------
export function PostVeiculoStatus({ loja, v, frase, logo }: { loja: LojaArte; v: VeiculoArte; frase: string | null; logo: string }) {
  const titulo = `${v.marca ?? ""} ${v.modelo ?? ""}`.trim().toUpperCase();
  const foto = v.fotos?.[0];
  return (
    <div style={{ display: "flex", position: "relative", width: 1080, height: 1920, background: GRA, fontFamily: "Jakarta" }}>
      <div style={abs({ left: 0, top: 0, width: 1080, height: 12, background: LAR })} />
      <div style={abs({ left: 60, top: 152, alignItems: "center", gap: 26 })}>
        <SeloLoja loja={loja} tamanho={134} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Exo", fontSize: caber(loja.nome, 46, 760), color: BRA }}>{loja.nome}</div>
          {loja.cidade && <div style={{ display: "flex", fontSize: 28, color: CLARO }}>{loja.cidade}</div>}
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {foto && <img src={foto} width={1080} height={760} style={{ position: "absolute", left: 0, top: 330, objectFit: "cover" }} alt="" />}
      {v.abaixoFipe && <div style={abs({ left: 60, top: 360 })}><Chip texto="Abaixo da FIPE" fundo={VERDE} tam={30} /></div>}
      {frase && <Faixa frase={frase} topo={950} tam={76} />}
      <div style={abs({ left: 60, top: 1120, width: 960, flexDirection: "column" })}>
        <div style={{ display: "flex", fontFamily: "Exo", fontSize: caber(titulo, 84, 960, 0.66), color: BRA }}>{titulo}</div>
        {versaoCurta(v) && <div style={{ display: "flex", fontSize: 34, color: CLARO, marginTop: 4 }}>{versaoCurta(v)}</div>}
        <div style={{ display: "flex", fontSize: 34, color: CLARO, marginTop: 8 }}>{linhaDetalhes(v)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 34 }}>
          {(v.condicoes ?? []).slice(0, 3).map(c => <Ok key={c} texto={c} />)}
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} width={260} height={32} style={{ position: "absolute", right: 60, top: 1530 }} alt="" />
      <div style={abs({ left: 0, top: 1590, width: 1080, height: 330, background: LAR, flexDirection: "column", padding: "34px 60px" })}>
        <div style={{ display: "flex", fontFamily: "Exo", fontSize: 110, color: GRA, lineHeight: 1 }}>{formatarPreco(v.preco)}</div>
        <div style={{ display: "flex", fontWeight: 700, fontSize: 34, color: GRA, marginTop: 26 }}>Chame a gente no WhatsApp ou veja no</div>
        <div style={{ display: "flex", fontFamily: "Exo", fontSize: 52, color: GRA, marginTop: 4 }}>autoregiao.com.br</div>
      </div>
    </div>
  );
}

export function PostVeiculoFeed({ loja, v, frase, logo }: { loja: LojaArte; v: VeiculoArte; frase: string | null; logo: string }) {
  const titulo = `${v.marca ?? ""} ${v.modelo ?? ""}`.trim().toUpperCase();
  const foto = v.fotos?.[0];
  return (
    <div style={{ display: "flex", position: "relative", width: 1080, height: 1350, background: GRA, fontFamily: "Jakarta" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {foto && <img src={foto} width={1080} height={820} style={{ position: "absolute", left: 0, top: 0, objectFit: "cover" }} alt="" />}
      <div style={abs({ left: 0, top: 0, width: 1080, height: 150, background: "rgba(26,26,26,0.72)", alignItems: "center", padding: "0 50px", justifyContent: "space-between" })}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <SeloLoja loja={loja} tamanho={100} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontFamily: "Exo", fontSize: caber(loja.nome, 36, 520), color: BRA }}>{loja.nome}</div>
            {loja.cidade && <div style={{ display: "flex", fontSize: 25, color: CLARO }}>{loja.cidade}</div>}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={230} height={29} alt="" />
      </div>
      {v.abaixoFipe && <div style={abs({ left: 50, top: 180 })}><Chip texto="Abaixo da FIPE" fundo={VERDE} tam={28} /></div>}
      {frase && <Faixa frase={frase} topo={690} tam={64} />}
      <div style={abs({ left: 50, top: 845, width: 980, flexDirection: "column" })}>
        <div style={{ display: "flex", fontFamily: "Exo", fontSize: caber(titulo, 66, 980, 0.66), color: BRA }}>{titulo}</div>
        <div style={{ display: "flex", fontSize: 30, color: CLARO, marginTop: 6 }}>{linhaDetalhes(v)}</div>
        <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
          {(v.condicoes ?? []).slice(0, 3).map(c => <Chip key={c} texto={c} fundo="#2E2E2E" tam={24} />)}
        </div>
      </div>
      <div style={abs({ left: 0, top: 1150, width: 1080, height: 200, background: LAR, alignItems: "center", justifyContent: "space-between", padding: "0 50px" })}>
        <div style={{ display: "flex", fontFamily: "Exo", fontSize: 92, color: GRA }}>{formatarPreco(v.preco)}</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ display: "flex", fontWeight: 700, fontSize: 30, color: GRA }}>Veja no</div>
          <div style={{ display: "flex", fontFamily: "Exo", fontSize: 40, color: GRA }}>autoregiao.com.br</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Kit da loja ----------
function FundoCapa({ loja, altura }: { loja: LojaArte; altura: number }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {loja.capa_url && <img src={loja.capa_url} width={1080} height={altura} style={{ position: "absolute", left: 0, top: 0, objectFit: "cover" }} alt="" />}
      <div style={abs({ left: 0, top: 0, width: 1080, height: altura, backgroundImage: `linear-gradient(180deg, rgba(26,26,26,0.55) 0%, rgba(26,26,26,0.7) 55%, ${GRA} 100%)` })} />
    </>
  );
}

export function KitStatus({ loja, qr, logo }: { loja: LojaArte; qr: string; logo: string }) {
  return (
    <div style={{ display: "flex", position: "relative", width: 1080, height: 1920, background: GRA, fontFamily: "Jakarta" }}>
      <FundoCapa loja={loja} altura={1150} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} width={340} height={42} style={{ position: "absolute", left: 370, top: 170 }} alt="" />
      <div style={abs({ left: 0, top: 400, width: 1080, flexDirection: "column", alignItems: "center" })}>
        <SeloLoja loja={loja} tamanho={320} />
        <div style={{ display: "flex", fontFamily: "Exo", fontSize: caber(loja.nome, 84, 920), color: BRA, marginTop: 30 }}>{loja.nome}</div>
        {loja.cidade && <div style={{ display: "flex", fontSize: 40, color: CLARO }}>{loja.cidade}</div>}
        <div style={{ display: "flex", fontFamily: "Exo", fontSize: 76, color: BRA, marginTop: 70 }}>Nossos carros também</div>
        <div style={{ display: "flex", fontFamily: "Exo", fontSize: 76, color: BRA }}>estão no&nbsp;<span style={{ color: LAR }}>AutoRegião</span></div>
      </div>
      <div style={abs({ left: 90, top: 1240, width: 900, height: 470, background: BRA, borderRadius: 28, alignItems: "center", padding: "0 50px", gap: 50 })}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} width={370} height={370} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontWeight: 700, fontSize: 46, color: GRA }}>Veja todo o</div>
          <div style={{ display: "flex", fontWeight: 700, fontSize: 46, color: GRA }}>nosso estoque</div>
          <div style={{ display: "flex", fontSize: 36, color: CIN, marginTop: 24, width: 360 }}>Fotos, preços e contato direto no WhatsApp.</div>
        </div>
      </div>
      <div style={abs({ left: 0, top: 1770, width: 1080, justifyContent: "center", fontFamily: "Exo", fontSize: 56, color: LAR })}>autoregiao.com.br</div>
    </div>
  );
}

export function KitFeed({ loja, qr, logo }: { loja: LojaArte; qr: string; logo: string }) {
  return (
    <div style={{ display: "flex", position: "relative", width: 1080, height: 1080, background: GRA, fontFamily: "Jakarta" }}>
      <FundoCapa loja={loja} altura={1080} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} width={260} height={32} style={{ position: "absolute", left: 70, top: 80 }} alt="" />
      <div style={abs({ left: 70, top: 260, alignItems: "center", gap: 30 })}>
        <SeloLoja loja={loja} tamanho={200} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Exo", fontSize: caber(loja.nome, 64, 680), color: BRA }}>{loja.nome}</div>
          {loja.cidade && <div style={{ display: "flex", fontSize: 34, color: CLARO }}>{loja.cidade}</div>}
        </div>
      </div>
      <div style={abs({ left: 70, top: 530, flexDirection: "column" })}>
        <div style={{ display: "flex", fontFamily: "Exo", fontSize: 70, color: BRA }}>Nossos carros também</div>
        <div style={{ display: "flex", fontFamily: "Exo", fontSize: 70, color: BRA }}>estão no&nbsp;<span style={{ color: LAR }}>AutoRegião</span></div>
        <div style={{ display: "flex", fontSize: 34, color: CLARO, marginTop: 16 }}>Fotos, preços e contato direto no WhatsApp.</div>
      </div>
      <div style={abs({ left: 0, top: 830, width: 1080, height: 250, background: LAR, alignItems: "center", justifyContent: "space-between", padding: "0 70px" })}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontWeight: 700, fontSize: 40, color: GRA }}>Veja o estoque:</div>
          <div style={{ display: "flex", fontFamily: "Exo", fontSize: 58, color: GRA }}>autoregiao.com.br</div>
        </div>
        <div style={{ display: "flex", background: BRA, padding: 22, borderRadius: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} width={186} height={186} alt="" />
        </div>
      </div>
    </div>
  );
}

// Cartaz A4 em pé (1240×1754 = 150 dpi) para imprimir e deixar no balcão.
export function KitCartaz({ loja, qr, logo }: { loja: LojaArte; qr: string; logo: string }) {
  return (
    <div style={{ display: "flex", position: "relative", width: 1240, height: 1754, background: BRA, fontFamily: "Jakarta" }}>
      <div style={abs({ left: 0, top: 0, width: 1240, height: 366, background: GRA, alignItems: "center", justifyContent: "center" })}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={720} height={90} alt="" />
      </div>
      <div style={abs({ left: 0, top: 440, width: 1240, flexDirection: "column", alignItems: "center" })}>
        <div style={{ display: "flex", fontFamily: "Exo", fontSize: 76, color: GRA }}>Veja todo o nosso estoque</div>
        <div style={{ display: "flex", fontFamily: "Exo", fontSize: 76, color: LAR }}>no seu celular</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} width={530} height={530} style={{ marginTop: 60 }} alt="" />
        <div style={{ display: "flex", fontSize: 31, color: CIN, marginTop: 40 }}>Aponte a câmera do celular para o código</div>
        <div style={{ display: "flex", fontFamily: "Exo", fontSize: caber(loja.nome, 66, 1000), color: GRA, marginTop: 60 }}>{loja.nome}</div>
      </div>
      <div style={abs({ left: 0, top: 1624, width: 1240, height: 130, background: LAR, alignItems: "center", justifyContent: "center", fontFamily: "Exo", fontSize: 48, color: GRA })}>autoregiao.com.br</div>
    </div>
  );
}
