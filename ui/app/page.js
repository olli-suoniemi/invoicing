'use client';

import React from 'react';
import Link from 'next/link';

const tiles = [
  { href: '/customers', label: 'Customers' },
  { href: '/orders', label: 'Orders' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/settings', label: 'Settings' },
];

export default function DashboardPage() {
  return (
    <div className="flex justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl bg-base-100 shadow-lg rounded-md p-5 sm:p-8 lg:p-10 pb-12 sm:pb-16 lg:pb-20">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center mt-8 sm:mt-10">
          {tiles.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="bg-base-300 rounded-md shadow-md hover:shadow-xl transition-shadow duration-300
                         p-6 sm:p-8 lg:p-10
                         min-h-[96px] sm:min-h-[120px]
                         flex items-center justify-center
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <h2 className="text-xl sm:text-2xl font-semibold">{t.label}</h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
