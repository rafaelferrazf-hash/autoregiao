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
