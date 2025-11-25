// app/orders/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data.orders ?? []);
      } catch (error) {
        console.error(error);
        toast.error(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
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

  if (!orders) {
    return (
      <div className="flex justify-center items-start min-h-screen py-5">
        <ToastContainer />
        <div className="w-full max-w-4xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Orders not found</h1>
            <button className="btn btn-ghost" onClick={() => router.back()}>
              Back
            </button>
          </div>
          <p className="text-gray-500">
            We couldn&rsquo;t find any orders.
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
          <h1 className="text-3xl font-bold">Orders</h1>

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
            <input type="search" className="grow" placeholder="Search orders" />
          </label>

          <Link className="btn" title="Add new order" href="/orders/new">
            <FaPlus size={20} />
          </Link>
        </div>

        {/* Table */}
        {orders.length === 0 ? (
          <p className="mt-10 text-center text-gray-500">
            No orders found.
          </p>
        ) : (
          <div className="w-full max-w-4xl self-center overflow-x-auto">
            <table className="table table-zebra table-fixed w-full text-center">
              <thead>
                <tr>
                  <th className="w-1/4 text-center">Order #</th>
                  <th className="w-1/4 text-center">Customer</th>
                  <th className="w-1/4 text-center">Total</th>
                  <th className="w-1/4 text-center">Order date</th>
                  <th className="w-1/4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover cursor-pointer hover:bg-accent/10"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <td className="text-center">{order.id ?? '-'}</td>
                    <td className="text-center">
                      {order.customer_name ?? '—'}
                    </td>
                    <td className="text-center">
                      {order.total_amount != null
                        ? Number(order.total_amount).toFixed(2)
                        : '—'}
                    </td>
                    <td className="text-center">
                      {order.order_date
                        ? new Date(order.order_date).toLocaleDateString('fi-FI')
                        : '—'}
                    </td>
                    <td className="text-center">
                      {order.status ? (
                        <span className="badge badge-neutral">
                          {order.status}
                        </span>
                      ) : (
                        '—'
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
