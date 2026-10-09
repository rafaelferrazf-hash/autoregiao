// "Perto de mim": acha, entre as cidades que têm anúncios, a mais próxima do aparelho.
// A localização é usada só no aparelho (nada é enviado ao servidor nem guardado).

// Cidades da região (extremo sul da BA, nordeste de MG e norte do ES), [latitude, longitude] aproximadas.
const COORDENADAS: Record<string, [number, number]> = {
  "teixeira de freitas": [-17.535, -39.742],
  "alcobaca": [-17.519, -39.196],
  "caravelas": [-17.732, -39.266],
  "nova vicosa": [-17.892, -39.372],
  "posto da mata": [-17.95, -39.79],
  "mucuri": [-18.086, -39.551],
  "prado": [-17.341, -39.221],
  "itamaraju": [-17.039, -39.531],
  "medeiros neto": [-17.374, -40.22],
  "itanhem": [-17.164, -40.33],
  "vereda": [-17.218, -40.097],
  "lajedao": [-17.606, -40.338],
  "ibirapua": [-17.683, -40.11],
  "jucurucu": [-16.849, -40.163],
  "eunapolis": [-16.377, -39.58],
  "porto seguro": [-16.449, -39.065],
  "itabela": [-16.574, -39.559],
  "guaratinga": [-16.584, -39.784],
  "santa cruz cabralia": [-16.278, -39.025],
  "belmonte": [-15.863, -38.883],
  "itagimirim": [-16.081, -39.613],
  "nanuque": [-17.839, -40.353],
  "serra dos aimores": [-17.787, -40.247],
  "carlos chagas": [-17.703, -40.766],
  "pedro canario": [-18.3, -39.957],
  "mucurici": [-18.096, -40.519],
  "montanha": [-18.127, -40.363],
  "pinheiros": [-18.414, -40.217],
  "conceicao da barra": [-18.593, -39.732],
  "sao mateus": [-18.716, -39.859],
};

// Nome para mostrar ("Você está em ..."), a partir da chave sem acento.
const NOMES = ["Teixeira de Freitas", "Alcobaça", "Caravelas", "Nova Viçosa", "Posto da Mata", "Mucuri", "Prado", "Itamaraju",
  "Medeiros Neto", "Itanhém", "Vereda", "Lajedão", "Ibirapuã", "Jucuruçu", "Eunápolis", "Porto Seguro", "Itabela", "Guaratinga",
  "Santa Cruz Cabrália", "Belmonte", "Itagimirim", "Nanuque", "Serra dos Aimorés", "Carlos Chagas", "Pedro Canário", "Mucurici",
  "Montanha", "Pinheiros", "Conceição da Barra", "São Mateus"];

// Cidade (da lista da região) onde a pessoa está: a mais próxima, até 35 km. Fora disso, null.
export function cidadeOndeEsta(posicao: [number, number]): string | null {
  let melhor: { nome: string; km: number } | null = null;
  for (const nome of NOMES) {
    const coord = COORDENADAS[normalizar(nome)];
    if (!coord) continue;
    const km = distanciaKm(posicao, coord);
    if (!melhor || km < melhor.km) melhor = { nome, km };
  }
  return melhor && melhor.km <= 35 ? melhor.nome : null;
}

// Mais longe que isso não é "perto": melhor avisar que ainda não há anúncios na região.
export const RAIO_MAXIMO_KM = 150;

// "Teixeira de Freitas - BA", "teixeira de freitas/BA" → "teixeira de freitas".
function normalizar(cidade: string) {
  return cidade
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s*[-/,]\s*(ba|mg|es)\s*$/, "")
    .trim();
}

function distanciaKm([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
  const rad = (g: number) => (g * Math.PI) / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// Entre as cidades com anúncios, a mais próxima da posição (ou null se nenhuma conhecida estiver no raio).
export function cidadeMaisProxima(posicao: [number, number], cidades: string[]): { cidade: string; km: number } | null {
  let melhor: { cidade: string; km: number } | null = null;
  for (const cidade of cidades) {
    const coord = COORDENADAS[normalizar(cidade)];
    if (!coord) continue;
    const km = distanciaKm(posicao, coord);
    if (!melhor || km < melhor.km) melhor = { cidade, km };
  }
  return melhor && melhor.km <= RAIO_MAXIMO_KM ? melhor : null;
}

// Última posição do "Perto de mim", só na memória da aba (some ao fechar; nada é guardado).
// Os cards usam para mostrar "a X km".
let posicaoAtual: [number, number] | null = null;
const ouvintes = new Set<() => void>();
export function ouvirPosicao(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => { ouvintes.delete(ouvinte); };
}
export const lerPosicao = () => posicaoAtual;
export function distanciaAte(cidade: string | null | undefined, posicao: [number, number] | null): number | null {
  const coord = cidade ? COORDENADAS[normalizar(cidade)] : undefined;
  return coord && posicao ? distanciaKm(posicao, coord) : null;
}

// Pede a localização (o aparelho mostra o pedido de permissão na 1ª vez e lembra a resposta).
export function pegarLocalizacao(): Promise<[number, number]> {
  // No app de iPhone a localização do navegador (WKWebView) nunca responde: usa a nativa do iPhone.
  const nativa = localizacaoNativa();
  if (nativa) return nativa.then(guardarPosicao);
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return reject(new Error("indisponivel"));
    // Alguns aparelhos/apps nunca respondem: o botão não pode ficar em "Procurando..." para sempre.
    const tempo = setTimeout(() => reject(new Error("falhou")), 25_000);
    navigator.geolocation.getCurrentPosition(
      p => {
        clearTimeout(tempo);
        resolve(guardarPosicao([p.coords.latitude, p.coords.longitude]));
      },
      e => { clearTimeout(tempo); reject(new Error(e.code === e.PERMISSION_DENIED ? "negada" : "falhou")); },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 },
    );
  });
}

function guardarPosicao(posicao: [number, number]): [number, number] {
  posicaoAtual = posicao;
  ouvintes.forEach(o => o());
  return posicao;
}

// Plugin @capacitor/geolocation do app de iPhone (app-ios/). Ele mesmo pede a permissão.
type PluginLocal = {
  checkPermissions: () => Promise<{ location: string }>;
  requestPermissions: () => Promise<{ location: string }>;
  getCurrentPosition: (o: { enableHighAccuracy?: boolean; timeout?: number; maximumAge?: number }) => Promise<{ coords: { latitude: number; longitude: number } }>;
};
function localizacaoNativa(): Promise<[number, number]> | null {
  if (typeof window === "undefined") return null;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; Plugins?: Record<string, unknown> } }).Capacitor;
  const geo = cap?.isNativePlatform?.() ? (cap.Plugins?.Geolocation as PluginLocal | undefined) : undefined;
  if (!geo) return null;
  return new Promise((resolve, reject) => {
    const tempo = setTimeout(() => reject(new Error("falhou")), 60_000);
    (async () => {
      let permissao = (await geo.checkPermissions()).location;
      if (permissao !== "granted") permissao = (await geo.requestPermissions()).location;
      if (permissao !== "granted") throw new Error("negada");
      const p = await geo.getCurrentPosition({ enableHighAccuracy: false, timeout: 20_000, maximumAge: 10 * 60 * 1000 });
      return [p.coords.latitude, p.coords.longitude] as [number, number];
    })().then(r => { clearTimeout(tempo); resolve(r); }, e => {
      clearTimeout(tempo);
      reject(new Error(/denied|negada|permission/i.test(String((e as Error)?.message)) ? "negada" : "falhou"));
    });
  });
}
