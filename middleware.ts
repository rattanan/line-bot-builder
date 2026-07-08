import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isProtectedPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/chat-test") ||
    pathname.startsWith("/chat-log") ||
    pathname.startsWith("/faq");
  const isProtectedApi =
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/chat/test") ||
    pathname.startsWith("/api/chat-log") ||
    pathname.startsWith("/api/faq");

  if (!isProtectedPage && !isProtectedApi) return NextResponse.next();

  const session = req.cookies.get("llb_session")?.value;
  if (!session) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/chat-test",
    "/chat-log",
    "/faq",
    "/api/admin/:path*",
    "/api/chat/test",
    "/api/chat-log",
    "/api/faq/:path*",
  ],
};
