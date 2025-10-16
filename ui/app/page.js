'use client';

import React from 'react';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';

export default function DashboardPage() {

  return (
    <div className="flex justify-center py-10">
      <div className="w-full max-w-6xl p-8 pb-20 bg-base-100 shadow-lg rounded-md">
        <h1 className="text-4xl font-bold mb-6 text-center">Dashboard</h1>

        <ToastContainer newestOnTop closeOnClick={true} />
        
        <div className="grid grid-cols-3 gap-20 text-center">
          <Link
            href={"/customers"}
            className="p-10 rounded-md shadow-md cursor-pointer focus:outline-none bg-base-300 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-semibold">Customers</h2>
            </div>
          </Link>

          <Link
            href="/sales"
            className="p-10 rounded-md shadow-md cursor-pointer focus:outline-none bg-base-300 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-semibold">Sales</h2>
            </div>
          </Link>

          <Link
            href="/inventory"
            className="p-10 rounded-md shadow-md cursor-pointer focus:outline-none bg-base-300 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-semibold">Inventory</h2>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
