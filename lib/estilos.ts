// "Busque pelo seu estilo": páginas prontas (/carros/primeiro-carro, /carros/familia...) e filtro ?estilo=.
// As regras ficam em aplicarFiltros (lib/busca.ts).
export const ESTILOS = {
  "primeiro-carro": { nome: "Primeiro carro", resumo: "Hatch até R$ 60 mil: barato, econômico e fácil de manter", icone: "carro" },
  familia: { nome: "Para a família", resumo: "SUV, sedã, minivan e perua: mais espaço e conforto", icone: "usuarios" },
  economicos: { nome: "Econômicos", resumo: "Motor 1.0: gasta pouco no dia a dia", icone: "combustivel" },
  trabalho: { nome: "Para trabalho", resumo: "Picapes, vans e furgões", icone: "utilitario" },
  "4x4": { nome: "4x4 / fora de estrada", resumo: "Tração nas quatro rodas para estrada de chão", icone: "km" },
} as const;

export type Estilo = keyof typeof ESTILOS;
export const ehEstilo = (s: string | null | undefined): s is Estilo => !!s && s in ESTILOS;
