import { NextResponse, type NextRequest } from "next/server";

// Lightweight gate for /admin: redirect visitors without a session cookie to the login page.
// Real authentication and authorisation are enforced server-side on every page, action and route.
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!req.cookies.has("ntso_admin_session")) {
    if (pathname.startsWith("/admin/attachments") || pathname.startsWith("/admin/enquiries/export")) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
