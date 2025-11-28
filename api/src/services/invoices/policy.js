// services/invoices/policy.js

export function canReadInvoice(user) {
  // Admins can read anything
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}

export function canEditInvoice(user) {
  // Admins can edit anything
  if (user?.admin) return true;
  
  // Otherwise, no access
  return false;
}

export function canCreateInvoice(user) {
  // Admins can create anything
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}
