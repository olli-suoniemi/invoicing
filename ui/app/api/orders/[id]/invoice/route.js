// app/api/orders/[id]/invoice/route.js
import React from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { apiURL } from '@/utils/apiUrl';
import { InvoicePdfDocument } from '@/lib/pdf/InvoicePdfDocument';

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
  
  console.log('Using order data for PDF:', order);
  // Generate the PDF as a Node Buffer
  const buffer = await renderToBuffer(
    <InvoicePdfDocument order={order} />
  );

  // Return as real PDF response
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="invoice-${id}.pdf"`,
      'Content-Length': buffer.length.toString(),
    },
  });
}
