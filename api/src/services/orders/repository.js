// services/orders/repository.js
import { sql } from "../../util/databaseConnect.js";

export async function getOrdersByCompanyId(companyId) {
  const result = await sql`
    select o.id, o.order_number, o.customer_id,	o.company_id, o.order_date, o.total_amount_vat_excl, o.total_amount_vat_incl, o.extra_info, o.status, o.created_at, o.updated_at, c.name as customer_name from orders o 
    join customers c on o.customer_id = c.id 
    WHERE o.company_id = ${companyId}
  `;
  return result || null;
}

export async function getOrderById(id) {
  const order = await sql`
    select o.total_amount_vat_incl, o.order_number, o.id, o.customer_id,	o.company_id, o.order_date, o.total_amount_vat_excl, o.total_amount_vat_incl, o.extra_info, o.status, o.created_at, o.updated_at, c.name as customer_name from orders o 
    join customers c on o.customer_id = c.id 
    WHERE o.id = ${id}
  `;

  const items = await sql`
    select o.id, o.quantity, o.unit_price_vat_excl, o.unit_price_vat_incl, o.product_id, p.name as product_name, p.ean_code, p.tax_rate, o.total_price_vat_excl, o.total_price_vat_incl from order_items o 
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
  let totalAmountVatExcl = 0;
  for (const item of order.items) {
    const quantity = Number(item.quantity ?? 0);
    const unitPriceVatExcl = Number(item.unit_price_vat_excl ?? 0);
    const taxRate = Number(item.tax_rate ?? 0); // e.g. 24 for 24%

    // derive unit price incl. VAT
    const unitPriceVatInclRaw = unitPriceVatExcl * (1 + taxRate / 100);
    const unitPriceVatIncl = Math.round(unitPriceVatInclRaw * 100) / 100; // 2 decimals

    const itemTotalExclVat = unitPriceVatExcl * quantity;
    const itemTotalInclVat = unitPriceVatIncl * quantity;

    // update item object so SQL uses consistent values
    item.unit_price_vat_incl = unitPriceVatIncl;
    item.total_price_vat_excl = itemTotalExclVat;
    item.total_price_vat_incl = itemTotalInclVat;

    totalAmountVatExcl += itemTotalExclVat;
    totalAmountVatIncl += itemTotalInclVat;
  }

  order.total_amount_vat_excl = totalAmountVatExcl;
  order.total_amount_vat_incl = totalAmountVatIncl;

  const result = await sql`
    INSERT INTO orders (customer_id, company_id, total_amount_vat_excl, total_amount_vat_incl, status, extra_info, order_date, created_at)
    VALUES (${order.customer_id}, ${order.company_id}, ${order.total_amount_vat_excl}, ${order.total_amount_vat_incl}, ${order.status}, ${order.extra_info}, ${order.order_date}, now())
    RETURNING *
  `;

  const newOrder = result[0];

  for (const item of order.items) {
    await sql`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price_vat_excl, unit_price_vat_incl, total_price_vat_excl, total_price_vat_incl, created_at)
      VALUES (${newOrder.id}, ${item.product_id}, ${item.quantity}, ${item.unit_price_vat_excl}, ${item.unit_price_vat_incl}, ${item.total_price_vat_excl}, ${item.total_price_vat_incl}, now())
    `;
  }

  return newOrder;
};

export async function updateOrderById(order) {
  // calculate total tax included amount
  let totalAmountVatIncl = 0;
  let totalAmountVatExcl = 0;

  for (const item of order.items || []) {
    const quantity = Number(item.quantity ?? 0);
    const unitPriceVatExcl = Number(item.unit_price_vat_excl ?? 0);
    const taxRate = Number(item.tax_rate ?? 0); // e.g. 24 for 24%

    // derive unit price incl. VAT
    const unitPriceVatInclRaw = unitPriceVatExcl * (1 + taxRate / 100);
    const unitPriceVatIncl = Math.round(unitPriceVatInclRaw * 100) / 100; // 2 decimals

    const itemTotalExclVat = unitPriceVatExcl * quantity;
    const itemTotalInclVat = unitPriceVatIncl * quantity;

    // update item object so SQL uses consistent values
    item.unit_price_vat_incl = unitPriceVatIncl;
    item.total_price_vat_excl = itemTotalExclVat;
    item.total_price_vat_incl = itemTotalInclVat;

    totalAmountVatExcl += itemTotalExclVat;
    totalAmountVatIncl += itemTotalInclVat;
  }

  order.total_amount_vat_incl = totalAmountVatIncl;
  order.total_amount_vat_excl = totalAmountVatExcl;

  // 1) Update the order itself
  const result = await sql`
    UPDATE orders
    SET
      customer_id = coalesce(${order.customer_id}, customer_id),
      total_amount_vat_excl = coalesce(${order.total_amount_vat_excl}, total_amount_vat_excl),
      total_amount_vat_incl = coalesce(${order.total_amount_vat_incl}, total_amount_vat_incl),
      extra_info = coalesce(${order.extra_info}, extra_info),
      order_date = coalesce(${order.order_date}, order_date),
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
          unit_price_vat_excl   = coalesce(${item.unit_price_vat_excl}, unit_price_vat_excl),
          unit_price_vat_incl   = coalesce(${item.unit_price_vat_incl}, unit_price_vat_incl),
          total_price_vat_excl  = coalesce(${item.total_price_vat_excl}, total_price_vat_excl),
          total_price_vat_incl  = coalesce(${item.total_price_vat_incl}, total_price_vat_incl),
          updated_at = now()
        WHERE id = ${item.id} AND order_id = ${order.id}
      `;
    } else {
      // New item -> INSERT
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price_vat_excl, unit_price_vat_incl, total_price_vat_excl, total_price_vat_incl, created_at, updated_at)
        VALUES (
          ${order.id},
          ${item.product_id},
          ${item.quantity},
          ${item.unit_price_vat_excl},
          ${item.unit_price_vat_incl},
          ${item.total_price_vat_excl},
          ${item.total_price_vat_incl},
          now(),
          now()
        )
      `;
    }
  }

  // 6) Return fresh order with items
  return getOrderById(order.id);
}

export async function setCompleted(id) {
  const result = await sql`
    UPDATE orders
    SET status = 'completed',
        updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}