import { postgres } from "../deps.js";

const decoder = new TextDecoder("utf-8");

const ENV = Deno.env.get("ENV");

const PGUSER = ENV === "local" ? Deno.env.get("PGUSER") : "" ?? decoder.decode(Deno.readFileSync("/run/secrets/CRM_PGUSER")) ?? "";
const PGPASSWORD = ENV === "local" ? Deno.env.get("PGPASSWORD") : "" ?? decoder.decode(Deno.readFileSync("/run/secrets/CRM_PGPASSWORD")) ?? "";
const PGDATABASE = ENV === "local" ? Deno.env.get("PGDATABASE") : "" ?? decoder.decode(Deno.readFileSync("/run/secrets/CRM_PGDATABASE")) ?? "";
const PGHOST = ENV === "local" ? Deno.env.get("PGHOST") : "" ?? decoder.decode(Deno.readFileSync("/run/secrets/CRM_PGHOST")) ?? "";
const PGPORT = ENV === "local" ? Deno.env.get("PGPORT") : "" ?? decoder.decode(Deno.readFileSync("/run/secrets/CRM_PGPORT")) ?? "";
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