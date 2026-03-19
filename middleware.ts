import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/", "/auth/callback"];
const EXCLUDED_PATHS = ["/api/", "/_next/", "/favicon.ico", "/static/"];

function isExcluded(pathname: string) {
  return EXCLUDED_PATHS.some((path) => pathname.startsWith(path));
}

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function redirectToHomeWithAuth(request: NextRequest) {
  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("auth", "required");
  return NextResponse.redirect(redirectUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isExcluded(pathname)) {
    return updateSession(request);
  }

  if (isPublicRoute(pathname)) {
    return updateSession(request);
  }

  const response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return redirectToHomeWithAuth(request);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirectToHomeWithAuth(request);
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
