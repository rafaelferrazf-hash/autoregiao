// Tipo de carroceria do anúncio (coluna veiculos.carroceria — supabase/fase12-carroceria.sql).
// Vale para carros e utilitários; moto não tem.

export const CARROCERIAS = {
  carro: ["Hatch", "Sedã", "SUV", "Picape", "Minivan", "Perua", "Cupê", "Conversível"],
  utilitario: ["Picape", "Van", "Furgão", "Caminhão"],
} as const;

export const TODAS_CARROCERIAS = [...new Set([...CARROCERIAS.carro, ...CARROCERIAS.utilitario])];

// Endereço das vitrines: /carros/suv, /carros/seda, /utilitarios/van...
export const slugCarroceria = (c: string) => c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const carroceriaDoSlug = (s: string) => TODAS_CARROCERIAS.find(c => slugCarroceria(c) === s) ?? null;
export const pluralCarroceria = (c: string) =>
  ({ Hatch: "Hatches", Sedã: "Sedãs", SUV: "SUVs", Picape: "Picapes", Minivan: "Minivans", Perua: "Peruas", Cupê: "Cupês",
     Conversível: "Conversíveis", Van: "Vans", Furgão: "Furgões", Caminhão: "Caminhões" } as Record<string, string>)[c] ?? c;

const PICAPES = /\b(hilux|s10|s-10|strada|toro|ranger|saveiro|montana|amarok|frontier|l200|l-200|triton|maverick|rampage|oroch|f-?250|f-?1000|ram|tacoma|titano|tundra|silverado|d-?20|courier|hoggar)\b/;
const SUVS = /\b(compass|renegade|commander|creta|kicks|t-?cross|nivus|taos|tiguan|touareg|hr-?v|wr-?v|cr-?v|zr-?v|tracker|equinox|trailblazer|captiva|ecosport|territory|bronco|duster|captur|koleos|kardian|tucson|ix35|santa fe|sportage|sorento|seltos|stonic|niro|rav4|corolla cross|sw4|yaris cross|pajero|outlander|asx|eclipse cross|pulse|fastback|2008|3008|5008|c4 cactus|aircross|c5 aircross|basalt|x1|x2|x3|x4|x5|x6|q3|q5|q7|q8|gla|glb|glc|gle|xc40|xc60|xc90|evoque|velar|discovery|defender|forester|outback|xv|jimny|vitara|grand vitara|tiggo|haval|song|yuan|dolphin plus|t40|tera)\b/;
const VANS = /\b(sprinter|master|ducato|daily|transit|boxer|jumper|kombi|h-?100|hr|bongo|expert|jumpy|trafic|vito|iveco)\b/;
const MINIVANS = /\b(spin|zafira|meriva|idea|livina|grand livina|picasso|xsara picasso|c4 picasso|doblo|doblò|carnival|sharan|touran)\b/;
const PERUAS = /\b(weekend|parati|spacefox|space fox|sw|variant|quantum|ipanema|caravan|fielder|palio adventure)\b/;

// Palpite pelo nome do modelo na FIPE ("Onix SED. Plus", "Hilux CD", "Compass Longitude"...).
// O lojista confere e pode trocar; quando não dá para saber, devolve "".
export function adivinharCarroceria(tipo: string, nomeModelo: string): string {
  if (tipo === "moto") return "";
  const n = ` ${nomeModelo.toLowerCase()} `;
  if (/\b(conversivel|conversível|cabrio|roadster|spider|spyder)\b/.test(n)) return tipo === "carro" ? "Conversível" : "";
  if (PICAPES.test(n) || /\b(cab\.? ?dupla|cd|cs|ce|cab\.? ?simples)\b/.test(n) && /\b(4x4|4x2|diesel)\b/.test(n)) return "Picape";
  if (tipo === "utilitario") {
    if (/\bfurg(ã|a)o\b|\bcargo\b/.test(n)) return "Furgão";
    if (VANS.test(n)) return "Van";
    if (/\b(caminh(ã|a)o|accelo|delivery|cargo truck|vuc)\b/.test(n)) return "Caminhão";
    return "";
  }
  if (SUVS.test(n)) return "SUV";
  if (MINIVANS.test(n)) return "Minivan";
  if (PERUAS.test(n)) return "Perua";
  if (/\b(sed\.?|sedan|sedã|plus|virtus|voyage|prisma|cobalt|versa|city|logan|cronos|grand siena|siena|corolla|civic|sentra|jetta|cruze|hb20s|yaris sedan|accord|camry|fusion|focus sedan|c4 lounge|408|cerato|elantra|a3 sedan|a4|a6|série 3|serie 3|320i|c ?180|c ?200|c ?300|s60|s90)\b/.test(n)) return "Sedã";
  if (/\b(cup(ê|e)|coupe|coupé|86|gr86|brz|mustang|camaro|tt)\b/.test(n)) return "Cupê";
  if (/\b(hatch|onix|hb20|gol|polo|up!?|mobi|argo|uno|palio|ka|fiesta|sandero|kwid|march|etios|yaris|fit|celta|corsa|clio|208|207|c3|i30|golf|fox|picanto|swift|tiida|punto|bravo|agile|camaro)\b/.test(n)) return "Hatch";
  return "";
}
