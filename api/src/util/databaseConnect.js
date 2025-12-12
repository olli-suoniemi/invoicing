import { postgres } from "../deps.js";

const decoder = new TextDecoder("utf-8");
const ENV = Deno.env.get("ENV") ?? "local";
const isLocal = ENV === "local";

function readSecret(path) {
  try {
    return decoder.decode(Deno.readFileSync(path)).trim();
  } catch {
    return "";
  }
}

const PGUSER = isLocal
  ? (Deno.env.get("PGUSER") ?? "")
  : readSecret("/run/secrets/CRM_PGUSER");

const PGPASSWORD = isLocal
  ? (Deno.env.get("PGPASSWORD") ?? "")
  : readSecret("/run/secrets/CRM_PGPASSWORD");

const PGDATABASE = isLocal
  ? (Deno.env.get("PGDATABASE") ?? "")
  : readSecret("/run/secrets/CRM_PGDATABASE");

const PGHOST = isLocal
  ? (Deno.env.get("PGHOST") ?? "")
  : readSecret("/run/secrets/CRM_PGHOST");

const PGPORT = isLocal
  ? (Deno.env.get("PGPORT") ?? "")
  : readSecret("/run/secrets/CRM_PGPORT");

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

try {
  await sql`SELECT 1;`;
  console.log("Database connection successful!");
} catch (err) {
  console.error("Database connection failed:", err.message);
}

export { sql };
