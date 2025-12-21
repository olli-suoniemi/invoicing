'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/loadingSpinner';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchInventory() {
      try {
        const response = await fetch('/api/inventory');
        if (!response.ok) {
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inventory;
    return inventory.filter((it) =>
      `${it?.name ?? ''} ${it?.ean_code ?? ''}`.toLowerCase().includes(q)
    );
  }, [inventory, query]);

  if (loading) return <LoadingSpinner />;

  if (!inventory) {
    return (
      <div className="min-h-screen py-4 sm:py-5">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Inventory not found</h1>
            <button className="btn btn-ghost" onClick={() => router.back()}>
              Back
            </button>
          </div>
          <p className="text-gray-500">We couldn&rsquo;t find any inventory.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-5 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 sm:gap-10">
        {/* Header + actions (same structure as OrdersPage) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Inventory</h1>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <label className="input w-full sm:w-[22rem]">
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

              <input
                type="search"
                className="grow"
                placeholder="Search inventory"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            <Link className="btn w-full sm:w-auto" title="Add new inventory item" href="/inventory/new">
              <FaPlus size={18} />
              <span className="sm:hidden">Add item</span>
            </Link>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-6 text-center text-gray-500">No inventory found.</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="grid gap-3 sm:hidden">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => router.push(`/inventory/${item.id}`)}
                  className="text-left rounded-lg bg-base-100 shadow p-4 active:scale-[0.99] transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{item.name ?? '—'}</div>
                      <div className="text-sm opacity-70">
                        {item.ean_code ? `EAN: ${item.ean_code}` : 'EAN: —'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="opacity-70">Unit (excl. VAT)</div>
                    <div className="text-right font-medium">
                      {item.unit_price_vat_excl != null
                        ? `${Number(item.unit_price_vat_excl).toFixed(2)} €`
                        : '—'}
                    </div>

                    <div className="opacity-70">Unit (incl. VAT)</div>
                    <div className="text-right">
                      {item.unit_price_vat_incl != null
                        ? `${Number(item.unit_price_vat_incl).toFixed(2)} €`
                        : '—'}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table table-zebra table-fixed w-full text-center">
                <thead>
                  <tr>
                    <th className="w-1/2 text-center">Name</th>
                    <th className="w-1/4 text-center">Unit (VAT excl.) €</th>
                    <th className="w-1/4 text-center">Unit (VAT incl.) €</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="hover cursor-pointer hover:bg-accent/10"
                      onClick={() => router.push(`/inventory/${item.id}`)}
                    >
                      <td>{item.name ?? '—'}</td>
                      <td>
                        {item.unit_price_vat_excl != null
                          ? Number(item.unit_price_vat_excl).toFixed(2)
                          : '—'}
                      </td>
                      <td>
                        {item.unit_price_vat_incl != null
                          ? Number(item.unit_price_vat_incl).toFixed(2)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
