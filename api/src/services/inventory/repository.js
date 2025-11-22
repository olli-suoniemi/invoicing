// services/inventory/repository.js
import { sql } from "../../util/databaseConnect.js";

export async function getInventoryItemById(id) {
  const rows = await sql`select * from products where id = ${id} limit 1`;
  return rows[0] ?? null;
}

export async function listCompanyInventoryById(companyId, limit = 50) {
  const rows = await sql`
    select * from products
    where company_id = ${companyId}
    order by created_at desc
    limit ${limit}
  `;
  return rows ?? [];
}

export async function createInventoryItem(item) {
  // Create new address record

  const result = await sql`
    insert into products (name, ean_code, description, unit_price, tax_rate, company_id)
    values (${item.name}, ${item.ean_code}, ${item.description}, ${item.unit_price}, ${item.tax_rate}, ${item.company_id})
    returning *
  `;
  return result[0];
}