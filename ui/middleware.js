// middleware.js
import { NextResponse } from "next/server";

const PUBLIC = ["/login", "/signup", "/_next", "/favicon.ico", "/robots.txt", "/api/public"];
const COOKIE = "session";

function isPublic(p){ return PUBLIC.some(x => p === x || p.startsWith(x + "/")); }
function decodeJwt(t){
  try { const [,p]=t.split("."); return JSON.parse(Buffer.from(p.replace(/-/g,"+").replace(/_/g,"/"),"base64").toString("utf8")); }
  catch { return null; }
}

export function middleware(req){
  const { pathname, search } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const tok = req.cookies.get(COOKIE)?.value;
  if (!tok) {
    const u = new URL("/login", req.url);
    u.searchParams.set("redirect", pathname + (search || ""));
    return NextResponse.redirect(u);
  }

  // Optional UX: early expire check
  const dec = decodeJwt(tok), now = Math.floor(Date.now()/1000);
  if (dec?.exp && dec.exp <= now) {
    const u = new URL("/login", req.url);
    u.searchParams.set("redirect", pathname + (search || ""));
    return NextResponse.redirect(u);
  }

  // Forward for SSR/server fetches
  const headers = new Headers(req.headers);
  headers.set("authorization", `Bearer ${tok}`);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|login|signup|api/auth|api/public).*)'],
};
