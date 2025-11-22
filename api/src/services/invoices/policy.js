// services/invoices/policy.js

export function canReadInvoice(user, invoice) {
  // Admins can read anything
  if (user?.admin) return true;

  // Invoice owners can read their own invoices
  if (user?.uid && user.uid === invoice.owner_uid) return true;

  // Otherwise, no access
  return false;
}

export function canEditInvoice(user, invoice) {
  // Admins can edit anything
  if (user?.admin) return true;
  
  // Otherwise, no access
  return false;
}
