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

import { cacheMethodCalls } from "./util/cacheUtil.js";

// set cached methods calls and set the cache to flush when one of the methods in the list is called
const cachedCompaniesService = cacheMethodCalls(companiesService, []);
const cachedCustomersService = cacheMethodCalls(customersService, ["createCustomer", "updateCustomer"]);
const cachedSettingsService = cacheMethodCalls(settingsService, ["createUserDuringLogin", "createUser", "updateUser", "updateCompany", "addUserToCompany", "removeUserFromCompany", "updateEmailSettings"]);
const cachedInventoryService = cacheMethodCalls(inventoryService, ["addInventoryItem", "updateInventoryItemById"]);
const cachedOrdersService = cacheMethodCalls(ordersService, ["createOrder", "updateOrderById", "setOrderCompleted"]);
const cachedInvoiceService = cacheMethodCalls(invoiceService, ["createInvoiceForOrder", "updateInvoiceById"]);

export const routes = new Hono();

routes.get("/health", (c) => c.json({ ok: true }));

const v1 = new Hono();

// 1) Every /v1 route requires Firebase auth
v1.use("*", requireFirebaseAuth);

// --------- Authenticated via Firebase ---------

// minimal "who am I (Firebase)"
v1.get("/me", (c) => {
  const authUser = c.get("authUser");
  return c.json({ user: authUser });
});

// create a new user during login process
v1.post("/users/login", async (c) => {
  const authUser = c.get("authUser");
  const body = await c.req.json().catch(() => ({}));

  try {
    const user = await cachedSettingsService.createUserDuringLogin(authUser, body);
    return c.json(user);
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? "Internal error" }, status);
  }
});


// 2) From here on, require local DB user (internalId)
v1.use("*", requireLocalUser);

// --------- Authenticated with local user (has internalId) ---------
v1.get("/me", (c) => {
  const user = c.get("user");
  return c.json({ user });
});

// get users
v1.get("/users", async (c) => {
  const user = c.get("user");
  try {
    const users = await cachedSettingsService.listUsers(user);
    return c.json({ users });
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? "Internal error" }, status);
  }
});

// create user
v1.post("/users", async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  try {
    const user = await cachedSettingsService.createUser(authUser, body);
    return c.json({ user });
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
    const user = await cachedSettingsService.getUser(authUser, id);
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
    const updated = await cachedSettingsService.updateUser(authUser, id, patch);
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
    const company = await cachedSettingsService.getCompany(user);
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
    const updated = await cachedSettingsService.updateCompany(authUser, body);
    return c.json(updated);
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// update email settings
v1.put('/email', async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  try {
    const updated = await cachedSettingsService.updateEmailSettings(authUser, body);
    return c.json(updated);
  } catch (e) {
    const status = e.status ?? 500;
    return c.json({ error: e.message ?? 'Internal error' }, status);
  }
});

// get email settings
v1.get('/email', async (c) => {
  const authUser = c.get('user');
  try {
    console.log("Getting email settings for user:", authUser.internalId);
    const email = await cachedSettingsService.getEmailSettings(authUser);
    return c.json({ email });
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
    const user = await cachedSettingsService.addUserToCompany(authUser, body);
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
    const user = await cachedSettingsService.removeUserFromCompany(authUser, userId);
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
    const company = await cachedCompaniesService.getMainCompanyOfUser(authUser.internalId);

    if (!company) {
      // no throw, just respond
      return c.json({ error: 'User has no associated company' }, 403);
    }

    const customers = await cachedCustomersService.listCompanyCustomersById(company.org_id);

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
    const company = await cachedCompaniesService.getMainCompanyOfUser(authUser.internalId);

    if (!company) {
      // no throw, just respond
      return c.json({ error: 'User has no associated company' }, 403);
    }
    
    const customer = await cachedCustomersService.getCustomerById(authUser, company, id);

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
    const company = await cachedCompaniesService.getMainCompanyOfUser(authUser.internalId);

    if (!company) {
      // no throw, just respond
      return c.json({ error: 'User has no associated company' }, 403);
    }

    const customer = await cachedCustomersService.createCustomer(company, body);

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
    const updated = await cachedCustomersService.updateCustomer(id, body);

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
    const company = await cachedCompaniesService.getMainCompanyOfUser(authUser.internalId);

    if (!company) {
      // no throw, just respond
      return c.json({ error: 'User has no associated company' }, 403);
    }

    const inventory = await cachedInventoryService.listCompanyInventoryById(company.org_id);

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
    
    const item = await cachedInventoryService.getInventoryItemById(authUser, id);

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
    const company = await cachedCompaniesService.getMainCompanyOfUser(authUser.internalId);

    if (!company) {
      // no throw, just respond
      return c.json({ error: 'User has no associated company' }, 403);
    }

    const item = await cachedInventoryService.addInventoryItem(authUser, company, body);

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
    const updated = await cachedInventoryService.updateInventoryItemById(authUser, id, body);

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
    const company = await cachedCompaniesService.getMainCompanyOfUser(authUser.internalId);

    if (!company) {
      // no throw, just respond
      return c.json({ error: 'User has no associated company' }, 403);
    }

    const orders = await cachedOrdersService.listCompanyOrders(authUser, company.org_id);

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
    const order = await cachedOrdersService.getOrderById(authUser, id);

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
    const company = await cachedCompaniesService.getMainCompanyOfUser(authUser.internalId);

    if (!company) {
      // no throw, just respond
      return c.json({ error: 'User has no associated company' }, 403);
    }

    const order = await cachedOrdersService.createOrder(authUser, body, company);

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
    const updated = await cachedOrdersService.updateOrderById(authUser, id, body);

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
    const updated = await cachedOrdersService.setOrderCompleted(authUser, id);

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
    const order = await cachedOrdersService.getOrderById(authUser, body.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    const invoice = await cachedInvoiceService.createInvoiceForOrder(authUser, order);

    if (!invoice) {
      throw new Error('Invoice creation failed');
    } 

    await cachedOrdersService.setOrderCompleted(authUser, order.id);

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
    const invoice = await cachedInvoiceService.getInvoiceById(authUser, id);

    const customer = await cachedCustomersService.getCustomerById(
      authUser, 
      { org_id: invoice.company_id }, 
      invoice.customer_id
    );

    const order = await cachedOrdersService.getOrderById(authUser, invoice.order_id);

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
    const invoices = await cachedInvoiceService.listCompanyInvoices(authUser);

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
    await cachedInvoiceService.updateInvoiceById(authUser, id, body);

    const invoice = await cachedInvoiceService.getInvoiceById(authUser, id);

    const customer = await cachedCustomersService.getCustomerById(
      authUser, 
      { org_id: invoice.company_id }, 
      invoice.customer_id
    );

    const order = await cachedOrdersService.getOrderById(authUser, invoice.order_id);

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
