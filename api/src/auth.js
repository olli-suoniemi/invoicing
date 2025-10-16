import { firebaseAdmin } from "./firebase_admin.js";
import { config } from "./firebase_config.js";

// Pull the Bearer token from Authorization header
function getBearerToken(c) {
  const authz = c.req.header("authorization") ?? "";
  return authz.startsWith("Bearer ") ? authz.slice(7) : null;
}

// Verify token -> return decoded claims or throw
async function verifyToken(idToken) {
  const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
  return decoded;
}

// Require any authenticated user
export async function requireAuth(c, next) {
  // let preflight pass if this middleware ever runs before global CORS
  // See: https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
  if (c.req.method === "OPTIONS") return next();

  const token = getBearerToken(c);
  if (!token) return c.json({ error: "Missing token" }, 401);

  try {
    const decoded = await verifyToken(token);

    // Enrich with admin flag from either custom claims OR config list
    const adminIds = (config.adminIds ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const isAdminClaim =
      decoded.admin === true ||
      (Array.isArray(decoded.roles) && decoded.roles.includes("admin")) ||
      decoded.role === "admin";

    const isAdminList = adminIds.includes(decoded.uid);

    decoded.admin = Boolean(isAdminClaim || isAdminList);

    c.set("user", decoded); // make user available
    await next();
  } catch (e) {
    console.error("[auth] verifyIdToken error:", e?.code, e?.message);
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
