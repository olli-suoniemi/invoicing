import admin from "firebase-admin";
import { config } from "./firebase_config.js";

if (!admin.apps.length) {
  // If using emulator, no credentials needed, just provide projectId
  if (config.firebaseEmulatorHost) {
    admin.initializeApp({ projectId: config.firebaseProjectId });
  } else {
    // Real Firebase via ADC or service account if ever used
    if (config.firebase_service_json) {
      const serviceAccount = JSON.parse(config.firebase_service_json);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      console.warn("No Firebase service account JSON provided.");
    }
  }
}

export const firebaseAdmin = admin;
