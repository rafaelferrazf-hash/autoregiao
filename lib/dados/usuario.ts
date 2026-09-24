import { supabase } from "@/lib/supabase";

export async function usuarioAtual() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function sair() {
  await supabase.auth.signOut();
}
