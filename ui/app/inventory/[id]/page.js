// app/inventory/[id]/page.jsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';

import { FaBox, FaBarcode, FaFileLines, FaTag, FaPercent } from "react-icons/fa6";

export default function InventoryDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchInventory() {
      try {
        const res = await fetch(`/api/inventory/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch inventory');
        }
        const data = await res.json();
        console.log(data);
        // API returns { inventory: {...} }
        setInventory(data.inventory ?? null);
      } catch (err) {
        console.error(err);
        toast.error(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, [id]);

  const displayName = useMemo(() => {
    if (!inventory) return '';
    return inventory.name || '';
  }, [inventory]);

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
            <h1 className="text-3xl font-bold">Product not found</h1>
            <button className="btn btn-ghost" onClick={() => router.back()}>
              Back
            </button>
          </div>
          <p className="text-gray-500">
            We couldn&rsquo;t find a product with id <code>{id}</code>.
          </p>
        </div>
      </div>
    );
  }

  // Format price/rate nicely for display
  const unitPriceDisplay =
    inventory.unit_price === null || inventory.unit_price === undefined
      ? ''
      : inventory.unit_price.toString();

  const taxRateDisplay =
    inventory.tax_rate === null || inventory.tax_rate === undefined
      ? ''
      : inventory.tax_rate.toString();

  return (
    <div className="flex justify-center items-start min-h-screen py-5">
      <ToastContainer />

      <div className="w-full max-w-4xl flex items-center gap-4">
        <div className="flex w-full flex-col gap-4">
          {/* Title + buttons */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">
                {displayName || 'Product details'}
              </h1>
              <span className="badge badge-neutral mt-1 w-fit">
                Inventory item
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
              {/* <Link href={`/inventory/${id}/edit`} className="btn btn-primary">
                Edit
              </Link> */}
            </div>
          </div>

          {/* Product name */}
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaBox size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full"
              readOnly
              value={inventory.name ?? ''}
              placeholder="Product name"
            />
          </div>

          {/* EAN code */}
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaBarcode size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full"
              readOnly
              value={inventory.ean_code ?? ''}
              placeholder="EAN code"
            />
          </div>

          {/* Description */}
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaFileLines size={18} />
            </span>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Description"
              rows={4}
              readOnly
              value={inventory.description ?? ''}
            />
          </div>

          {/* Unit price */}
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaTag size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full"
              readOnly
              value={unitPriceDisplay}
              placeholder="Unit price"
            />
          </div>

          {/* Tax rate */}
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaPercent size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full"
              readOnly
              value={taxRateDisplay}
              placeholder="Tax rate (%)"
            />
          </div>

          {/* Optional: meta info */}
          <div className="mt-4 text-sm text-gray-500">
            <p>
              Created:{' '}
              {inventory.created_at
                ? new Date(inventory.created_at).toLocaleString()
                : '—'}
            </p>
            <p>
              Updated:{' '}
              {inventory.updated_at
                ? new Date(inventory.updated_at).toLocaleString()
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
