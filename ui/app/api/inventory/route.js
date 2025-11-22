// app/api/inventory/route.js (proxy)
import { NextResponse } from "next/server";
import { apiURL } from "@/utils/apiUrl";

export async function GET(req) {
  // Middleware has attached it for protected paths
  const authz = req.headers.get("authorization");
  if (!authz) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resp = await fetch(`${apiURL}/v1/inventory`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: authz, // forward as-is
    },
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    return NextResponse.json({ error: err.error || "Upstream error" }, { status: resp.status });
  }

  const data = await resp.json();
  return NextResponse.json({ inventory: data.inventory });
}

export async function POST(req) {
  // Middleware has attached it for protected paths
  const authz = req.headers.get("authorization");
  if (!authz) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const resp = await fetch(`${apiURL}/v1/inventory`, {
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
  return NextResponse.json({ inventory: data.inventory });
}