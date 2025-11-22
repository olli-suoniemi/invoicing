// services/inventory/policy.js

export function canCreateItem(user) {
  // Admins can create items
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}

export function canReadInventoryItem(user, company, item) {
  // Admins can read anything
  if (user?.admin) return true;

  // Company members can read their company's customers
  if (company.org_id === item.company_id) return true;

  // Otherwise, no access
  return false;
}

export function canEditInventoryItem(user, company, item) {
  // Admins can edit anything
  if (user?.admin) return true;

  // Company members can edit their company's customers
  if (company.org_id === item.company_id) return true;

  // Otherwise, no access
  return false;
}