// app/api/invoices/[id]/print/route.js

import { NextResponse } from 'next/server';
import { generateInvoicePdfBuffer } from '@/lib/pdf/generateInvoicePdf';

export const runtime = 'nodejs';

export async function GET(req, { params }) {
  const authz = req.headers.get('authorization');
  if (!authz) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const buffer = await generateInvoicePdfBuffer({ id, authz });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="invoice-${id}.pdf"`,
      'Content-Length': buffer.length.toString(),
    },
  });
}
