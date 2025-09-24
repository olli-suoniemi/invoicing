export const config = {
  firebaseEmulatorHost: Deno.env.get("FIREBASE_AUTH_EMULATOR_HOST") ?? "",
  firebaseProjectId: Deno.env.get("FIREBASE_PROJECT_ID") ?? "",
};
