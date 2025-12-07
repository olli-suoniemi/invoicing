'use client';

import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaPlus } from "react-icons/fa";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchInventory() {
      try {
        const response = await fetch('/api/inventory');
        if (!response.ok) {
          // try to read error message from body
          const { error } = await response.json().catch(() => ({}));
          throw new Error(error || `Failed to fetch inventory (${response.status})`);
        }
        const data = await response.json();
        setInventory(data.inventory ?? []);
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'Error fetching inventory');
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-start min-h-screen py-5">
        <ToastContainer />
        <div className="w-full max-w-4xl flex items-center justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="flex justify-center items-start min-h-screen py-5">
        <ToastContainer />
        <div className="w-full max-w-4xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Inventory not found</h1>
            <button className="btn btn-ghost" onClick={() => router.back()}>
              Back
            </button>
          </div>
          <p className="text-gray-500">
            We couldn&rsquo;t find any inventory.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen py-5">
      <div className="w-full flex flex-col gap-10">
        {/* Header + actions */}
        <div className="w-full max-w-4xl flex items-center gap-12 self-center">
          <h1 className="text-3xl font-bold">Inventory</h1>

          <label className="input w-full">
            <svg className="h-[1em] opacity-50" viewBox="0 0 24 24">
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </g>
            </svg>
            <input type="search" className="grow" placeholder="Search" />
          </label>

          <Link
            className="btn"
            title="Add new inventory item"
            href="/inventory/new"
          >
            <FaPlus size={20} />
          </Link>
        </div>

        {/* Table */}
        {inventory.length === 0 ? (
          <p className="mt-10 text-center text-gray-500">
            No inventory found.
          </p>
        ) : (
          <div className="w-full max-w-4xl self-center overflow-x-auto">
            <table className="table table-zebra table-fixed w-full text-center">
              <thead>
                <tr>
                  <th className="w-1/2 text-center">Name</th>
                  <th className="w-1/2 text-center">Unit Price (VAT Excl.) €</th>
                  <th className="w-1/2 text-center">Unit Price (VAT Incl.) €</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover cursor-pointer hover:bg-accent/10"
                    onClick={() => router.push(`/inventory/${item.id}`)}
                  >
                    <td className="text-center">{item.name}</td>
                    <td className="text-center">{item.unit_price_vat_excl}</td>
                    <td className="text-center">{item.unit_price_vat_incl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
}
