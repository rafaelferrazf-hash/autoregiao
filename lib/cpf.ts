import { createHmac } from "node:crypto";

// CPF do anúncio grátis de particular (supabase/fase24). Só no servidor.
// O número nunca é guardado: vira um "embaralhado" (HMAC-SHA256) que só serve para comparar se já foi usado.

export function soDigitos(v: string): string {
  return (v || "").replace(/\D/g, "");
}

// Confere os dígitos verificadores (não confirma de quem é o CPF).
export function cpfValido(cpf: string): boolean {
  const c = soDigitos(cpf);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  const dv = (base: string, peso: number) => {
    let soma = 0;
    for (const n of base) soma += Number(n) * peso--;
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return dv(c.slice(0, 9), 10) === Number(c[9]) && dv(c.slice(0, 10), 11) === Number(c[10]);
}

// WhatsApp brasileiro com DDD: 10 ou 11 dígitos (sem o 55).
export function telefoneValido(tel: string): string | null {
  let t = soDigitos(tel);
  if (t.length >= 12 && t.startsWith("55")) t = t.slice(2);
  return t.length === 10 || t.length === 11 ? t : null;
}

// Chave do embaralhamento: CPF_SEGREDO (se existir na Vercel) ou a chave do servidor do Supabase.
// Atenção: trocar essa chave faz os CPFs já usados deixarem de ser reconhecidos.
function chave(): string {
  const k = process.env.CPF_SEGREDO || process.env.SUPABASE_SERVICE_KEY;
  if (!k) throw new Error("sem chave para o CPF");
  return k;
}
export function embaralhar(tipo: "cpf" | "tel", valor: string): string {
  return createHmac("sha256", chave()).update(`${tipo}:${valor}`).digest("hex");
}
