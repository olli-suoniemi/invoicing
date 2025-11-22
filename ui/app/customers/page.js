'use client';

import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaPlus } from "react-icons/fa";
import Link from 'next/link';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await fetch('/api/customers');
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const data = await response.json();
        setCustomers(data.customers ?? []);
        console.log(data);
      } catch (error) {
        toast.error(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
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

  if (!customers) {
    return (
      <div className="flex justify-center items-start min-h-screen py-5">
        <ToastContainer />
        <div className="w-full max-w-4xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold"> Customers not found</h1>
            <button className="btn btn-ghost" onClick={() => router.back()}>
              Back
            </button>
          </div>
          <p className="text-gray-500">
            We couldn&rsquo;t find any customers.
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
          <h1 className="text-3xl font-bold">Customers</h1>

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

          <Link className="btn" title="Add new customer" href="/customers/new">
            <FaPlus size={20} />
          </Link>
        </div>

        {/* Table */}
        {customers.length === 0 ? (
          <p className="mt-10 text-center text-gray-500">
            No customers found.
          </p>
        ) : (
          <div className="w-full max-w-4xl self-center overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {/* Add more columns if your API returns them */}
                  {/* <th>Type</th>
                  <th>Created</th> */}
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover">
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    {/* Example extra fields if available:
                    <td>{customer.type}</td>
                    <td>
                      {customer.created_at
                        ? new Date(customer.created_at).toLocaleDateString()
                        : '-'}
                    </td> */}
                    <td className="text-right">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="btn btn-ghost btn-xs"
                      >
                        View
                      </Link>
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
