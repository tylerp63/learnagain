import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    sameSite: "lax", // required for OAuth: "strict" blocks the session challenge cookie on cross-site redirects from Neon Auth
    // sessionDataTtl: 300, // optional session_data cache TTL in seconds (default: 300)
  },
  // logLevel: 'silent', // disable Neon Auth logging
  logLevel: "debug" // verbose proxy/upstream logging
});
