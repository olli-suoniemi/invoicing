// services/inventory/policy.js

export function canCreateItem(user) {
  // Admins can create items
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}

export function canReadInventoryItem(user) {
  // Admins can read anything
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}

export function canEditInventoryItem(user) {
  // Admins can edit anything
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}