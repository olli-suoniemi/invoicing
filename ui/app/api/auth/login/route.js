// app/api/auth/login/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  // If emulator env var is present, use it. No creds needed, just projectId.
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    // IMPORTANT: from the container, this must be the emulator's container host (e.g. firebase_auth:9099)
    admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || "invoicing" });
  } else {
    // Production / non-emulator
    admin.initializeApp();
  }
}

export async function POST(req) {
  try {
    const { idToken } = await req.json().catch(() => ({}));
    if (!idToken) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const expiresInMs = 7 * 24 * 60 * 60 * 1000;
    const session = await admin.auth().createSessionCookie(idToken, { expiresIn: expiresInMs });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("session", session, {
      httpOnly: true,
      secure: true,       // local http; set true in prod (https)
      sameSite: "lax",
      path: "/",
      maxAge: expiresInMs / 1000,
    });
    return res;
  } catch (err) {
    console.error("[api/auth] session error:", err);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
