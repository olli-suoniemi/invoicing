const decoder = new TextDecoder("utf-8");
const ENV = Deno.env.get("ENV") ?? "local";

function readSecret(path) {
  try {
    return decoder.decode(Deno.readFileSync(path)).trim();
  } catch {
    return "";
  }
}

export const config = {
  firebaseEmulatorHost:
    ENV === "local"
      ? (Deno.env.get("FIREBASE_AUTH_EMULATOR_HOST") ?? "")
      : "",
      
  firebaseProjectId:
    Deno.env.get("FIREBASE_PROJECT_ID") ?? "",

  adminIds:
    ENV === "local"
      ? (Deno.env.get("ADMIN_IDS") ?? "")
      : readSecret("/run/secrets/CRM_ADMIN_IDS"),

  firebase_service_json:
    ENV === "local"
      ? ""
      : readSecret("/run/secrets/CRM_FIREBASE_SERVICE_JSON"),
};
