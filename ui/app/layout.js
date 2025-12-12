// app/layout.jsx
import NavBarWrapper from './components/NavBarWrapper';
import { ToastProvider } from './components/toastProvider';  
import './globals.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <NavBarWrapper />
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
