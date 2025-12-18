// services/settings/service.js
import * as repo from "./repository.js";
import { 
  canCreateUser,
  canReadAllUsers, 
  canReadUser, 
  canEditUser,
  canReadCompany,
  canEditCompany,
  canAddUserToCompany,
  canRemoveUserFromCompany
} from "./policy.js";
import { ForbiddenError } from "../../util/errors.js";

import { firebaseAdmin } from '../../firebase_admin.js'; // adjust path

export async function createUserDuringLogin(authUser, body) {
  if (!canCreateUser(authUser)) {
    throw new ForbiddenError("Not allowed to create users");
  }

  if (!authUser?.uid) {
    throw new Error("Missing Firebase UID in authUser");
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

  const email =
    body?.email ??
    authUser.email ??    // fallback to Firebase email if present
    "";

  // Build the new user record
  const newUser = {
    firebase_uid: authUser.uid,
    role: authUser.admin ? 'admin' : 'user',
    email: email,
    created_at: new Date(),
    updated_at: new Date(),
    last_login: new Date(),
    first_name: body?.first_name || '',
    last_name: body?.last_name || '',
  };

  return repo.createUser(newUser);
}

export async function createUser(requestor, body) {
  if (!canCreateUser(requestor)) {
    throw new ForbiddenError("Not allowed to create users");
  }

  // 1) Create user in Firebase Auth
  // You have a few options here:
  //  - generate a random password and send it to them separately
  //  - or create the user without password and send an email link reset, etc.
  // For demo, we generate a random temp password.
  const tempPassword =
    Math.random().toString(36).slice(-10) + 'A1!'; // ensure complexity if you want

  const fbUser = await firebaseAdmin.auth().createUser({
    email: body.email,
    password: tempPassword,
    displayName: `${body.first_name || ''} ${body.last_name || ''}`.trim(),
    disabled: false,
  });

  // 2) Set custom claims based on role
  const isAdmin = body.role === 'admin';
  await firebaseAdmin.auth().setCustomUserClaims(fbUser.uid, { admin: isAdmin });

  // 3) Create user in your database
  const newUser = {
    firebase_uid: fbUser.uid,
    role: isAdmin ? 'admin' : 'user',
    first_name: body.first_name || '',
    last_name: body.last_name || '',
    email: body.email || '',
    created_at: new Date(),
    updated_at: new Date(),
    last_login: null,
  };

  try {
    const created = await repo.createUser(newUser);

    // Add the user to the company
    const added = await repo.addUserToCompany(created.id);
    return added;
  } catch (e) {
    // Optional: rollback Auth user if DB insert fails
    await firebaseAdmin.auth().deleteUser(fbUser.uid).catch(() => {});
    throw e;
  }
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

export async function getCompany(user) {
  const company = await repo.getCompany();
  if (!company) throw new NotFoundError('Company not found');
  if (!canReadCompany(user)) throw new ForbiddenError('Not allowed');

  const invoicingAddress = await repo.getCompanyAddressByType('invoicing');
  const deliveryAddress = await repo.getCompanyAddressByType('delivery');
  const users = await repo.getUsersOfCompany();
  return {
    ...company,
    invoicingAddress,
    deliveryAddress,
    users
  };
}

export async function updateCompany(user, body) {
  const company = await repo.getCompany();
  if (!company) throw new NotFoundError('Company not found');
  if (!canEditCompany(user)) throw new ForbiddenError('Not allowed');

  const allowedCompany = {
    id: company.id,
    name: body.companyName ?? company.name,
    business_id: body.businessId ?? company.business_id,
    email: body.email ?? company.email,
    phone: body.phone ?? company.phone,
    website: body.website ?? company.website,
    iban: body.iban ?? company.iban,
    logo_path: body.logo_path ?? company.logo_path,
  };
  const updated = await repo.updateCompany(allowedCompany);

  const allowedInvoicingAddress = {
    address: body.invoiceStreet,
    postal_code: body.invoicePostalCode,
    city: body.invoiceCity,
    state: body.invoiceState,
    country: body.invoiceCountry,
    id: body.invoicingAddressId,
  };
  const allowedDeliveryAddress = {
    address: body.deliveryStreet,
    postal_code: body.deliveryPostalCode,
    city: body.deliveryCity,
    state: body.deliveryState,
    country: body.deliveryCountry,
    id: body.deliveryAddressId,
  };

  // update invoicing address
  const updatedInvoicingAddress = await repo.updateCompanyAddress(allowedInvoicingAddress);
  
  // update delivery address
  const updatedDeliveryAddress = await repo.updateCompanyAddress(allowedDeliveryAddress);

  const users = await repo.getUsersOfCompany();

  return {
    ...updated,
    invoicingAddress: updatedInvoicingAddress,
    deliveryAddress: updatedDeliveryAddress,
    users
  };
}

export async function addUserToCompany(requestor, userBody) {
  const company = await repo.getCompany();
  if (!company) throw new NotFoundError('Company not found');
  if (!canAddUserToCompany(requestor)) throw new ForbiddenError('Not allowed to add users to this company');

  const user = await repo.getUserById(userBody.userId);
  if (!user) throw new NotFoundError('User not found');

  // Add the user to the company
  const updatedUser = await repo.addUserToCompany(user.id);
  return updatedUser;
}

export async function removeUserFromCompany(requestor, userId) {
  const company = await repo.getCompany();
  if (!company) throw new NotFoundError('Company not found');
  if (!canRemoveUserFromCompany(requestor)) throw new ForbiddenError('Not allowed to remove users from this company');

  const user = await repo.getUserById(userId);
  if (!user) throw new NotFoundError('User not found');

  // Remove the user from the company
  const updatedUser = await repo.removeUserFromCompany(user.id);
  return updatedUser;
}

export async function getEmailSettings(user) {
  const emailSettings = await repo.getEmailSettings();
  if (!emailSettings) throw new NotFoundError('Email settings not found');
  if (!canReadCompany(user)) throw new ForbiddenError('Not allowed');
  return emailSettings;
}

export async function updateEmailSettings(user, body) {
  const emailSettings = await repo.getEmailSettings();
  if (!emailSettings) throw new NotFoundError('Email settings not found');
  if (!canEditCompany(user)) throw new ForbiddenError('Not allowed');

  const updated = await repo.updateEmailSettings(body);
  console.log("Updated email settings:", updated);
  return updated;
} 