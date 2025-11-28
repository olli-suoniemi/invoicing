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