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
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return reject(new Error("indisponivel"));
    navigator.geolocation.getCurrentPosition(
      p => {
        posicaoAtual = [p.coords.latitude, p.coords.longitude];
        ouvintes.forEach(o => o());
        resolve(posicaoAtual);
      },
      e => reject(new Error(e.code === e.PERMISSION_DENIED ? "negada" : "falhou")),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 },
    );
  });
}
