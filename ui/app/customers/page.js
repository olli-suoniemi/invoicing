// ui/app/customers/page.js
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../components/loadingSpinner';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await fetch('/api/customers');
        if (!response.ok) {
          const { error } = await response.json().catch(() => ({}));
          throw new Error(error || `Failed to fetch customers (${response.status})`);
        }
        const data = await response.json();
        setCustomers(Array.isArray(data.customers) ? data.customers : []);
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'Error fetching customers');
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      `${c?.name ?? ''} ${c?.email ?? ''}`.toLowerCase().includes(q)
    );
  }, [customers, query]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen py-5 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 sm:gap-10">
        {/* Header + actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Customers</h1>

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
                placeholder="Search customers"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            <Link
              className="btn w-full sm:w-auto"
              title="Add new customer"
              href="/customers/new"
            >
              <FaPlus size={18} />
              <span className="sm:hidden">Add customer</span>
            </Link>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <p className="mt-6 text-center text-gray-500">No customers found.</p>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="grid gap-3 sm:hidden">
              {filtered.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => router.push(`/customers/${customer.id}`)}
                  className="text-left rounded-lg bg-base-100 shadow p-4 active:scale-[0.99] transition"
                >
                  <div className="font-semibold">{customer.name}</div>
                  <div className="text-sm opacity-70 break-all">{customer.email}</div>
                </button>
              ))}
            </div>

            {/* Desktop/tablet: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="table table-zebra table-fixed w-full text-center">
                <thead>
                  <tr>
                    <th className="w-1/2 text-center">Name</th>
                    <th className="w-1/2 text-center">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover cursor-pointer hover:bg-accent/10"
                      onClick={() => router.push(`/customers/${customer.id}`)}
                    >
                      <td className="text-center truncate">{customer.name}</td>
                      <td className="text-center truncate">{customer.email}</td>
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
