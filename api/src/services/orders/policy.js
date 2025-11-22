// services/orders/policy.js

export function canReadOrder(user) {
  // Admins can read anything
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}

export function canReadOrderOfCompany(user) {
  // Admins can read anything
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}

export function canEditOrder(user) {
  // Admins can edit anything
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}
