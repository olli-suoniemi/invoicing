// auth.js (backend)
import { firebaseAdmin } from "./firebase_admin.js";
import { config } from "./firebase_config.js";
import { sql } from "./util/databaseConnect.js";

function getBearerToken(c) {
  const authz = c.req.header("authorization") ?? "";
  return authz.startsWith("Bearer ") ? authz.slice(7) : null;
}

// 1) Just Firebase auth (no DB)
export async function requireFirebaseAuth(c, next) {
  if (c.req.method === "OPTIONS") return next();

  const raw = getBearerToken(c);
  if (!raw) return c.json({ error: "Missing token" }, 401);

  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(raw);

    const adminIds = (config.adminIds ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const isAdminClaim =
      decoded.admin === true ||
      (Array.isArray(decoded.roles) && decoded.roles.includes("admin")) ||
      decoded.role === "admin";
    decoded.admin = isAdminClaim || adminIds.includes(decoded.uid);

    // store basic auth user (Firebase only)
    c.set("authUser", decoded);
    await next();
  } catch (e) {
    console.error("[auth] token verify error:", e?.code, e?.message);
    return c.json({ error: "Invalid token" }, 401);
  }
}

// 2) Attach local DB user (and internalId)
export async function requireLocalUser(c, next) {
  const authUser = c.get("authUser");
  if (!authUser) return c.json({ error: "Not authenticated" }, 401);

  const [dbUser] = await sql`
    SELECT id, email
    FROM users
    WHERE firebase_uid = ${authUser.uid}
    LIMIT 1
  `;

  if (!dbUser) {
    return c.json({ error: "User not found in local DB" }, 404);
  }

  const userContext = {
    ...authUser,
    internalId: dbUser.id,
    dbUser,
  };

  c.set("user", userContext);
  await next();
}

// Admin still checks the enriched user
export async function requireAdmin(c, next) {
  const user = c.get("user");
  if (!user) return c.json({ error: "Not authenticated" }, 401);
  if (!user.admin) return c.json({ error: "Forbidden" }, 403);
  await next();
}
