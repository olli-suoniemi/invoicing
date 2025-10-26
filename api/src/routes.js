import { Hono } from "hono";
import { requireAuth, requireAdmin } from "./auth.js";
import * as invoicesService from "./services/invoices/service.js";
import * as customersService from "./services/customers/service.js";
import * as settingsService from "./services/settings/service.js";

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

// create a new user during login process
v1.post("/users/login", async (c) => {
  const authUser = c.get("user");         // comes from requireAuth (verified ID token)
  const body = await c.req.json().catch(() => ({}));

  try {
    const user = await settingsService.createUserDuringLogin(authUser, body);
    return c.json(user);
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? "Internal error" }, status);
  }
});

// get users
v1.get("/users", async (c) => {
  const user = c.get("user");
  try {
    const users = await settingsService.listUsers(user);
    return c.json({ users });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? "Internal error" }, status);
  }
});

// get user by ID
v1.get('/users/:id', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  try {
    const user = await settingsService.getUser(authUser, id);
    return c.json(user);
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// update user by ID
v1.put('/users/:id', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  const patch = await c.req.json().catch(() => ({}));
  try {
    const updated = await settingsService.updateUser(authUser, id, patch);
    return c.json(updated);
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// add company
v1.post("/companies", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  try {
    const company = await settingsService.createCompany(user, body);
    return c.json({ company });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? "Internal error" }, status);
  }
});

// get companies
v1.get("/companies", async (c) => {
  const user = c.get("user");
  try {
    const companies = await settingsService.listCompanies(user);
    return c.json({ companies });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? "Internal error" }, status);
  }
});

// get company by ID
v1.get('/companies/:id', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  try {
    const company = await settingsService.getCompanyById(authUser, id);
    return c.json(company);
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// update company by ID
v1.put('/companies/:id', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  const patch = await c.req.json().catch(() => ({}));
  try {
    const updated = await settingsService.updateCompany(authUser, id, patch);
    return c.json(updated);
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// add user to company
v1.post('/companies/:id/users', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  try {
    const user = await settingsService.addUserToCompany(authUser, id, body);
    return c.json({ user });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// remove user from company
v1.delete('/companies/:id/users', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const userId = body.userId;
  try {
    const user = await settingsService.removeUserFromCompany(authUser, id, userId);
    return c.json({ user });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
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
