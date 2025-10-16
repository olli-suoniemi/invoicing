// services/invoices/policy.js

export function canReadInvoice(user, invoice) {
  // Admins can read anything
  if (user?.admin) return true;

  // Company members can read their company's invoices
  if (user?.companyId && user.companyId === invoice.company_id) return true;

  // Editors can read their company's invoices
  if (Array.isArray(user?.roles) && user.roles.includes("editor") && user.companyId === invoice.company_id) return true;

  // Invoice owners can read their own invoices
  return user?.uid && user.uid === invoice.owner_uid;
}

export function canEditInvoice(user, invoice) {
  // Admins can edit anything
  if (user?.admin) return true;

  // Editors who belong to the company can edit their company's invoices. Other users cannot.
  return Boolean(Array.isArray(user?.roles) && user.roles.includes("editor") && user.companyId === invoice.company_id);
}
