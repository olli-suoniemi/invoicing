// app/orders/[id]/page.jsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { RiMoneyEuroBoxFill } from "react-icons/ri";
import LoadingSpinner from '@/components/loadingSpinner';

import {
  FaUser
} from "react-icons/fa6";
import { FaCalendarDay } from "react-icons/fa";
import Link from 'next/link';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch order');
        }
        const data = await res.json();
        // API returns { order: {...} }
        setOrder(data.order ?? null);
      } catch (err) {
        console.error(err);
        toast.error(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  const displayTitle = useMemo(() => {
    if (!order) return '';
    // Prefer some kind of human-readable order number if available
    return (
      `Order # ${order.order_number}` ||
      ''
    );
  }, [order]);

  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-start min-h-screen py-5">
        <div className="w-full max-w-4xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Order not found</h1>
            <button className="btn btn-ghost" onClick={() => router.back()}>
              Back
            </button>
          </div>
          <p className="text-gray-500">
            We couldn&rsquo;t find an order with id <code>{id}</code>.
          </p>
        </div>
      </div>
    );
  }

  const totalAmountVatExclDisplay =
    order.total_amount_vat_excl === null || order.total_amount_vat_excl === undefined
      ? '0.00'
      : Number(order.total_amount_vat_excl).toFixed(2);
  
  const totalAmountVatInclDisplay =
    order.total_amount_vat_incl === null || order.total_amount_vat_incl === undefined
      ? '0.00'
      : Number(order.total_amount_vat_incl).toFixed(2);

  const vatAmountDisplay = (
    Number(order.total_amount_vat_incl || 0) -
    Number(order.total_amount_vat_excl || 0)
  ).toFixed(2);

  const orderDateDisplay = order.order_date
    ? new Date(order.order_date).toLocaleDateString('fi-FI')
    : '—';

  const createdAtDisplay = order.created_at
    ? new Date(order.created_at).toLocaleString('fi-FI')
    : '—';

  const updatedAtDisplay = order.updated_at
    ? new Date(order.updated_at).toLocaleString('fi-FI')
    : '—';

  const items = order.items ?? [];

  async function handleInvoiceCreate() {
    try {
        setLoading(true);
        const res = await fetch(`/api/invoices`, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orderId: id })
        });
        if (!res.ok) {
          throw new Error('Failed to create invoice');
        }
        const data = await res.json();

        toast.success('New invoice created!');

        // If successful, redirect to invoice page
        router.push(`/invoices/${data.invoice.id}`);
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
      setLoading(false);
    }
  }


  return (
    <div className="flex justify-center items-start min-h-screen py-5 px-5">
      <div className="w-full max-w-7xl">
          <div className="flex w-full flex-col gap-4">
          {/* Title + buttons */}
          {/* DESKTOP */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">
                  {displayTitle || 'Order details'}
              </h1>
              <span className="badge badge-neutral mt-1 w-fit">
                  {order.status ?? 'draft'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className='flex flex-row gap-2'>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => router.back()}
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => router.push(`/orders/${id}/edit`)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-primary p-5ö"
                  onClick={handleInvoiceCreate}
                >
                  Create invoice
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE*/}
          <div className='md:hidden flex flex-col'>
            <div className="flex items-center justify-between mb-4">
              <button className="btn btn-ghost btn-md" onClick={() => router.back()}>
                &larr; Back
              </button>
              <div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => router.push(`/orders/${id}/edit`)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-primary p-5ö"
                  onClick={handleInvoiceCreate}
                >
                  Create invoice
                </button>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold">
                  {displayTitle || 'Order details'}
              </h1>
              <span className="badge badge-neutral mt-1 w-fit">
                  {order.status ?? 'draft'}
              </span>
            </div>
          </div>

          {/* DETAILS */}
          <div className="rounded-xl border md:border-none border-base-300 px-4">
            <div className="mt-4 md:w-7/12">
              <span className="text-gray-500">Order details</span>
              <hr className="mt-2 mb-4 border-gray-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-x-10 gap-y-2 w-7/12">
              {/* Left: general info */}
              <div className="flex flex-col gap-3">
                {/* Customer */}
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                    <FaUser size={16} />
                    <span>Customer</span>
                  </div>
                  <div className="flex-1">
                    <Link href={`/customers/${order.customer_id}`} className="underline md:h-10 flex items-center text-sm">
                      {order.customer_name ?? '—'}
                    </Link>
                  </div>
                </div>

                {/* Order date */}
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                    <FaCalendarDay size={16} />
                    <span>Order date</span>
                  </div>
                  <div className="flex-1">
                    <div className="md:h-10 flex items-center text-sm">
                      {orderDateDisplay}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: totals (always together) */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                    <RiMoneyEuroBoxFill size={16} />
                    <span>Total (excl. VAT)</span>
                  </div>
                  <div className="flex-1">
                    <div className="md:h-10 flex items-center text-sm md:justify-end">
                      {totalAmountVatExclDisplay} €
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                    <RiMoneyEuroBoxFill size={16} />
                    <span>VAT amount</span>
                  </div>
                  <div className="flex-1">
                    <div className="md:h-10 flex items-center text-sm md:justify-end">
                      {vatAmountDisplay} €
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                    <RiMoneyEuroBoxFill size={16} />
                    <span>Total (incl. VAT)</span>
                  </div>
                  <div className="flex-1 text-sm font-semibold">
                    <div className="md:h-10 flex items-center md:justify-end">
                      {totalAmountVatInclDisplay} €
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items section */}
          <div className="rounded-xl border md:border-none border-base-300 px-4">
            <div className="mt-4">
              <span className="text-gray-500">Order items</span>
              <hr className="mt-2 mb-1 border-gray-300" />
            </div>
            {items.length === 0 ? (
              <p className="text-gray-500">No items in this order.</p>
              ) : (
                <>
                  {/* MOBILE */}
                  <div className="md:hidden flex flex-col gap-3 py-2">
                    {items.map(item => (
                      <div key={item.id}>
                        <div className="font-semibold mb-2">
                          <Link href={`/inventory/${item.product_id}`} className="underline">
                            {item.product_name ?? item.product_id ?? '-'}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          EAN: {item.ean_code ?? '-'}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          Qty: {item.quantity}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          Unit price (excl. VAT): {Number(item.unit_price_vat_excl ?? 0).toFixed(2)} €
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          VAT rate: {item.tax_rate ?? '0'} %
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          VAT amount per unit: {Number((item.unit_price_vat_incl ?? 0) - (item.unit_price_vat_excl ?? 0)).toFixed(2)} €
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          Unit price (incl. VAT): {Number(item.unit_price_vat_incl ?? 0).toFixed(2)} €
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          Total (excl. VAT): {Number(item.total_price_vat_excl ?? 0).toFixed(2)} €
                        </div>
                        <div className="text-sm font-medium">
                          Total (incl. VAT): {Number(item.total_price_vat_incl ?? 0).toFixed(2)} €
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th className="text-right">EAN</th>
                          <th className="text-right">Qty</th>
                          <th className="text-right">Unit (excl. VAT) €</th>
                          <th className="text-right">VAT %</th>
                          <th className="text-right">VAT €</th>
                          <th className="text-right">Unit (incl. VAT) €</th>
                          <th className="text-right">Total (excl. VAT) €</th>
                          <th className="text-right">Total (incl. VAT) €</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => {
                          const quantity = item.quantity ?? 0;
                          const unit_price_vat_excl =
                            item.unit_price_vat_excl === null || item.unit_price_vat_excl === undefined
                              ? 0
                              : Number(item.unit_price_vat_excl);
                          const unit_price_vat_incl =
                            item.unit_price_vat_incl === null || item.unit_price_vat_incl === undefined
                              ? 0
                              : Number(item.unit_price_vat_incl);
                          const totalPriceVatExcl =
                            item.total_price_vat_excl === null ||
                            item.total_price_vat_excl === undefined
                              ? quantity * unit_price_vat_excl
                              : Number(item.total_price_vat_excl);
                          const totalPriceVatIncl =
                            item.total_price_vat_incl === null ||
                            item.total_price_vat_incl === undefined
                              ? quantity * unit_price_vat_incl
                              : Number(item.total_price_vat_incl);
                          return (
                            <tr key={item.id}>
                              <td>
                                <Link href={`/inventory/${item.product_id}`} className="underline">
                                  {item.product_name ?? item.product_id ?? '-'}
                                </Link>
                              </td>
                              <td className="text-right">{item.ean_code ?? '-'}</td>
                              <td className="text-right">{quantity}</td>
                              <td className="text-right">
                                {unit_price_vat_excl.toFixed(2)}
                              </td>
                              <td className="text-right">{item.tax_rate ?? '-'}</td>
                              <td className="text-right">
                                {(unit_price_vat_incl - unit_price_vat_excl).toFixed(2)}
                              </td>
                              <td className="text-right">
                                {unit_price_vat_incl.toFixed(2)}
                              </td>
                              <td className="text-right">
                                {totalPriceVatExcl.toFixed(2)}
                              </td>
                              <td className="text-right">
                                {totalPriceVatIncl.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
          </div>

          {/* Notes */}
          <div className="rounded-xl border md:border-none border-base-300 px-4">
            <div className='mt-4'>
              <span className="text-gray-500">Notes</span>
              <hr className="mt-2 mb-2 border-gray-300" />
            </div>
            <p className="text-sm mb-2">{order.extra_info || '—'}</p>
          </div>

          {/* Meta info */}
          <div className="rounded-xl border md:border-none border-base-300 px-4">
            <div className='mt-4'>
              <span className="text-gray-500">Meta information</span>
              <hr className="mt-2 mb-2 border-gray-300" />
            </div>
            <p className="text-sm">
              Created:{' '}
              {createdAtDisplay}
            </p>
            <p className="text-sm mb-2">
              Updated:{' '}
              {updatedAtDisplay}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
