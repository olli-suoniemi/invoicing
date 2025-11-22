// services/orders/repository.js
import { sql } from "../../util/databaseConnect.js";

export async function getOrdersByCompanyId(companyId) {
  const result = await sql`
    SELECT *
    FROM orders
    WHERE company_id = ${companyId}
  `;
  return result[0] || null;
}

export async function getOrderById(id) {
  const order = await sql`
    SELECT *
    FROM orders
    WHERE id = ${id}
  `;

  const items = await sql`
    SELECT *
    FROM order_items
    WHERE order_id = ${id}
  `;

  if (order.length > 0) {
    order[0].items = items;
    return order[0];
  }
  return null;
}