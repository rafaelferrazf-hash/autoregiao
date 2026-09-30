export function formatarPreco(preco: number | null | undefined) {
  if (preco == null) return "Preço a combinar";
  return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

// `km` é texto no banco; converte para número antes de formatar ("110000" → "110.000 km").
export function formatarKm(km: string | number | null | undefined) {
  const n = typeof km === "number" ? km : parseInt(String(km ?? "").replace(/\D/g, ""), 10);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR") + " km";
}

// Preço digitado pelo lojista → reais inteiros. Aceita "53000", "53.000", "53.000,00", "R$ 53.000,50",
// "53000.00". Centavos (vírgula/ponto seguidos de 1–2 dígitos no fim) são descartados — antes eles
// eram grudados no número e "53.000,00" virava 5.300.000.
export function lerPreco(texto: string): number | null {
  const semCentavos = texto.trim().replace(/[.,]\d{1,2}$/, "");
  const n = parseInt(semCentavos.replace(/\D/g, ""), 10);
  return Number.isNaN(n) || n <= 0 ? null : n;
}
