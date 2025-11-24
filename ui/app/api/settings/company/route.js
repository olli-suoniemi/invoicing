// app/api/settings/company/route.js (proxy)
import { NextResponse } from "next/server";
import { apiURL } from "@/utils/apiUrl";

export async function GET(req) {
  // Middleware has attached it for protected paths
  const authz = req.headers.get("authorization");
  if (!authz) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resp = await fetch(`${apiURL}/v1/company`, {
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
  return NextResponse.json({ company: data.company });
}

export async function PUT(req) {
  const authz = req.headers.get('authorization');
  if (!authz) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const r = await fetch(`${apiURL}/v1/company`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: authz },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    return NextResponse.json({ error: e.error || 'Upstream error' }, { status: r.status });
  }

  const company = await r.json();
  return NextResponse.json({ company });
}