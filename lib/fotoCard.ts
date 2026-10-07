// Versão pequena da foto, própria para os cards (800 px, ~90 KB), gravada ao lado da foto grande
// no envio do anúncio: "…/123-abc.jpg" → "…/123-abc-card.jpg". A página do anúncio usa a grande.
// Fotos antigas não têm versão do card: o componente FotoCard volta para a grande se não achar.

const NO_STORAGE = "/object/public/veiculos/";

export function urlFotoCard(url: string): string {
  if (url.includes(NO_STORAGE) || url.includes("/demo/")) return url.replace(/(\.[a-z0-9]+)?(\?.*)?$/i, "-card.jpg");
  return url;
}
