import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

import { InvoicePdfDocument } from '@/lib/pdf/InvoicePdfDocument';
import { buildFinnishBankBarcode } from '@/lib/bankBarcode';
import { apiURL } from '@/utils/apiUrl';

export async function generateInvoicePdfBuffer({ id, authz }) {
  // fetch invoice
  const r = await fetch(`${apiURL}/v1/invoices/${id}`, {
    headers: { 'Content-Type': 'application/json', Authorization: authz },
    cache: 'no-store',
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.error || 'Failed to fetch invoice');
  }
  const { invoice } = await r.json();
  if (!invoice) throw new Error('Invoice not found');

  // map customer fields (same as your /print route)
  invoice.customer_name = invoice.customer.name;
  invoice.customer_business_id = invoice.customer.business_id;
  invoice.customer_email = invoice.customer.email;
  invoice.customer_phone = invoice.customer.phone;

  for (const addr of invoice.customer.addresses || []) {
    if (addr.type === 'invoicing') {
      invoice.customer_address = addr.address;
      invoice.customer_postal_code = addr.postal_code;
      invoice.customer_city = addr.city;
      invoice.customer_state = addr.state;
      invoice.customer_country = addr.country;
    }
  }

  // fetch company
  const companyRes = await fetch(`${apiURL}/v1/company`, {
    headers: { 'Content-Type': 'application/json', Authorization: authz },
    cache: 'no-store',
  });

  if (companyRes.ok) {
    const companyData = await companyRes.json();
    const c = companyData.company;
    invoice.company_name = c.name;
    invoice.company_business_id = c.business_id;
    invoice.company_email = c.email;
    invoice.company_phone = c.phone;
    invoice.company_website = c.website;
    invoice.company_address = c.invoicingAddress.address;
    invoice.company_postal_code = c.invoicingAddress.postal_code;
    invoice.company_city = c.invoicingAddress.city;
    invoice.company_state = c.invoicingAddress.state;
    invoice.company_country = c.invoicingAddress.country;
    invoice.company_iban = c.iban;
  } else {
    invoice.company_name = 'Unknown Company';
  }

  // bank barcode
  const barcodeData = buildFinnishBankBarcode({
    iban: invoice.company_iban ?? 'FI5810171000000122',
    amount: invoice.total_amount_vat_incl ?? 0,
    reference: invoice.reference ?? '',
    dueDate: invoice.due_date ?? '2024-06-30',
  });
  invoice.barcodeData = barcodeData;

  const canvas = createCanvas(800, 80);
  JsBarcode(canvas, barcodeData, {
    format: 'CODE128C',
    displayValue: false,
    margin: 0,
    height: 50,
  });
  const pngBuffer = canvas.toBuffer('image/png');
  const referenceBarcodeDataUrl = 'data:image/png;base64,' + pngBuffer.toString('base64');

  // logo
  const logoPath = path.join(process.cwd(), 'public', 'apples.png');
  let companyLogoDataUrl = null;
  try {
    const logoBuffer = await fs.promises.readFile(logoPath);
    companyLogoDataUrl = 'data:image/png;base64,' + logoBuffer.toString('base64');
  } catch {}

  // render pdf
  return await renderToBuffer(
    <InvoicePdfDocument
      invoice={invoice}
      referenceBarcode={referenceBarcodeDataUrl}
      companyLogo={companyLogoDataUrl}
    />
  );
}
