import { Hono } from "hono";
import { requireAuth } from "./auth.js";
import { sql } from "./util/databaseConnect.js";
import { redis } from "./util/cacheUtil.js";

export const routes = new Hono();

// health
routes.get("/health", (c) => c.json({ ok: true }));

// simple db ping
routes.get("/db-ping", async (c) => {
  const r = await sql`select now()`;
  return c.json({ now: r[0].now});
});

// simple redis roundtrip
routes.get("/cache-ping", async (c) => {
  await redis.set("ping", "pong", "EX", 10);
  const v = await redis.get("ping");
  return c.json({ redis: v });
});

// protected
routes.get("/me", requireAuth, (c) => {
  const user = c.get("user");
  return c.json({ user });
});
