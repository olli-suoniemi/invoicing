// app/invoices/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await fetch('/api/invoices');
        if (!response.ok) {
          // try to read error message from body
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

  if (!invoices) {
    return (
      <div className="flex justify-center items-start min-h-screen py-5">
        <ToastContainer />
        <div className="w-full max-w-4xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Invoices not found</h1>
            <button className="btn btn-ghost" onClick={() => router.back()}>
              Back
            </button>
          </div>
          <p className="text-gray-500">
            We couldn&rsquo;t find any invoices.
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
          <h1 className="text-3xl font-bold">Invoices</h1>

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
            <input type="search" className="grow" placeholder="Search invoices" />
          </label>

          {/* New invoices are created from orders */}
          <Link className="btn" title="New invoices are created from orders" href="/orders/new">
            <FaPlus size={20} />
          </Link>
        </div>

        {/* Table */}
        {invoices.length === 0 ? (
          <p className="mt-10 text-center text-gray-500">
            No invoices found.
          </p>
        ) : (
          <div className="w-full max-w-4xl self-center overflow-x-auto">
            <table className="table table-zebra table-fixed w-full text-center">
              <thead>
                <tr>
                  <th className="w-1/4 text-center">Invoice #</th>
                  <th className="w-1/4 text-center">Customer</th>
                  <th className="w-1/4 text-center">Total (VAT incl.) €</th>
                  <th className="w-1/4 text-center">Invoice date</th>
                  <th className="w-1/4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover cursor-pointer hover:bg-accent/10"
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                  >
                    <td className="text-center">{invoice.invoice_number ?? '-'}</td>
                    <td className="text-center">
                      {invoice.customer_name ?? '—'}
                    </td>
                    <td className="text-center">
                      {invoice.total_amount_vat_incl != null
                        ? Number(invoice.total_amount_vat_incl).toFixed(2)
                        : '—'}
                    </td>
                    <td className="text-center">
                      {invoice.issue_date
                        ? new Date(invoice.issue_date).toLocaleDateString('fi-FI')
                        : '—'}
                    </td>
                    <td className="text-center">
                      {invoice.status === 'paid' && (
                        <span className="badge badge-success badge-lg">Paid</span>
                      )}
                      {invoice.status === 'sent' && (
                        <span className="badge badge-primary badge-lg">Sent</span>
                      )}
                      {invoice.status === 'draft' && (
                        <span className="badge badge-neutral badge-lg">Draft</span>
                      )}
                    </td>
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
