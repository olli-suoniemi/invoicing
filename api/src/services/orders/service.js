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
  const newOrder = {
    customer_id: orderData.customer_id,
    company_id: company.org_id,
    total_amount_vat_excl: orderData.total_amount_vat_excl,
    total_amount_vat_incl: orderData.total_amount_vat_incl,
    extra_info: orderData.extra_info || '',
    status: orderData.status || 'pending',
    items: orderData.items || [],
  };

  const order = await repo.createOrder(newOrder);
  return order;
};

export async function updateOrderById(user, orderId, updateData) {
  const updatedOrder = await repo.updateOrderById({id: orderId, ...updateData});
  return updatedOrder;
}