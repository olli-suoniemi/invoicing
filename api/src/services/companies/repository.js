// services/companies/repository.js
import { sql } from "../../util/databaseConnect.js";

export async function getMainCompanyByUserId(id) {
  const rows = await sql`select * from user_org_roles where user_id = ${id} and is_main = true limit 1`;
  return rows[0] ?? null;
}