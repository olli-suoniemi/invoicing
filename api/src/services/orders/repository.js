// services/orders/repository.js
import { sql } from "../../util/databaseConnect.js";

export async function getOrdersByCompanyId(companyId) {
  const result = await sql`
    select o.id, o.customer_id,	o.company_id, o.order_date, o.total_amount, o.status, o.created_at, o.updated_at, c.name as customer_name from orders o 
    join customers c on o.customer_id = c.id 
    WHERE o.company_id = ${companyId}
  `;
  return result || null;
}

export async function getOrderById(id) {
  const order = await sql`
    select o.total_amount_vat_incl, o.id, o.customer_id,	o.company_id, o.order_date, o.total_amount, o.status, o.created_at, o.updated_at, c.name as customer_name from orders o 
    join customers c on o.customer_id = c.id 
    WHERE o.id = ${id}
  `;

  const items = await sql`
    select o.id, o.quantity, o.unit_price, o.product_id, p.name as product_name, p.tax_rate, o.total_price from order_items o 
    join products p on o.product_id = p.id  
    WHERE o.order_id = ${id}
  `;

  if (order.length > 0) {
    order[0].items = items;
    return order[0];
  }
  return null;
}

export async function createOrder(order) {
  // calculate total tax included amount
  let totalAmountVatIncl = 0;
  for (const item of order.items) {
    const unitPrice = item.unit_price === null || item.unit_price === undefined ? 0 : Number(item.unit_price);
    const quantity = item.quantity ?? 0;
    const taxRate = item.tax_rate === null || item.tax_rate === undefined ? 0 : Number(item.tax_rate);

    const itemTotalExclVat = unitPrice * quantity;
    const itemTotalInclVat = itemTotalExclVat + (itemTotalExclVat * (taxRate / 100));

    totalAmountVatIncl += itemTotalInclVat;
  }

  order.total_amount_vat_incl = totalAmountVatIncl;

  const result = await sql`
    INSERT INTO orders (customer_id, company_id, total_amount, total_amount_vat_incl, status, order_date, created_at)
    VALUES (${order.customer_id}, ${order.company_id}, ${order.total_amount}, ${order.total_amount_vat_incl}, ${order.status}, now(), now())
    RETURNING *
  `;

  const newOrder = result[0];

  for (const item of order.items) {
    await sql`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at)
      VALUES (${newOrder.id}, ${item.product_id}, ${item.quantity}, ${item.unit_price}, ${item.total_price}, now())
    `;
  }

  return newOrder;
};

export async function updateOrderById(order) {
  // calculate total tax included amount
  let totalAmountVatIncl = 0;
  for (const item of order.items) {
    const unitPrice = item.unit_price === null || item.unit_price === undefined ? 0 : Number(item.unit_price);
    const quantity = item.quantity ?? 0;
    const taxRate = item.tax_rate === null || item.tax_rate === undefined ? 0 : Number(item.tax_rate);

    const itemTotalExclVat = unitPrice * quantity;
    const itemTotalInclVat = itemTotalExclVat + (itemTotalExclVat * (taxRate / 100));

    totalAmountVatIncl += itemTotalInclVat;
  }

  order.total_amount_vat_incl = totalAmountVatIncl;

  // 1) Update the order itself
  const result = await sql`
    UPDATE orders
    SET
      customer_id = coalesce(${order.customer_id}, customer_id),
      total_amount = coalesce(${order.total_amount}, total_amount),
      total_amount_vat_incl = coalesce(${order.total_amount_vat_incl}, total_amount_vat_incl),
      status = coalesce(${order.status}, status),
      updated_at = now()
    WHERE id = ${order.id}
    RETURNING *
  `;
  
  // 2) Load existing items for this order
  const existingItemsRes = await sql`
    SELECT id
    FROM order_items
    WHERE order_id = ${order.id}
  `;
  const existingIds = existingItemsRes.map((row) => row.id);

  // 3) Collect IDs coming from the client
  const incomingIds = (order.items || [])
    .map((item) => item.id)
    .filter((id) => !!id);

  // 4) Delete items that are no longer present
  const idsToDelete = existingIds.filter(
    (existingId) => !incomingIds.includes(existingId),
  );

  for (const idToDelete of idsToDelete) {
    await sql`
      DELETE FROM order_items
      WHERE id = ${idToDelete} AND order_id = ${order.id}
    `;
  }

  // 5) Upsert each incoming item
  for (const item of order.items || []) {
    if (item.id) {
      // Existing item -> UPDATE
      await sql`
        UPDATE order_items
        SET
          product_id = coalesce(${item.product_id}, product_id),
          quantity   = coalesce(${item.quantity},   quantity),
          unit_price = coalesce(${item.unit_price}, unit_price),
          total_price = coalesce(${item.total_price}, total_price),
          updated_at = now()
        WHERE id = ${item.id} AND order_id = ${order.id}
      `;
    } else {
      // New item -> INSERT
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at, updated_at)
        VALUES (${order.id}, ${item.product_id}, ${item.quantity}, ${item.unit_price}, ${item.total_price}, now(), now())
      `;
    }
  }

  // 6) Return fresh order with items
  return getOrderById(order.id);
}