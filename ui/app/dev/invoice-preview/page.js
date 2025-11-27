// app/dev/invoice-preview/page.jsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Avoid SSR for PDFViewer
const InvoicePdfPreview = dynamic(
  () => import('@/components/InvoicePdfPreview'),
  { ssr: false }
);

export default function InvoicePreviewPage() {
  // Mock order data for layout development
  const mockOrder = {
    id: '2025-258',
    invoice_number: '2025-258',
    order_date: '2025-02-10T00:00:00.000Z',
    due_date: '2025-02-24T00:00:00.000Z',
    company_name: 'Yritys Oy',
    company_address: 'Katu 1',
    company_postal_code: '00100',
    company_city: 'Helsinki',
    company_email: 'info@yritys.fi',
    company_website: 'https://yritys.fi',
    company_business_id: 'Y-tunnus: 1234567-8',
    company_iban: 'FI12 3456 7890 1234 56',
    company_bic: 'NDEAFIHH',
    customer_name: 'Matti Meikäläinen',
    customer_address: 'Esimerkkikatu 10',
    customer_postal_code: '00200',
    customer_city: 'Helsinki',
    payment_reference: '12345 67890 12345',
    tax_rate: 24,
    total_amount: 100,
    total_amount_vat_incl: 124,
    items: [
      {
        id: '1',
        product_name: 'Palvelu A',
        quantity: 2,
        unit_price: 50,
        tax_rate: 24,
      },
    ],
  };

  return <InvoicePdfPreview order={mockOrder} />;
}
