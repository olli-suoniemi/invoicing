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
  const firebase_uid = user.firebase_uid ?? null;
  const role        = user.role ?? "user";
  const email       = user.email ?? "";
  const created_at  = user.created_at ?? new Date();
  const updated_at  = user.updated_at ?? created_at;
  const last_login  = user.last_login ?? null;
  const first_name  = user.first_name || "";
  const last_name   = user.last_name || "";

  const result = await sql`
    insert into users (
      firebase_uid,
      role,
      email,
      created_at,
      updated_at,
      last_login,
      first_name,
      last_name
    )
    values (
      ${firebase_uid},
      ${role},
      ${email},
      ${created_at},
      ${updated_at},
      ${last_login},
      ${first_name},
      ${last_name}
    )
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

export async function getCompany() {
  const rows = await sql`select * from companies limit 1`;
  return rows[0] ?? null;
}

export async function getCompanyAddressByType(type) {
  const rows = await sql`
    select * from company_addresses
    where type = ${type}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function updateCompany(company) {
  const result = await sql`
    update companies
    set
      name = ${company.name},
      business_id = ${company.business_id},
      email = ${company.email},
      phone = ${company.phone},
      website = ${company.website},
      updated_at = ${new Date()}
    where id = ${company.id}
    returning *
  `;
  return result[0];
}

export async function updateCompanyAddress(address) {
  const result = await sql`
    update company_addresses
    set
      address = ${address.address},
      postal_code = ${address.postal_code},
      city = ${address.city},
      state = ${address.state},
      country = ${address.country},
      updated_at = ${new Date()}
    where id = ${address.id}
    returning *
  `;
  return result[0];
}

export async function getUsersOfCompany() {
  const rows = await sql`
    SELECT u.*
    FROM users u
    JOIN user_org_roles uor
      ON uor.user_id = u.id
    WHERE uor.org_id = (SELECT id FROM companies LIMIT 1)
    ORDER BY u.created_at DESC
  `;
  return rows ?? [];
}

export async function addUserToCompany(userId, role = 'member') {
  // insert relationship
  await sql`
    INSERT INTO user_org_roles (user_id, org_id, role)
    VALUES (${userId}, (SELECT id FROM companies LIMIT 1), ${role})
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


export async function removeUserFromCompany(userId) {
  await sql`
    DELETE FROM user_org_roles
    WHERE user_id = ${userId}
      AND org_id = (SELECT id FROM companies LIMIT 1)
  `;

  const users = await sql`
    SELECT *
    FROM users
    WHERE id = ${userId}
  `;

  return users[0] ?? null;
}
