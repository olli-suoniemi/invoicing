// services/invoices/service.js
import * as repo from "./repository.js";
import { canReadCustomer } from "./policy.js";
import { ForbiddenError } from "../../util/errors.js";

export async function getCustomer(user, id) {
  const cust = await repo.getCustomerById(id);
  if (!cust) throw new NotFoundError("Customer not found");
  if (!canReadCustomer(user, cust)) throw new ForbiddenError("Not allowed to view this customer");
  return cust;
}

export async function listMyCompanyCustomers(user) {
  if (!user?.companyId) {
    throw new ForbiddenError("Missing company context");
  }

  // Decide your admin behavior. Here we require admins to still have a companyId.
  const companyId = user.admin ? user.companyId : user.companyId;
  if (!companyId) {
    throw new ForbiddenError("Admin must select a company");
  }

  return repo.listCompanyCustomers(companyId, 50);
}

