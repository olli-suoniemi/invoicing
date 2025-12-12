// app/orders/[id]/invoice-preview/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const InvoicePdfPreview = dynamic(
  () => import('@/components/InvoicePdfPreview'),
  { ssr: false }
);

export default function OrderInvoicePreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      const res = await fetch(`/api/orders/${id}/invoice`);
      if (!res.ok) return; // add error handling as you like
      const data = await res.json();
      setOrder(data.order ?? null);
    })();
  }, [id]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ladataan tilausta…</p>
      </div>
    );
  }

  return <InvoicePdfPreview order={order} />;
}
