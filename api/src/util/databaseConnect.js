import { postgres } from "../deps.js";

const PGUSER = Deno.env.get("PGUSER");
const PGPASSWORD = Deno.env.get("PGPASSWORD");
const PGDATABASE = Deno.env.get("PGDATABASE");
const PGHOST = Deno.env.get("PGHOST");
const PGPORT = Deno.env.get("PGPORT");

let sql;

try {
  sql = postgres({
    user: PGUSER,
    password: PGPASSWORD,
    database: PGDATABASE,
    host: PGHOST,
    port: parseInt(PGPORT, 10),
  });
} catch (error) {
  console.error("Error during database setup:", error);
  throw error;
}

// Test the connection
try {
  await sql`SELECT 1;`;
  console.log("Database connection successful!");
} catch (err) {
  console.error("Database connection failed:", err.message);
}

export { sql };