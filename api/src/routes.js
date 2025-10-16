import { Hono } from "hono";
import { requireAuth, requireAdmin } from "./auth.js";
import * as invoicesService from "./services/invoices/service.js";

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

// read one invoice by ID
// IDs are UUIDs, not sequential integers
v1.get("/invoices/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  try {
    const inv = await invoicesService.getInvoice(user, id);
    return c.json(inv);
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? "Internal error" }, status);
  }
});

// list my company invoices
v1.get("/invoices", async (c) => {
  const user = c.get("user");
  try {
    const rows = await invoicesService.listMyCompanyInvoices(user);
    return c.json({ invoices: rows });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? "Internal error" }, status);
  }
});

// mark as paid (requires editor or admin per policy)
v1.post("/invoices/:id/paid", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  try {
    const updated = await invoicesService.markPaid(user, id, Boolean(body.paid));
    return c.json(updated);
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? "Internal error" }, status);
  }
});

// --------- Admin-only section under /v1/admin/* ---------
const admin = new Hono();
admin.use("*", requireAdmin);

// mount /v1/admin/*
v1.route("/admin", admin);

// example admin-only endpoint
admin.get("/stats", (c) => {
  return c.json({ ok: true });
});

// finally mount /v1/*
routes.route("/v1", v1);
