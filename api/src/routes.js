import { Hono } from "hono";
import { requireAuth, requireAdmin } from "./auth.js";
import { sql } from "./util/databaseConnect.js";
import { redis } from "./util/cacheUtil.js";

export const routes = new Hono();

// public
routes.get("/health", (c) => c.json({ ok: true }));

// v1 sub-app (everything here requires auth)
const v1 = new Hono();
v1.use("*", requireAuth);

// --------- Authenticated (non-admin) ---------
v1.get("/me", (c) => {
  const user = c.get("user");
  return c.json({ user });
});

v1.get("/db-ping", async (c) => {
  const r = await sql`select now()`;
  return c.json({ now: r[0].now });
});

v1.get("/cache-ping", async (c) => {
  await redis.set("ping", "pong", "EX", 10);
  const v = await redis.get("ping");
  return c.json({ redis: v });
});

// Example: regular user can read *their* invoices
v1.get("/invoices", async (c) => {
  const user = c.get("user");
  const rows = await sql`select * from invoices where owner_uid = ${user.uid} limit 50`;
  return c.json({ invoices: rows });
});

// --------- Admin-only section under /v1/admin/* ---------
const admin = new Hono();
admin.use("*", requireAdmin);

admin.get("/stats", async (c) => {
  const [{ count }] = await sql`select count(*)::int as count from invoices`;
  return c.json({ invoicesTotal: count });
});

// mount /v1/admin/*
v1.route("/admin", admin);

// finally mount /v1/*
routes.route("/v1", v1);
