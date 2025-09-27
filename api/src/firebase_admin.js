import admin from "firebase-admin";
import { config } from "./firebase_config.js";

if (!admin.apps.length) {
  // If using emulator, no credentials needed, just provide projectId
  if (config.firebaseEmulatorHost) {
    admin.initializeApp({ projectId: config.firebaseProjectId });
  } else {
    // Real Firebase via ADC or service account if ever used
    admin.initializeApp();
  }
}

export const firebaseAdmin = admin;
