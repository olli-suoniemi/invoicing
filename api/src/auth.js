// auth.js (backend)
import { firebaseAdmin } from "./firebase_admin.js";
import { config } from "./firebase_config.js";

function getBearerToken(c) {
  const authz = c.req.header("authorization") ?? "";
  return authz.startsWith("Bearer ") ? authz.slice(7) : null;
}

async function verifyEitherToken(raw) {
  // 1) Try ID token
  try {
    return await firebaseAdmin.auth().verifyIdToken(raw);
  } catch (_) {}
  // 2) Try session cookie
  return await firebaseAdmin.auth().verifySessionCookie(raw, true);
}

export async function requireAuth(c, next) {
  // let preflight pass if this middleware ever runs before global CORS
  // See: https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
  if (c.req.method === "OPTIONS") return next();

  const raw = getBearerToken(c);
  if (!raw) return c.json({ error: "Missing token" }, 401);

  try {
    const decoded = await verifyEitherToken(raw);

    // admin flag (same as your code)
    const adminIds = (config.adminIds ?? "")
      .split(",").map(s => s.trim()).filter(Boolean);
    const isAdminClaim =
      decoded.admin === true ||
      (Array.isArray(decoded.roles) && decoded.roles.includes("admin")) ||
      decoded.role === "admin";
    decoded.admin = isAdminClaim || adminIds.includes(decoded.uid);

    c.set("user", decoded);
    await next();
  } catch (e) {
    console.error("[auth] token verify error:", e?.code, e?.message);
    return c.json({ error: "Invalid token" }, 401);
  }
}


// Require an authenticated admin
export async function requireAdmin(c, next) {
  const user = c.get("user"); // requireAuth should've set this
  if (!user) return c.json({ error: "Not authenticated" }, 401);
  if (!user.admin) return c.json({ error: "Forbidden" }, 403);
  await next();
}
