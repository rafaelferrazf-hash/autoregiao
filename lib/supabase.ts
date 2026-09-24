import { createBrowserClient } from "@supabase/ssr";

// Cliente do navegador. A sessão fica em cookies (não mais em localStorage),
// para que o servidor (proxy.ts e rotas de API) também saiba quem está logado.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase env vars ausentes:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey });
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
