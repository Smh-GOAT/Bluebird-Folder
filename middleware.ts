import { NextResponse, type NextRequest } from "next/server";

/**
 * Minimal middleware — Forsion auth is token-based (localStorage + Authorization header),
 * so there's no cookie-based session to refresh. This middleware is a passthrough.
 *
 * In the future, protected routes can check for a token cookie here
 * and redirect to login if missing.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
