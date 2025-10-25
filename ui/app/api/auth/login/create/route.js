// app/api/auth/login/create/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { apiURL } from "@/utils/apiUrl";

if (!admin.apps.length) {
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || "invoicing" });
  } else {
    admin.initializeApp();
  }
}

export async function POST(req) {
  try {
    const { idToken, email } = await req.json().catch(() => ({}));
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Verify the token on the server (good practice)
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Call your API to upsert the user
    const resp = await fetch(`${apiURL}/v1/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // IMPORTANT: pass the original Firebase ID token to your API
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        // Whatever minimal profile you want to persist
        uid: decoded.uid,
        email: email || decoded.email || ""
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return NextResponse.json({ error: err.error || "Upsert failed" }, { status: resp.status });
    }

    const data = await resp.json();
    return NextResponse.json({ ok: true, user: data });
  } catch (err) {
    console.error("[api/auth/login/create] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
