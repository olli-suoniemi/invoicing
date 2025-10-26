// app/api/settings/companies/[id]/users/route.js (proxy)
import { NextResponse } from "next/server";
import { apiURL } from "@/utils/apiUrl";

// Add user to company
export async function POST(req, { params }) {
  // Middleware has attached it for protected paths
  const authz = req.headers.get("authorization");
  if (!authz) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await req.json().catch(() => ({}));

  const resp = await fetch(`${apiURL}/v1/companies/${id}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authz, // forward as-is
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    return NextResponse.json({ error: err.error || "Upstream error" }, { status: resp.status });
  }

  const data = await resp.json();
  return NextResponse.json({ user: data.user });
}

// Remove user from company
export async function DELETE(req, { params }) {
  // Middleware has attached it for protected paths
  const authz = req.headers.get("authorization");
  if (!authz) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const userId = body.userId;

  const resp = await fetch(`${apiURL}/v1/companies/${id}/users`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: authz, // forward as-is
    },
    body: JSON.stringify({ userId }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    return NextResponse.json({ error: err.error || "Upstream error" }, { status: resp.status });
  }

  const data = await resp.json();
  return NextResponse.json({ user: data.user });
}