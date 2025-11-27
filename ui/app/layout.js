'use client';  // Mark the layout as a client-side component

// ui/app/layout.js
import NavBar from './components/navBar';
import { usePathname } from 'next/navigation';
import './globals.css'; // Import global styles

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';


export default function RootLayout({ children }) {
  const pathname = usePathname(); // Get the current pathname

  const metadata = {
    icons: {
      icon: "/favicon.ico",  
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={metadata.icons.icon} />
      </head>
      <body>
        {/* Conditionally render NavBar */}
        {/* If the current route is not login or register, show the NavBar */}
        {pathname !== '/login' && pathname !== '/register' && <NavBar />}
        {children} {/* Render the page content */}
      </body>
    </html>
  );
}