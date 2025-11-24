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

export function canAddUserToCompany(user) {
  // Admins can add users to any company
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}

export function canRemoveUserFromCompany(user) {
  // Admins can remove users from any company
  if (user?.admin) return true;

  // Otherwise, no access
  return false;
}