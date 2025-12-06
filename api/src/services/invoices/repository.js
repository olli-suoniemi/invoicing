// services/invoices/repository.js
import { sql } from "../../util/databaseConnect.js";

export async function createInvoice(invoiceData) {
  const result = await sql`
    INSERT INTO invoices 
      (order_id, customer_id, company_id, total_amount_vat_excl, total_amount_vat_incl)
    VALUES 
      (${invoiceData.order_id}, ${invoiceData.customer_id}, ${invoiceData.company_id}, 
       ${invoiceData.total_amount_vat_excl}, ${invoiceData.total_amount_vat_incl})
    RETURNING *;
  `;
  return result[0];
}

export async function getInvoiceById(id) {
  const result = await sql`
    SELECT * FROM invoices WHERE id = ${id};
  `;
  return result[0] || null;
}

export async function listCompanyInvoices(limit = 50) {
  const result = await sql`
    SELECT invoices.*, c.name as customer_name FROM invoices
    join customers c on invoices.customer_id = c.id 
    ORDER BY created_at DESC
    LIMIT ${limit};
  `;
  return result;
}

export async function updateInvoiceById(updateData) {
  await sql`
    UPDATE invoices
    SET
      reference = coalesce(${updateData.reference}, reference),
      issue_date = coalesce(${updateData.issue_date}, issue_date),
      days_until_due = coalesce(${updateData.days_until_due}, days_until_due),
      due_date = coalesce(${updateData.due_date}, due_date),
      delivery_date = coalesce(${updateData.delivery_date}, delivery_date),
      extra_info = coalesce(${updateData.extra_info}, extra_info),
      show_info_on_invoice = coalesce(${updateData.show_info_on_invoice}, show_info_on_invoice),
      updated_at = now()
    WHERE id = ${updateData.id};
  `;
}