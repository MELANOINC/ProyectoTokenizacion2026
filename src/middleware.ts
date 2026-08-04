import { NextResponse, type NextRequest } from "next/server";
import { ALENYA_SESSION_COOKIE, isAlenyaHost } from "@/lib/alenya/config";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/config";

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

async function edgeHmacVerify(
  token: string | undefined,
  secrets: string[],
  prefix?: string,
): Promise<boolean> {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  if (prefix && !body.startsWith(prefix)) return false;

  for (const secret of secrets) {
    if (!secret) continue;
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
    if (expected.length === sig.length) {
      let diff = 0;
      for (let i = 0; i < expected.length; i++) {
        diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
      }
      if (diff === 0) {
        const exp = Number(body.split(":").pop());
        if (Number.isFinite(exp) && Date.now() < exp) return true;
      }
    }
  }
  return false;
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

  const isAlenyaPanel =
    pathname.startsWith("/alenya/dashboard") ||
    pathname.startsWith("/alenya/datos");

  if (isAlenyaPanel) {
    const token = req.cookies.get(ALENYA_SESSION_COOKIE)?.value;
    const ok = await edgeHmacVerify(token, [
      process.env.ALENYA_SESSION_SECRET?.trim() || "",
      process.env.SUPABASE_JWT_SECRET?.trim() || "",
      process.env.ALENYA_PANEL_PASSWORD?.trim() || "",
      "alenya-melano",
    ]);
    if (!ok) {
      const login = new URL("/alenya/login", req.url);
      login.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(login);
    }
  }

  const isNotoriusAdmin =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (isNotoriusAdmin && !alenyaHost) {
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const ok = await edgeHmacVerify(
      token,
      [
        process.env.NOTORIUS_ADMIN_SESSION_SECRET?.trim() || "",
        process.env.ALENYA_SESSION_SECRET?.trim() || "",
        process.env.SUPABASE_JWT_SECRET?.trim() || "",
        process.env.NOTORIUS_ADMIN_PASSWORD?.trim() || "",
        process.env.ALENYA_PANEL_PASSWORD?.trim() || "",
      ],
      "admin:",
    );
    if (!ok) {
      const login = new URL("/admin/login", req.url);
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
    "/dashboard/:path*",
    "/dashboard.html",
    "/auth/login",
    "/SOP-CLIENTE.md",
    "/api/webhook",
    "/alenya/:path*",
    "/admin/:path*",
  ],
};
