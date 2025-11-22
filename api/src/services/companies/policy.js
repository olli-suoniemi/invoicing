// services/companies/policy.js

export function canReadCompany(user, company) {
  // Admins can read anything
  if (user?.admin) return true;

  // Company members can read their company
  if (user?.companyId && user.companyId === company.company_id) return true;

  // Otherwise, no access
  return false;
}

export function canEditCompany(user, company) {
  // Admins can edit anything
  if (user?.admin) return true;

  // Company members can edit their company
  if (user?.companyId && user.companyId === company.company_id) return true;

  // Otherwise, no access
  return false;
}
