// services/invoices/service.js
import * as repo from "./repository.js";
import { canReadInvoice, canEditInvoice } from "./policy.js";
import { ForbiddenError } from "../../util/errors.js";

export async function getInvoice(user, id) {
  const inv = await repo.getInvoiceById(id);
  if (!inv) throw new NotFoundError("Invoice not found");
  if (!canReadInvoice(user, inv)) throw new ForbiddenError("Not allowed to view this invoice");
  return inv;
}

export async function listMyCompanyInvoices(user) {
  if (!user?.companyId) {
    throw new ForbiddenError("Missing company context");
  }

  // Decide your admin behavior. Here we require admins to still have a companyId.
  const companyId = user.admin ? user.companyId : user.companyId;
  if (!companyId) {
    throw new ForbiddenError("Admin must select a company");
  }

  return repo.listCompanyInvoices(companyId, 50);
}

export async function markPaid(user, id, paid) {
  const inv = await repo.getInvoiceById(id);
  if (!inv) throw new NotFoundError("Invoice not found");
  if (!canEditInvoice(user, inv)) throw new ForbiddenError("Not allowed to modify this invoice");
  return repo.updateInvoicePaid(id, paid);
}
