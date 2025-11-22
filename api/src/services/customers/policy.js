// services/customers/policy.js

export function canReadCustomer(user, company, customer) {
  // Admins can read anything
  if (user?.admin) return true;

  // Company members can read their company's customers
  if (company.org_id === customer.company_id) return true;

  // Otherwise, no access
  return false;
}

export function canEditCustomer(user, customer) {
  // Admins can edit anything
  if (user?.admin) return true;

  // Company members can edit their company's customers
  if (company.org_id === customer.company_id) return true;

  // Otherwise, no access
  return false;
}
