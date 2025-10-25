// services/invoices/repository.js
import { sql } from "../../util/databaseConnect.js";

export async function getCustomerById(id) {
  const rows = await sql`select * from customers where id = ${id} limit 1`;
  return rows[0] ?? null;
}

export async function listCompanyCustomers(companyId, limit = 50) {
  const rows = await sql`
    select * from customers
    where company_id = ${companyId}
    order by created_at desc
    limit ${limit}
  `;
  return rows ?? [];
}

export async function createCustomer(customer) {
  // Create new address record

  const result = await sql`
    insert into customers (name, email, company_id, owner_uid)
    values (${customer.name}, ${customer.email}, ${customer.company_id}, ${customer.owner_uid})
    returning *
  `;
  return result[0];
}
