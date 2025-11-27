// components/InvoicePdfPreview.js
'use client';

import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { InvoicePdfDocument } from '@/lib/pdf/InvoicePdfDocument';

export default function InvoicePdfPreview({ order }) {
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <InvoicePdfDocument order={order} />
    </PDFViewer>
  );
}
