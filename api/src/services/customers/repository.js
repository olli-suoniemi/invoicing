// services/invoices/repository.js
import { sql } from "../../util/databaseConnect.js";

export async function getCustomerById(id) {
  const rows = await sql`select * from clients where id = ${id} limit 1`;
  return rows[0] ?? null;
}

export async function listCompanyCustomersById(companyId, limit = 50) {
  const rows = await sql`
    select * from clients
    where company_id = ${companyId}
    order by created_at desc
    limit ${limit}
  `;
  return rows ?? [];
}

export async function createCustomer(customer) {
  // Create new address record

  const result = await sql`
    insert into clients (name, email, company_id)
    values (${customer.name}, ${customer.email}, ${customer.company_id})
    returning *
  `;
  return result[0];
}

export async function listCustomerAddressesById(customerId) {
  const rows = await sql`
    select * from client_addresses
    where client_id = ${customerId}
    order by created_at desc
  `;
  return rows ?? [];
}