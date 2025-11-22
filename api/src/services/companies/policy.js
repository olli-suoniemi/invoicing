// services/companies/policy.js

export function canReadCompany(user) {
  // Admins can read anything
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}

export function canEditCompany(user) {
  // Admins can edit anything
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}
