const decoder = new TextDecoder("utf-8");
const ENV = Deno.env.get("ENV");

export const config = {
  firebaseEmulatorHost:
    ENV === "local"
      ? Deno.env.get("FIREBASE_AUTH_EMULATOR_HOST") ?? ""
      : "",
  firebaseProjectId: 
    ENV === "local"
      ? Deno.env.get("FIREBASE_PROJECT_ID") ?? ""
      : "",
  adminIds: 
    ENV === "local"
      ? Deno.env.get("ADMIN_IDS") ?? decoder.decode(Deno.readFileSync("/run/secrets/CRM_ADMIN_IDS"))
      : "",
  firebase_service_json:
    ENV === "local"
      ? "" ?? decoder.decode(Deno.readFileSync("/run/secrets/CRM_FIREBASE_SERVICE_JSON"))
      : "",
};
