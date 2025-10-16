// services/invoices/repository.js
import { sql } from "../../util/databaseConnect.js";

export async function getInvoiceById(id) {
  const rows = await sql`select * from invoices where id = ${id} limit 1`;
  return rows[0] ?? null;
}

export async function listCompanyInvoices(companyId, limit = 50) {
  const rows = await sql`
    select * from invoices
    where company_id = ${companyId}
    order by created_at desc
    limit ${limit}
  `;
  return rows ?? [];
}

export async function updateInvoicePaid(id, paid) {
  const rows = await sql`
    update invoices
    set paid = ${paid}, updated_at = now()
    where id = ${id}
    returning *
  `;
  return rows[0] ?? null;
}
