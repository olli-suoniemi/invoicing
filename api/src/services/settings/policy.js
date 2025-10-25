// services/settings/policy.js

export function canCreateUser(user) {
  // Only admins can create users
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}

export function canReadUser(user, targetUser) {
  // Admins can read anything
  if (user?.admin) return true;

  // Users can read their own information
  if (user?.uid && user.uid === targetUser.uid) return true;

  // Otherwise, no access
  return false;
}

export function canReadAllUsers(user) {
  // Only admins can read all users
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}

export function canEditUser(user, targetUser) {
  // Admins can edit anything
  if (user?.admin) return true;

  // Users can edit their own information
  if (user?.uid && user.uid === targetUser.uid) return true;

  // Otherwise, no access
  return false;
}

export function canReadAllCompanies(user) {
  // Only admins can read all companies
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}

export function canCreateCompany(user) {
  // Only admins can create companies
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}

export function canReadCompany(user, targetCompany) {
  // Admins can read anything
  if (user?.admin) return true;

  // Users can read their own company information
  if (user?.company_id && user.company_id === targetCompany.id) return true;

  // Otherwise, no access
  return false;
}

export function canEditCompany(user, targetCompany) {
  // Admins can edit anything
  if (user?.admin) return true;

  // Users can edit their own company information
  if (user?.company_id && user.company_id === targetCompany.id) return true;

  // Otherwise, no access
  return false;
}
