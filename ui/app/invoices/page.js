// app/invoices/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/loadingSpinner';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await fetch('/api/invoices');
        if (!response.ok) {
          const { error } = await response.json().catch(() => ({}));
          throw new Error(error || `Failed to fetch invoices (${response.status})`);
        }
        const data = await response.json();
        setInvoices(data.invoices ?? []);
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'Error fetching invoices');
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invoices;

    return invoices.filter((inv) =>
      `${inv?.invoice_number ?? ''} ${inv?.customer_name ?? ''}`.toLowerCase().includes(q)
    );
  }, [invoices, query]);

  if (loading) return <LoadingSpinner />;

  if (!invoices) {
    return (
      <div className="min-h-screen py-4 sm:py-5">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Invoices not found</h1>
            <button className="btn btn-ghost" onClick={() => router.back()}>
              Back
            </button>
          </div>
          <p className="text-gray-500">We couldn&rsquo;t find any invoices.</p>
        </div>
      </div>
    );
  }

  const renderStatusBadge = (status) => {
    if (status === 'paid') return <span className="badge badge-success">Paid</span>;
    if (status === 'sent') return <span className="badge badge-primary">Sent</span>;
    if (status === 'draft') return <span className="badge badge-neutral">Draft</span>;
    return <span className="badge badge-ghost">—</span>;
  };

  return (
    <div className="min-h-screen py-5 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 sm:gap-10">
        {/* Header + actions (same structure as OrdersPage) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Invoices</h1>

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
                placeholder="Search invoices"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            {/* New invoices are created from orders */}
            <Link
              className="btn w-full sm:w-auto"
              title="New invoices are created from orders"
              href="/orders/new"
            >
              <FaPlus size={18} />
              <span className="sm:hidden">Add order</span>
            </Link>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-6 text-center text-gray-500">No invoices found.</p>
        ) : (
          <>
            {/* Mobile cards (copied from OrdersPage style) */}
            <div className="grid gap-3 sm:hidden">
              {filtered.map((inv) => (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                  className="text-left rounded-lg bg-base-100 shadow p-4 active:scale-[0.99] transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">
                        Invoice #{inv.invoice_number ?? '—'}
                      </div>
                      <div className="text-sm opacity-70">{inv.customer_name ?? '—'}</div>
                    </div>
                    <div>{renderStatusBadge(inv.status)}</div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="opacity-70">Total</div>
                    <div className="text-right font-medium">
                      {inv.total_amount_vat_incl != null
                        ? `${Number(inv.total_amount_vat_incl).toFixed(2)} €`
                        : '—'}
                    </div>

                    <div className="opacity-70">Date</div>
                    <div className="text-right">
                      {inv.issue_date
                        ? new Date(inv.issue_date).toLocaleDateString('fi-FI')
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
                    <th className="w-1/5 text-center">Invoice #</th>
                    <th className="w-1/5 text-center">Customer</th>
                    <th className="w-1/5 text-center">Total (VAT incl.) €</th>
                    <th className="w-1/5 text-center">Invoice date</th>
                    <th className="w-1/5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover cursor-pointer hover:bg-accent/10"
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                    >
                      <td>{inv.invoice_number ?? '-'}</td>
                      <td>{inv.customer_name ?? '—'}</td>
                      <td>
                        {inv.total_amount_vat_incl != null
                          ? Number(inv.total_amount_vat_incl).toFixed(2)
                          : '—'}
                      </td>
                      <td>
                        {inv.issue_date
                          ? new Date(inv.issue_date).toLocaleDateString('fi-FI')
                          : '—'}
                      </td>
                      <td>{renderStatusBadge(inv.status)}</td>
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
