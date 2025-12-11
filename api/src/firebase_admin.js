// src/firebase_admin.js
import admin from "firebase-admin";
import { config } from "./firebase_config.js";

const ENV = Deno.env.get("ENV") ?? "local";

if (!admin.apps.length) {
  // LOCAL DEV + emulator
  if (ENV === "local" && config.firebaseEmulatorHost) {
    console.log(
      "[firebase_admin] Using Firebase Auth emulator at",
      config.firebaseEmulatorHost,
    );

    // This is what tells the Admin SDK to talk to the emulator
    Deno.env.set("FIREBASE_AUTH_EMULATOR_HOST", config.firebaseEmulatorHost);

    admin.initializeApp({
      projectId: config.firebaseProjectId,
    });
  } else if (config.firebase_service_json) {
    // REAL Firebase via service account (prod / non-emulator)
    console.log("[firebase_admin] Using Firebase service account JSON");
    const serviceAccount = JSON.parse(config.firebase_service_json);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.warn(
      "[firebase_admin] No service account JSON provided; using default credentials",
    );
    admin.initializeApp();
  }
}

export const firebaseAdmin = admin;
