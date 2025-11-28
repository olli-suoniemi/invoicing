// app/api/invoices/[id]/route.js
import { NextResponse } from 'next/server';
import { apiURL } from '@/utils/apiUrl';

export async function GET(req, { params }) {
  const authz = req.headers.get('authorization');
  if (!authz) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const r = await fetch(`${apiURL}/v1/invoices/${id}`, {
    headers: { 'Content-Type': 'application/json', Authorization: authz },
  });

  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    return NextResponse.json({ error: e.error || 'Upstream error' }, { status: r.status });
  }

  const data = await r.json();
  return NextResponse.json({ invoice: data.invoice });
}

export async function PUT(req, { params }) {
  const authz = req.headers.get('authorization');
  if (!authz) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  
  const { id } = await params;

  const r = await fetch(`${apiURL}/v1/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: authz },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    return NextResponse.json({ error: e.error || 'Upstream error' }, { status: r.status });
  }

  const invoice = await r.json();
  return NextResponse.json({ invoice });
}
