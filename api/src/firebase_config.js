// firebase_config.js
const decoder = new TextDecoder("utf-8");
const ENV = Deno.env.get("ENV") ?? "local";

export const config = {
  firebaseEmulatorHost:
    ENV === "local" && Deno.env.get("USE_FIREBASE_EMULATOR") === "1"
      ? Deno.env.get("FIREBASE_AUTH_EMULATOR_HOST") ?? ""
      : "",

  firebaseProjectId:
    Deno.env.get("FIREBASE_PROJECT_ID") ?? "invoicing",

  adminIds:
    (Deno.env.get("ADMIN_IDS") ??
      decoder.decode(Deno.readFileSync("/run/secrets/CRM_ADMIN_IDS") ?? new Uint8Array()))
      .toString(),

  firebase_service_json:
    // in prod this comes from the Docker secret;
    // in local from env var
    ENV === "local"
      ? Deno.env.get("FIREBASE_SERVICE_JSON") ?? ""
      : decoder.decode(Deno.readFileSync("/run/secrets/CRM_FIREBASE_SERVICE_JSON")),
};
