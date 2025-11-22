// app/orders/[id]/page.jsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';

import {
  FaFileLines,
  FaTag,
  FaUser,
  FaBox,
} from "react-icons/fa6";

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
        console.log(data);
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
      order.order_number ||
      order.number ||
      `Order ${order.id?.slice(0, 8)}` ||
      ''
    );
  }, [order]);

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

  if (!order) {
    return (
      <div className="flex justify-center items-start min-h-screen py-5">
        <ToastContainer />
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

  const totalAmountDisplay =
    order.total_amount === null || order.total_amount === undefined
      ? '0.00'
      : Number(order.total_amount).toFixed(2);

  const orderDateDisplay = order.order_date
    ? new Date(order.order_date).toLocaleString()
    : '—';

  const createdAtDisplay = order.created_at
    ? new Date(order.created_at).toLocaleString()
    : '—';

  const updatedAtDisplay = order.updated_at
    ? new Date(order.updated_at).toLocaleString()
    : '—';

  const items = order.items ?? [];

  return (
    <div className="flex justify-center items-start min-h-screen py-5">
      <ToastContainer />

      <div className="w-full max-w-4xl flex items-center gap-4">
        <div className="flex w-full flex-col gap-4">
          {/* Title + buttons */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">
                {displayTitle || 'Order details'}
              </h1>
              <span className="badge badge-neutral mt-1 w-fit">
                {order.status ?? 'pending'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.back()}
              >
                Back
              </button>
              {/* Optional: link to edit page later */}
              {/* <Link href={`/orders/${id}/edit`} className="btn btn-primary">
                Edit
              </Link> */}
            </div>
          </div>

          {/* Client & basic info */}
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaUser size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full"
              readOnly
              value={order.client_name ?? order.client_id ?? ''}
              placeholder="Client"
            />
          </div>

          {/* Company (if present) */}
          {order.company_name || order.company_id ? (
            <div className="join w-md">
              <span className="join-item px-3 text-gray-500 flex items-center">
                <FaBox size={18} />
              </span>
              <input
                type="text"
                className="input input-bordered join-item w-full"
                readOnly
                value={order.company_name ?? order.company_id ?? ''}
                placeholder="Company"
              />
            </div>
          ) : null}

          {/* Order date */}
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaFileLines size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full"
              readOnly
              value={orderDateDisplay}
              placeholder="Order date"
            />
          </div>

          {/* Total amount */}
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaTag size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full"
              readOnly
              value={totalAmountDisplay}
              placeholder="Total amount"
            />
          </div>

          {/* Items section */}
          <div className="mt-4">
            <span className="text-gray-500">Order items</span>
            <hr className="mt-2 mb-1 border-gray-300" />
          </div>

          {items.length === 0 ? (
            <p className="text-gray-500">No items in this order.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Unit price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const quantity = item.quantity ?? 0;
                    const unitPrice =
                      item.unit_price === null || item.unit_price === undefined
                        ? 0
                        : Number(item.unit_price);
                    const totalPrice =
                      item.total_price === null ||
                      item.total_price === undefined
                        ? quantity * unitPrice
                        : Number(item.total_price);

                    return (
                      <tr key={item.id}>
                        <td>{item.product_name ?? item.product_id ?? '-'}</td>
                        <td className="text-right">{quantity}</td>
                        <td className="text-right">
                          {unitPrice.toFixed(2)}
                        </td>
                        <td className="text-right">
                          {totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Meta info */}
          <div className="mt-4 text-sm text-gray-500">
            <p>
              Created:{' '}
              {createdAtDisplay}
            </p>
            <p>
              Updated:{' '}
              {updatedAtDisplay}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
