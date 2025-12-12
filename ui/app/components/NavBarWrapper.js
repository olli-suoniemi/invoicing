// app/components/NavBarWrapper.jsx
'use client';

import { usePathname } from 'next/navigation';
import NavBar from './navBar';

export default function NavBarWrapper() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/register') return null;
  return <NavBar />;
}
