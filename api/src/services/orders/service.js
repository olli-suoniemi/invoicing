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

export async function listCompanyOrders(user, companyId) {
  if (!canReadOrderOfCompany(user)) {
    throw new ForbiddenError("You do not have permission to view orders of this company.");
  }

  const orders = await repo.getOrdersByCompanyId(companyId);
  return orders;
}

export async function createOrder(user, orderData, company) {
  const order = await repo.createOrder({
    ...orderData,
    company_id: company.org_id,
  });
  return order;
};

export async function updateOrderById(user, orderId, updateData) {
  const updatedOrder = await repo.updateOrderById({id: orderId, ...updateData});
  return updatedOrder;
};

export async function setOrderCompleted(user, orderId) {
  const updatedOrder = await repo.setCompleted(orderId);
  return updatedOrder;
};