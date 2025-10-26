// services/settings/repository.js
import { sql } from "../../util/databaseConnect.js";

export async function getUserById(id) {
  const rows = await sql`select * from users where id = ${id} limit 1`;
  return rows[0] ?? null;
}

export async function getUserByAuthUid(firebase_uid) {
  const rows = await sql`select * from users where firebase_uid = ${firebase_uid} limit 1`;
  return rows[0] ?? null;
}

export async function createUser(user) {
  const result = await sql`
    insert into users (firebase_uid, role, company_id, email, created_at, updated_at, last_login)
    values (${user.firebase_uid}, ${user.role}, ${user.company_id}, ${user.email}, ${user.created_at}, ${user.updated_at}, ${user.last_login})
    returning *
  `;
  return result[0];
}

export async function updateUserLogin(userId, lastLogin, role) {
  const result = await sql`
    update users
    set
      last_login = ${lastLogin},
      role = ${role}
    where id = ${userId}
    returning *
  `;
  return result[0];
}

export async function updateUser(id, user) {
  const result = await sql`
    update users
    set
      role = ${user.role},
      first_name = ${user.first_name},
      last_name = ${user.last_name},
      updated_at = ${new Date()}
    where id = ${id}
    returning *
  `;
  return result[0];
}

export async function listAllUsers(limit = 100) {
  const rows = await sql`
    select * from users
    order by created_at desc
    limit ${limit}
  `;
  return rows ?? [];
}

export async function createCompany(company) {
  const result = await sql`
    insert into companies (name, business_id, email, phone, website, created_at)
    values (${company.name}, ${company.business_id}, ${company.email}, ${company.phone}, ${company.website}, ${company.created_at})
    returning *
  `;
  return result[0];
}

export async function listAllCompanies(limit = 100) {
  const rows = await sql`
    select * from companies
    order by created_at desc
    limit ${limit}
  `;
  return rows ?? [];
}

export async function createCompanyAddress(address) {
  const result = await sql`
    insert into company_addresses (company_id, type, address, postal_code, city, state, country, created_at, updated_at)
    values (
      ${address.company_id}, 
      ${address.type}, 
      ${address.address}, 
      ${address.postal_code}, 
      ${address.city}, 
      ${address.state}, 
      ${address.country}, 
      ${new Date()}, 
      ${new Date()}
    )
    returning *
  `;
  return result[0];
}

export async function getCompanyById(id) {
  const rows = await sql`select * from companies where id = ${id} limit 1`;
  return rows[0] ?? null;
}

export async function getCompanyAddressByType(companyId, type) {
  const rows = await sql`
    select * from company_addresses
    where company_id = ${companyId} and type = ${type}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function updateCompany(id, company) {
  const result = await sql`
    update companies
    set
      name = ${company.name},
      business_id = ${company.business_id},
      email = ${company.email},
      phone = ${company.phone},
      website = ${company.website},
      updated_at = ${new Date()}
    where id = ${id}
    returning *
  `;
  return result[0];
}

export async function updateCompanyAddress(id, address) {
  const result = await sql`
    update company_addresses
    set
      address = ${address.address},
      postal_code = ${address.postal_code},
      city = ${address.city},
      state = ${address.state},
      country = ${address.country},
      updated_at = ${new Date()}
    where id = ${id}
    returning *
  `;
  return result[0];
}

export async function getUsersByCompanyId(companyId) {
  const rows = await sql`
    select * from users
    where company_id = ${companyId}
    order by created_at desc
  `;
  return rows ?? [];
}

export async function addUserToCompany(userId, companyId) {
  const result = await sql`
    update users
    set
      company_id = ${companyId},
      updated_at = ${new Date()}
    where id = ${userId}
    returning *
  `;

  // Update company updated at timestamp
  await sql`
    update companies
    set
      updated_at = ${new Date()}
    where id = ${companyId}
  `;
  return result[0];
}

export async function removeUserFromCompany(userId, companyId) {
  const result = await sql`
    update users
    set
      company_id = null,
      updated_at = ${new Date()}
    where id = ${userId}
    returning *
  `;

  // Update company updated at timestamp
  await sql`
    update companies
    set
      updated_at = ${new Date()}
    where id = ${companyId}
  `;
  return result[0];
}