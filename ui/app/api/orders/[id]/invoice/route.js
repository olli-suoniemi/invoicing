// app/api/orders/[id]/invoice/route.js
import React from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { apiURL } from '@/utils/apiUrl';
import { InvoicePdfDocument } from '@/lib/pdf/InvoicePdfDocument';
import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';
import { buildFinnishBankBarcode } from '@/lib/bankBarcode';
import fs from 'fs';
import path from 'path';

// IMPORTANT: use Node runtime, React PDF Node APIs need Node
export const runtime = 'nodejs';

export async function GET(req, { params }) {
  const authz = req.headers.get('authorization');
  if (!authz) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const r = await fetch(`${apiURL}/v1/orders/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authz,
    },
    cache: 'no-store',
  });

  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    return NextResponse.json(
      { error: e.error || 'Upstream error' },
      { status: r.status }
    );
  }

  const data = await r.json();
  const order = data.order;

  if (!order) {
    return NextResponse.json(
      { error: 'Order not found' },
      { status: 404 }
    );
  }

  // call customer api
  const customerRes = await fetch(`${apiURL}/v1/customers/${order.customer_id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authz,
    },
    cache: 'no-store',
  });

  if (customerRes.ok) {
    const customerData = await customerRes.json();
    order.customer_name = customerData.customer.name;
    order.customer_business_id = customerData.customer.business_id;
    order.customer_email = customerData.customer.email;
    order.customer_phone = customerData.customer.phone;
    for ( const addr of customerData.customer.addresses || [] ) {
      if ( addr.type === 'invoicing' ) {
        order.customer_address = addr.address;
        order.customer_postal_code = addr.postal_code;
        order.customer_city = addr.city;
        order.customer_state = addr.state;
        order.customer_country = addr.country;
      }
    }
  } else {
    order.customer_name = 'Unknown Customer';
  }

    // call company api
  const companyRes = await fetch(`${apiURL}/v1/company`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authz,
    },
    cache: 'no-store',
  });

  if (companyRes.ok) {
    const companyData = await companyRes.json();
    order.company_name = companyData.company.name;
    order.company_business_id = companyData.company.business_id;
    order.company_email = companyData.company.email;
    order.company_phone = companyData.company.phone;
    order.company_website = companyData.company.website;
    order.company_address = companyData.company.invoicingAddress.address;
    order.company_postal_code = companyData.company.invoicingAddress.postal_code;
    order.company_city = companyData.company.invoicingAddress.city;
    order.company_state = companyData.company.invoicingAddress.state;
    order.company_country = companyData.company.invoicingAddress.country;
  } else {
    order.company_name = 'Unknown Company';
  }


  // ---- Build pankkiviivakoodi string (54 digits) ----
  const barcodeData = buildFinnishBankBarcode({
    iban: order.company_iban ?? 'FI5810171000000122',           // e.g. "FI58 1017 1000 0001 22"
    amount: order.total_amount_vat_incl ?? 304.35, // e.g. 482.99
    reference: order.payment_reference ?? '123453', // national or RF
    dueDate: order.due_date ?? '2024-06-30',
  });

  console.log('Generated pankkiviivakoodi data string:', barcodeData); // --- IGNORE ---

  order.barcodeData = barcodeData;

  // ---- Generate barcode image with JsBarcode ----
  const canvas = createCanvas(800, 80); // wide canvas for good resolution

  JsBarcode(canvas, barcodeData, {
    format: 'CODE128C',    // important: character set C
    displayValue: false,
    margin: 0,
    height: 50,
  });

  const pngBuffer = canvas.toBuffer('image/png');
  const referenceBarcodeDataUrl =
    'data:image/png;base64,' + pngBuffer.toString('base64');
  
  // ---- Read logo from public/ and turn into data URL ----
  const logoPath = path.join(process.cwd(), 'public', 'apples.png');
  let companyLogoDataUrl = null;
  try {
    const logoBuffer = await fs.promises.readFile(logoPath);
    companyLogoDataUrl =
      'data:image/png;base64,' + logoBuffer.toString('base64');
  } catch (e) {
    console.error('Error reading logo image:', e);
  }

  // ---- Render PDF ----
  const buffer = await renderToBuffer(
    <InvoicePdfDocument
      order={order}
      referenceBarcode={referenceBarcodeDataUrl}
      companyLogo={companyLogoDataUrl}  
    />,
  );


  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="invoice-${id}.pdf"`,
      'Content-Length': buffer.length.toString(),
    },
  });
}