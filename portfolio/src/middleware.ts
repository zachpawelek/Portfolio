import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function unauthorized() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Newsletter Admin"',
    },
  });
}

export function middleware(req: NextRequest) {
  const user = process.env.NEWSLETTER_ADMIN_USER;
  const pass = process.env.NEWSLETTER_ADMIN_PASS;

  // Fail closed if env vars missing
  if (!user || !pass) return unauthorized();

  const auth = req.headers.get("authorization") || "";
  const [scheme, encoded] = auth.split(" ");

  if (scheme !== "Basic" || !encoded) return unauthorized();

  // Edge-safe base64 decode
  let decoded = "";
  try {
    decoded = atob(encoded); // "user:pass"
  } catch {
    return unauthorized();
  }

  const idx = decoded.indexOf(":");
  const u = idx >= 0 ? decoded.slice(0, idx) : "";
  const p = idx >= 0 ? decoded.slice(idx + 1) : "";

  if (u !== user || p !== pass) return unauthorized();

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/newsletter/send/:path*",
    "/api/newsletter/send-upload/:path*",
    "/api/newsletter/stats/:path*",
  ],
};
