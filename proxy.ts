import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ehAdmin } from "@/lib/admin";

// Barra /painel e /admin no servidor, antes de a página carregar.
// Também renova os cookies de sessão do Supabase quando o token está para expirar.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(lista) {
          lista.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // getUser valida o token no Supabase (não confia só no cookie).
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname, search } = request.nextUrl;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return redirecionarMantendoCookies(url, response);
  }

  if (pathname.startsWith("/admin") && !ehAdmin(user.email)) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel";
    url.search = "";
    return redirecionarMantendoCookies(url, response);
  }

  return response;
}

function redirecionarMantendoCookies(url: URL, origem: NextResponse) {
  const redirect = NextResponse.redirect(url);
  origem.cookies.getAll().forEach(c => redirect.cookies.set(c));
  return redirect;
}

export const config = {
  matcher: ["/painel/:path*", "/admin/:path*"],
};
