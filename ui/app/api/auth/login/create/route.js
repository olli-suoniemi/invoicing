// app/api/auth/login/create/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { apiURL } from "@/utils/apiUrl";

export async function POST(req) {
  try {
    const { idToken, email } = await req.json().catch(() => ({}));

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const resp = await fetch(`${apiURL}/v1/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`, // backend reads this
      },
      body: JSON.stringify({ email }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return NextResponse.json(
        { error: data.error || "Upsert failed" },
        { status: resp.status },
      );
    }

    // backend returns the user object
    return NextResponse.json({ ok: true, user: data });
  } catch (err) {
    console.error("[api/auth/login/create] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
