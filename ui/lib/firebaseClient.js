// lib/firebaseClient.js  (browser)
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const app = initializeApp({
  apiKey: "fake",
  authDomain: "invoicing.firebaseapp.com",
  projectId: "invoicing",
});

export const auth = getAuth(app);

if (process.env.NEXT_PUBLIC_USE_EMULATOR === "1") {
  // This URL is from the browser’s perspective, not Docker’s
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
}
