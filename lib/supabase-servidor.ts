import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Só para código que roda no servidor (rotas de API, proxy). Nunca importar em "use client".

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Cliente com a sessão do usuário que fez a requisição (lida dos cookies). Respeita o RLS.
export async function criarClienteServidor() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(lista) {
        try {
          lista.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado fora de um contexto que pode gravar cookies — o proxy renova a sessão.
        }
      },
    },
  });
}

// Cliente com a service key: ignora o RLS. Usar só depois de validar quem está pedindo.
export function criarClienteAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_KEY não configurada");
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Cliente anônimo sem sessão, para tarefas de servidor que não dependem de usuário.
export function criarClienteAnonimo() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
