import { NextResponse, type NextRequest } from "next/server";
import { ALENYA_SESSION_COOKIE, isAlenyaHost } from "@/lib/alenya/config";

function toBase64Url(bytes: ArrayBuffer): string {
  let str = "";
  const view = new Uint8Array(bytes);
  for (let i = 0; i < view.length; i++) str += String.fromCharCode(view[i]!);
  const b64 =
    typeof btoa !== "undefined"
      ? btoa(str)
      : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function edgeVerify(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  const secret =
    process.env.ALENYA_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_JWT_SECRET?.trim() ||
    process.env.ALENYA_PANEL_PASSWORD?.trim() ||
    "alenya-melano";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );
  const expected = toBase64Url(mac);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  if (diff !== 0) return false;
  const exp = Number(body.split(":")[1]);
  return Number.isFinite(exp) && Date.now() < exp;
}

function rewriteToAlenya(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host");
  const alenyaHost = isAlenyaHost(host);

  if (alenyaHost) {
    if (pathname === "/" || pathname === "") {
      return rewriteToAlenya(req, "/alenya");
    }
    if (pathname === "/dashboard.html" || pathname === "/dashboard") {
      return rewriteToAlenya(req, "/alenya/dashboard");
    }
    if (pathname === "/auth/login" || pathname.startsWith("/auth/login")) {
      return rewriteToAlenya(req, "/alenya/login");
    }
    if (pathname === "/SOP-CLIENTE.md") {
      return rewriteToAlenya(req, "/alenya/sop");
    }
    if (pathname === "/api/webhook") {
      return rewriteToAlenya(req, "/api/alenya/webhook");
    }
  }

  if (pathname === "/dashboard.html") {
    return NextResponse.redirect(new URL("/alenya/dashboard", req.url));
  }

  const isPanel =
    pathname.startsWith("/alenya/dashboard") ||
    pathname.startsWith("/alenya/datos");

  if (isPanel) {
    const token = req.cookies.get(ALENYA_SESSION_COOKIE)?.value;
    const ok = await edgeVerify(token);
    if (!ok) {
      const login = new URL("/alenya/login", req.url);
      login.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard.html",
    "/auth/login",
    "/SOP-CLIENTE.md",
    "/api/webhook",
    "/alenya/:path*",
  ],
};
