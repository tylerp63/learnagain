import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth",
});

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - api/* routes (except api/auth) — API routes handle auth themselves
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets (pdf worker, etc.)
     */
    "/((?!_next/static|_next/image|api/(?!auth)|favicon\\.ico|sitemap\\.xml|robots\\.txt|pdf\\.worker\\.min\\.mjs).*)",
  ],
};
