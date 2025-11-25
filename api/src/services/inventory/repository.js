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

export async function updateInventoryItemById(item) {
  const result = await sql`
    update products
    set
      name = coalesce(${item.name}, name),
      ean_code = coalesce(${item.ean_code}, ean_code),
      description = coalesce(${item.description}, description),
      unit_price = coalesce(${item.unit_price}, unit_price),
      tax_rate = coalesce(${item.tax_rate}, tax_rate),
      updated_at = now()
    where id = ${item.id}
    returning *
  `;
  return result[0];
} 