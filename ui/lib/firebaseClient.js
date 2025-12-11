// lib/firebaseClient.js  (browser)
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

export const auth = getAuth(app);

if (process.env.NEXT_PUBLIC_USE_EMULATOR === "1") {
  // This URL is from the browser’s perspective, not Docker’s
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
}
