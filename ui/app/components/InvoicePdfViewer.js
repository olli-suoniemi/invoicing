// components/InvoicePdfViewer.jsx
import dynamic from 'next/dynamic';

const InvoicePdfViewer = dynamic(
  () => import('./InvoicePdfViewerInner'),
  { ssr: false } // IMPORTANT: react-pdf needs the browser
);

export default InvoicePdfViewer;
