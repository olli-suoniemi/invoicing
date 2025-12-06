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

  const r = await fetch(`${apiURL}/v1/invoices/${id}`, {
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
  const invoice = data.invoice;

  if (!invoice) {
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    );
  }

  invoice.customer_name = invoice.customer.name;
  invoice.customer_business_id = invoice.customer.business_id;
  invoice.customer_email = invoice.customer.email;
  invoice.customer_phone = invoice.customer.phone;
  for ( const addr of invoice.customer.addresses || [] ) {
    if ( addr.type === 'invoicing' ) {
      invoice.customer_address = addr.address;
      invoice.customer_postal_code = addr.postal_code;
      invoice.customer_city = addr.city;
      invoice.customer_state = addr.state;
      invoice.customer_country = addr.country;
    }
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
    invoice.company_name = companyData.company.name;
    invoice.company_business_id = companyData.company.business_id;
    invoice.company_email = companyData.company.email;
    invoice.company_phone = companyData.company.phone;
    invoice.company_website = companyData.company.website;
    invoice.company_address = companyData.company.invoicingAddress.address;
    invoice.company_postal_code = companyData.company.invoicingAddress.postal_code;
    invoice.company_city = companyData.company.invoicingAddress.city;
    invoice.company_state = companyData.company.invoicingAddress.state;
    invoice.company_country = companyData.company.invoicingAddress.country;
    invoice.company_iban = companyData.company.iban;
  } else {
    invoice.company_name = 'Unknown Company';
  }


  // ---- Build pankkiviivakoodi string (54 digits) ----
  const barcodeData = buildFinnishBankBarcode({
    iban: invoice.company_iban ?? 'FI5810171000000122',           // e.g. "FI58 1017 1000 0001 22"
    amount: invoice.total_amount_vat_incl ?? 304.35, // e.g. 482.99
    reference: invoice.reference ?? '123453', // national or RF
    dueDate: invoice.due_date ?? '2024-06-30',
  });

  console.log('Generated pankkiviivakoodi data string:', barcodeData); // --- IGNORE ---

  invoice.barcodeData = barcodeData;

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

  console.log('Invoice', invoice.order.items); // --- IGNORE ---
  // ---- Render PDF ----
  const buffer = await renderToBuffer(
    <InvoicePdfDocument
      invoice={invoice}
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