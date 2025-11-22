// services/settings/service.js
import * as repo from "./repository.js";
import { 
  canCreateUser,
  canReadAllUsers, 
  canReadUser, 
  canEditUser, 
  canReadAllCompanies,
  canCreateCompany,
  canReadCompany,
  canEditCompany,
  canAddUserToCompany,
  canRemoveUserFromCompany
} from "./policy.js";
import { ForbiddenError } from "../../util/errors.js";

export async function createUserDuringLogin(authUser, body) {
  if (!canCreateUser(authUser)) {
    throw new ForbiddenError("Not allowed to create users");
  }

  // Look up by Firebase UID (best key to avoid duplicates)
  const existing = await repo.getUserByAuthUid(authUser.uid);
  if (existing) {
    // Update last login time
    existing.last_login = new Date();
    // Update role if admin status has changed. Role comes from auth claims.
    existing.role = authUser.admin ? 'admin' : 'user';
    await repo.updateUserLogin(existing.id, existing.last_login, existing.role);
    return existing;
  }

  // Build the new user record
  const newUser = {
    firebase_uid: authUser.uid,
    role: authUser.admin ? 'admin' : 'user',
    email: body.email || "",
    created_at: new Date(),
    updated_at: new Date(),
    last_login: new Date(),
  };

  return repo.createUser(newUser);
}

export function listUsers(user) {
  if (!canReadAllUsers(user)) {
    throw new ForbiddenError("Not allowed to list all users");
  }

  return repo.listAllUsers(100);
}

export async function getUser(requestor, id) {
  const user = await repo.getUserById(id);
  if (!user) throw new NotFoundError('User not found');
  if (!canReadUser(requestor, user)) throw new ForbiddenError('Not allowed');
  return user;
}

export async function updateUser(requestor, id, patch) {
  const existing = await repo.getUserById(id);
  if (!existing) throw new NotFoundError('User not found');
  if (!canEditUser(requestor, existing)) throw new ForbiddenError('Not allowed');

  const allowed = {
    role: patch.role ?? existing.role,
    first_name: patch.first_name ?? existing.first_name,
    last_name: patch.last_name ?? existing.last_name,
  };
  const updated = await repo.updateUser(id, allowed);
  return updated;
}

export async function createCompany(user, data) {
  if (!canCreateCompany(user)) {
    throw new ForbiddenError("Not allowed to create companies");
  }

  const company = {
    name: data.companyName,
    business_id: data.businessId,
    email: data.email,
    phone: data.phone,
    website: data.website,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const created = await repo.createCompany(company);

  // create also addresses for the company
  const invoicingAddress =  {
    company_id: created.id,
    type: 'invoicing',
    address: data.invoiceStreet,
    postal_code: data.invoicePostalCode,
    city: data.invoiceCity,
    state: data.invoiceState,
    country: data.invoiceCountry,
  };
  const deliveryAddress =  {
    company_id: created.id,
    type: 'delivery',
    address: data.deliveryStreet,
    postal_code: data.deliveryPostalCode,
    city: data.deliveryCity,
    state: data.deliveryState,
    country: data.deliveryCountry,
  };
  await repo.createCompanyAddress(invoicingAddress);
  await repo.createCompanyAddress(deliveryAddress);
}

export function listCompanies(user) {
  if (!canReadAllCompanies(user)) {
    throw new ForbiddenError("Not allowed to list all companies");
  }

  return repo.listAllCompanies(100);
}

export async function getCompanyById(user, id) {
  const company = await repo.getCompanyById(id);
  if (!company) throw new NotFoundError('Company not found');
  if (!canReadCompany(user, company)) throw new ForbiddenError('Not allowed');

  const invoicingAddress = await repo.getCompanyAddressByType(id, 'invoicing');
  const deliveryAddress = await repo.getCompanyAddressByType(id, 'delivery');
  const users = await repo.getUsersByCompanyId(id);
  return {
    ...company,
    invoicingAddress,
    deliveryAddress,
    users
  };
}

export async function updateCompany(user, id, patch) {
  const existing = await repo.getCompanyById(id);
  if (!existing) throw new NotFoundError('Company not found');
  if (!canEditCompany(user, existing)) throw new ForbiddenError('Not allowed');

  const allowedCompany = {
    name: patch.companyName ?? existing.name,
    business_id: patch.businessId ?? existing.business_id,
    email: patch.email ?? existing.email,
    phone: patch.phone ?? existing.phone,
    website: patch.website ?? existing.website,
  };
  const updated = await repo.updateCompany(id, allowedCompany);

  const allowedInvoicingAddress = {
    address: patch.invoiceStreet,
    postal_code: patch.invoicePostalCode,
    city: patch.invoiceCity,
    state: patch.invoiceState,
    country: patch.invoiceCountry,
  };
  const allowedDeliveryAddress = {
    address: patch.deliveryStreet,
    postal_code: patch.deliveryPostalCode,
    city: patch.deliveryCity,
    state: patch.deliveryState,
    country: patch.deliveryCountry,
  };

  // update invoicing address
  const existingInvoicingAddress = await repo.getCompanyAddressByType(id, 'invoicing');
  let updatedInvoicingAddress;
  if (existingInvoicingAddress) {
    updatedInvoicingAddress = await repo.updateCompanyAddress(existingInvoicingAddress.id, allowedInvoicingAddress);
  } else {
    updatedInvoicingAddress = await repo.createCompanyAddress({
      company_id: id,
      type: 'invoicing',
      ...allowedInvoicingAddress
    });
  }

  // update delivery address
  const existingDeliveryAddress = await repo.getCompanyAddressByType(id, 'delivery');
  let updatedDeliveryAddress;
  if (existingDeliveryAddress) {
    updatedDeliveryAddress = await repo.updateCompanyAddress(existingDeliveryAddress.id, allowedDeliveryAddress);
  } else {
    updatedDeliveryAddress = await repo.createCompanyAddress({
      company_id: id,
      type: 'delivery',
      ...allowedDeliveryAddress
    });
  }

  const users = await repo.getUsersByCompanyId(id);

  return {
    ...updated,
    invoicingAddress: updatedInvoicingAddress,
    deliveryAddress: updatedDeliveryAddress,
    users
  };
}

export async function addUserToCompany(requestor, companyId, userBody) {
  const company = await repo.getCompanyById(companyId);
  if (!company) throw new NotFoundError('Company not found');
  if (!canAddUserToCompany(requestor, company)) throw new ForbiddenError('Not allowed to add users to this company');

  const user = await repo.getUserById(userBody.userId);
  if (!user) throw new NotFoundError('User not found');

  // Add the user to the company
  const updatedUser = await repo.addUserToCompany(user.id, companyId);
  return updatedUser;
}

export async function removeUserFromCompany(requestor, companyId, userId) {
  const company = await repo.getCompanyById(companyId);
  if (!company) throw new NotFoundError('Company not found');
  if (!canRemoveUserFromCompany(requestor, company)) throw new ForbiddenError('Not allowed to remove users from this company');

  const user = await repo.getUserById(userId);
  if (!user) throw new NotFoundError('User not found');

  // Remove the user from the company
  const updatedUser = await repo.removeUserFromCompany(user.id, companyId);
  return updatedUser;
}