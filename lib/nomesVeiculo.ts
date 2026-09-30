// Deixa os nomes da Tabela FIPE com cara de anúncio (e iguais aos já usados no site, para os
// filtros de marca continuarem funcionando): "GM - Chevrolet" → "Chevrolet",
// "Onix HATCH PREMIER 1.0 12V TB Flex Aut." → "Onix Hatch Premier 1.0 12V TB Flex Aut.".

const MARCAS: Record<string, string> = {
  "gm - chevrolet": "Chevrolet",
  "vw - volkswagen": "Volkswagen",
  "kia motors": "Kia",
  "caoa chery/chery": "Chery",
  "caoa chery": "Chery",
  "caoa changan": "Changan",
};

// Palavras só em maiúsculas com 4+ letras viram "Primeira maiúscula" (siglas curtas como BMW,
// GWM, TB, LXL ficam como estão).
function suavizar(texto: string): string {
  return texto.replace(/\p{L}[\p{L}']*/gu, p =>
    p.length >= 4 && p === p.toUpperCase() ? p[0] + p.slice(1).toLowerCase() : p,
  );
}

export function limparMarca(nome: string): string {
  const conhecido = MARCAS[nome.trim().toLowerCase()];
  if (conhecido) return conhecido;
  const n = suavizar(nome.trim());
  return n === n.toLowerCase() ? n[0].toUpperCase() + n.slice(1) : n; // "smart" → "Smart"
}

export function limparVersao(nomeModeloFipe: string): string {
  return suavizar(nomeModeloFipe.trim()).replace(/\s+/g, " ");
}

// Modelo "curto" usado na busca e em "veículos parecidos": primeira palavra do nome da FIPE,
// ou duas quando a primeira sozinha não diz nada ("Grand Siena", "Range Rover", "Classe C").
const PREFIXOS = new Set(["grand", "range", "new", "nova", "novo", "santa", "space", "town", "great", "land", "model", "classe"]);
export function modeloBase(nomeModeloFipe: string): string {
  const palavras = limparVersao(nomeModeloFipe).split(" ");
  const qtd = PREFIXOS.has(palavras[0]?.toLowerCase()) && palavras[1] ? 2 : 1;
  return palavras.slice(0, qtd).join(" ");
}

// "2014 Flex" → { ano: "2014", combustivel: "Flex" }; "0 km Gasolina" → ano atual.
export function lerAnoFipe(nomeAno: string): { ano: string; combustivel: string } {
  const ano = /^\d{4}/.exec(nomeAno)?.[0] ?? String(new Date().getFullYear());
  const resto = nomeAno.replace(/^(\d{4}|0 km)\s*/i, "").toLowerCase();
  const combustivel =
    resto.includes("flex") ? "Flex"
    : resto.includes("diesel") ? "Diesel"
    : resto.includes("híbrido") || resto.includes("hibrido") ? "Híbrido"
    : resto.includes("elétrico") || resto.includes("eletrico") ? "Elétrico"
    : resto.includes("gasolina") ? "Gasolina"
    : "";
  return { ano, combustivel };
}
