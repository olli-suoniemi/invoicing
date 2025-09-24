import { firebaseAdmin } from "./firebase_admin.js";

export async function requireAuth(c) {
  const authz = c.req.header("authorization") ?? "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : undefined;
  if (!token) {
    return c.json({ error: "Missing Authorization header" }, 401);
  }
  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    c.set("user", decoded); // uid, email, custom claims
    await next();
  } catch (_e) {
    return c.json({ error: "Invalid token" }, 401);
  }
}
