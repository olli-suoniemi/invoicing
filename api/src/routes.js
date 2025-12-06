// routes.js (backend)
import { Hono } from "hono";
import {
  requireFirebaseAuth,
  requireLocalUser,
  requireAdmin,
} from "./auth.js";
import * as companiesService from "./services/companies/service.js";
import * as customersService from "./services/customers/service.js";
import * as settingsService from "./services/settings/service.js";
import * as inventoryService from "./services/inventory/service.js";
import * as ordersService from "./services/orders/service.js";
import * as invoiceService from "./services/invoices/service.js";

export const routes = new Hono();

routes.get("/health", (c) => c.json({ ok: true }));

const v1 = new Hono();

// 1) Every /v1 route requires Firebase auth
v1.use("*", requireFirebaseAuth);

// --------- Authenticated via Firebase (no local user yet) ---------

// minimal "who am I (Firebase)" endpoint if you want it
v1.get("/me", (c) => {
  const authUser = c.get("authUser");
  return c.json({ user: authUser });
});

// create a new user during login process
v1.post("/users/login", async (c) => {
  const authUser = c.get("authUser"); // NOTE: from requireFirebaseAuth
  const body = await c.req.json().catch(() => ({}));

  try {
    const user = await settingsService.createUserDuringLogin(authUser, body);
    return c.json(user);
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? "Internal error" }, status);
  }
});

// 2) From here on, require local DB user (internalId)
v1.use("*", requireLocalUser);

// --------- Authenticated with local user (has internalId) ---------

// If you want /me to return *local* user instead, you can redefine it here
// or keep the earlier one and rename this.
v1.get("/me", (c) => {
  const user = c.get("user");
  return c.json({ user });
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

// get company
v1.get("/company", async (c) => {
  const user = c.get("user");
  try {
    const company = await settingsService.getCompany(user);
    return c.json({ company });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? "Internal error" }, status);
  }
});

// update company
v1.put('/company', async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  try {
    const updated = await settingsService.updateCompany(authUser, body);
    return c.json(updated);
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// add user to company
v1.post('/company/users', async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  try {
    const user = await settingsService.addUserToCompany(authUser, body);
    return c.json({ user });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// remove user from company
v1.delete('/company/users', async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const userId = body.userId;
  try {
    const user = await settingsService.removeUserFromCompany(authUser, userId);
    return c.json({ user });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// get customers for user's company
v1.get('/customers', async (c) => {
  const authUser = c.get('user');
  try {
    // get main company of the auth user
    const company = await companiesService.getMainCompanyOfUser(authUser.internalId);

    const customers = await customersService.listCompanyCustomersById(company.org_id);

    return c.json({ customers });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// get customer by ID
v1.get('/customers/:id', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  try {
    // get main company of the auth user
    const company = await companiesService.getMainCompanyOfUser(authUser.internalId);

    const customer = await customersService.getCustomerById(authUser, company, id);

    return c.json({ customer });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// create customer
v1.post('/customers', async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  try {
    // get main company of the auth user
    const company = await companiesService.getMainCompanyOfUser(authUser.internalId);

    console.log("Creating customer for company:", company, "with data:", body);

    const customer = await customersService.createCustomer(company, body);

    return c.json({ customer });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// update customer by ID
v1.put('/customers/:id', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  try {
    console.log("Updating customer ID:", id, "with data:", body);
    const updated = await customersService.updateCustomer(id, body);

    return c.json( updated );
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// get inventory
v1.get('/inventory', async (c) => {
  const authUser = c.get('user');
  try {
    // get main company of the auth user
    const company = await companiesService.getMainCompanyOfUser(authUser.internalId);

    const inventory = await inventoryService.listCompanyInventoryById(company.org_id);

    return c.json({ inventory });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// get inventory item by ID
v1.get('/inventory/:id', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  try {
    
    const item = await inventoryService.getInventoryItemById(authUser, id);

    return c.json({ inventory: item });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
}); 

// add inventory item
v1.post('/inventory', async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  try {
    // get main company of the auth user
    const company = await companiesService.getMainCompanyOfUser(authUser.internalId);

    const item = await inventoryService.addInventoryItem(authUser, company, body);

    return c.json({ inventory: item });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// update inventory item by ID
v1.put('/inventory/:id', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  try {
    const updated = await inventoryService.updateInventoryItemById(authUser, id, body);

    return c.json( updated );
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// get orders for user's company
v1.get('/orders', async (c) => {
  const authUser = c.get('user');
  try {
    // get main company of the auth user
    const company = await companiesService.getMainCompanyOfUser(authUser.internalId);

    const orders = await ordersService.listCompanyOrders(authUser, company.org_id);

    return c.json({ orders });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// get order by ID
v1.get('/orders/:id', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  try {
    const order = await ordersService.getOrderById(authUser, id);

    return c.json({ order });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// create order
v1.post('/orders', async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  try {
    const company = await companiesService.getMainCompanyOfUser(authUser.internalId);

    const order = await ordersService.createOrder(authUser, body, company);

    return c.json({ order });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// update order by ID
v1.put('/orders/:id', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  try {
    const updated = await ordersService.updateOrderById(authUser, id, body);

    return c.json( updated );
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// set order completed
v1.post('/orders/:id/complete', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  try {
    const updated = await ordersService.setOrderCompleted(authUser, id);

    return c.json( updated );
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// create invoice
v1.post('/invoices', async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  try {
    const order = await ordersService.getOrderById(authUser, body.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    const invoice = await invoiceService.createInvoiceForOrder(authUser, order);

    if (!invoice) {
      throw new Error('Invoice creation failed');
    } 

    await ordersService.setOrderCompleted(authUser, order.id);

    console.log("Created invoice:", invoice);
    return c.json({ invoice });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// get invoice by ID
v1.get('/invoices/:id', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  try {
    const invoice = await invoiceService.getInvoiceById(authUser, id);

    const customer = await customersService.getCustomerById(
      authUser, 
      { org_id: invoice.company_id }, 
      invoice.customer_id
    );

    const order = await ordersService.getOrderById(authUser, invoice.order_id);

    invoice.order = order;

    invoice.customer = customer;

    return c.json({ invoice });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// get all invoices
v1.get('/invoices', async (c) => {
  const authUser = c.get('user');
  try {
    const invoices = await invoiceService.listCompanyInvoices(authUser);

    return c.json({ invoices });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// update invoice by ID
v1.put('/invoices/:id', async (c) => {
  const authUser = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  try {
    await invoiceService.updateInvoiceById(authUser, id, body);

    const invoice = await invoiceService.getInvoiceById(authUser, id);

    const customer = await customersService.getCustomerById(
      authUser, 
      { org_id: invoice.company_id }, 
      invoice.customer_id
    );

    const order = await ordersService.getOrderById(authUser, invoice.order_id);

    invoice.order = order;

    invoice.customer = customer;

    return c.json( invoice );
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
