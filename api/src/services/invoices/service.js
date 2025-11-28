// services/invoices/service.js
import * as repo from "./repository.js";
import { canCreateInvoice, canEditInvoice, canReadInvoice } from "./policy.js";
import { ForbiddenError } from "../../util/errors.js";

export async function createInvoiceForOrder(user, order) {
  if (!canCreateInvoice(user)) {
    throw new ForbiddenError("You do not have permission to create an invoice.");
  }

  const newInvoice = {
    order_id: order.id,
    customer_id: order.customer_id,
    company_id: order.company_id,
    total_amount_vat_excl: order.total_amount_vat_excl,
    total_amount_vat_incl: order.total_amount_vat_incl
  };

  const invoice = await repo.createInvoice(newInvoice);
  return invoice;
}

export async function getInvoiceById(user, id) {
  const invoice = await repo.getInvoiceById(id);
  if (!invoice) {
    return null;
  }

  if (!canReadInvoice(user)) {
    throw new ForbiddenError("You do not have permission to view this invoice.");
  }

  return invoice;
}

export async function listCompanyInvoices(user, companyId, limit = 50) {
  if (!canReadInvoice(user)) {
    throw new ForbiddenError("You do not have permission to view invoices of this company.");
  }

  const invoices = await repo.listCompanyInvoices(companyId, limit);
  return invoices;
}
