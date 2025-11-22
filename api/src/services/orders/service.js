// services/orders/service.js
import * as repo from "./repository.js";
import { canReadOrder, canReadOrderOfCompany } from "./policy.js";
import { ForbiddenError } from "../../util/errors.js";

export async function getOrderById(user, id) {
  const order = await repo.getOrderById(id);
  if (!order) {
    return null;
  }

  if (!canReadOrder(user)) {
    throw new ForbiddenError("You do not have permission to view this order.");
  }

  return order;
};

export async function listCompanyOrdersById(user, companyId) {
  if (!canReadOrderOfCompany(user)) {
    throw new ForbiddenError("You do not have permission to view orders of this company.");
  }

  const orders = await repo.getOrdersByCompanyId(companyId);
  return orders;
}