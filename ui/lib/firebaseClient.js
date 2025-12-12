// lib/firebaseClient.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

let app = null;
let auth = null;

// Only initialize in the browser (not during SSR / build)
if (typeof window !== "undefined") {
  if (!firebaseConfig.apiKey) {
    console.warn(
      "Missing NEXT_PUBLIC_FIREBASE_API_KEY – Firebase Auth not initialized"
    );
  } else {
    // 1) App instance (reuse if already initialized)
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);

    // 2) Auth instance
    auth = getAuth(app);

    // 3) Optional emulator in local dev
    if (process.env.NEXT_PUBLIC_USE_EMULATOR === "1") {
      connectAuthEmulator(auth, "http://localhost:9099", {
        disableWarnings: true,
      });
    }
  }
}

// Export may be null during SSR – only use in "use client" components
export { auth };
