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
    insert into users (firebase_uid, role, email, created_at, updated_at, last_login)
    values (${user.firebase_uid}, ${user.role}, ${user.email}, ${user.created_at}, ${user.updated_at}, ${user.last_login})
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
    insert into company_addresses (id, type, address, postal_code, city, state, country, created_at, updated_at)
    values (
      ${address.id}, 
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
    where id = ${companyId} and type = ${type}
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
    SELECT u.*
    FROM users u
    JOIN user_org_roles uor
      ON uor.user_id = u.id
    WHERE uor.org_id = ${companyId}
    ORDER BY u.created_at DESC
  `;
  return rows ?? [];
}

export async function addUserToCompany(userId, companyId, role = 'member') {
  // insert relationship
  await sql`
    INSERT INTO user_org_roles (user_id, org_id, role)
    VALUES (${userId}, ${companyId}, ${role})
    ON CONFLICT (user_id, org_id) DO NOTHING
  `;

  // return the user
  const users = await sql`
    SELECT *
    FROM users
    WHERE id = ${userId}
  `;

  return users[0] ?? null;
}


export async function removeUserFromCompany(userId, companyId) {
  await sql`
    DELETE FROM user_org_roles
    WHERE user_id = ${userId}
      AND org_id = ${companyId}
  `;

  const users = await sql`
    SELECT *
    FROM users
    WHERE id = ${userId}
  `;

  return users[0] ?? null;
}
