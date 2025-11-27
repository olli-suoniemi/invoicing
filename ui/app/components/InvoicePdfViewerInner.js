// components/InvoicePdfViewerInner.jsx
'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker (must be in same file as <Document />)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function InvoicePdfViewerInner({ file }) {
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={console.error}
      >
        {Array.from(new Array(numPages || 0), (_, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={800} 
          />
        ))}
      </Document>

      <p>Pages: {numPages ?? '—'}</p>
    </div>
  );
}
