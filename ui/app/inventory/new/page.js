'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FaBox, FaBarcode, FaFileLines, FaTag, FaPercent } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';

export default function InventoryNewPage() {
  const router = useRouter();
  const [product, setProduct] = useState({
    name: '',
    ean_code: '',
    description: '',
    unit_price: '',
    tax_rate: '',
  });

  // Is there any text in the form?
  const hasText = useMemo(() => {
    const values = Object.values(product);
    return values.some((v) => (v ?? '').toString().trim() !== '');
  }, [product]);

  const handleSave = async () => {
    const name = product.name.trim();
    const ean = product.ean_code.trim();
    const desc = product.description.trim();
    const unitPriceStr = product.unit_price.toString().trim();
    const taxRateStr = product.tax_rate.toString().trim();

    if (!name) return toast.error('Product name is required');
    if (!unitPriceStr) return toast.error('Unit price is required');
    if (!taxRateStr) return toast.error('Tax rate is required');

    const unitPrice = Number(unitPriceStr);
    if (Number.isNaN(unitPrice)) return toast.error('Unit price must be a valid number');

    const taxRate = Number(taxRateStr);
    if (Number.isNaN(taxRate)) return toast.error('Tax rate must be a valid number');

    const payload = {
      name,
      ean_code: ean || null,
      description: desc || null,
      unit_price: unitPrice,
      tax_rate: taxRate,
    };

    try {
      const resp = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Upstream error');
      }

      resetForm();
      toast.success('New product created!');
      router.push('/inventory');
    } catch (err) {
      console.error(err);
      toast.error(`Error creating product: ${err.message || err}`);
    }
  };

  const resetForm = () => {
    setProduct({
      name: '',
      ean_code: '',
      description: '',
      unit_price: '',
      tax_rate: '',
    });
  };

  return (
    <div className="min-h-screen py-4 sm:py-5">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4">
          {/* Header (copied structure from CustomerNewPage) */}
          <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-base-100/90 backdrop-blur border-b border-base-200">
            <div className="flex flex-col gap-2 md:grid md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="flex items-center justify-between md:justify-start gap-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-md"
                  onClick={() => router.back()}
                >
                  &larr; Back
                </button>

                {/* Mobile actions */}
                <div className="flex gap-2 md:hidden">
                  <button
                    type="button"
                    className="btn btn-ghost btn-md"
                    onClick={resetForm}
                    disabled={!hasText}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!hasText}
                    className={`btn btn-primary btn-md ${
                      !hasText ? 'btn-disabled opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Save
                  </button>
                </div>
              </div>

              <h1 className="text-lg md:text-3xl font-bold md:text-center leading-tight ml-2">
                Add new product
              </h1>

              {/* Desktop actions */}
              <div className="hidden md:flex items-center gap-2 justify-self-end">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={resetForm}
                  disabled={!hasText}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasText}
                  className={`btn btn-primary ${
                    !hasText ? 'btn-disabled opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Form fields (same spacing + w-full + heights like CustomerNewPage) */}

          {/* Product name */}
          <div className="join w-full">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaBox size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full h-12 md:h-10"
              placeholder="Product name"
              value={product.name}
              onChange={(e) => setProduct((s) => ({ ...s, name: e.target.value }))}
            />
          </div>

          {/* EAN code */}
          <div className="join w-full">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaBarcode size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full h-12 md:h-10"
              placeholder="EAN code"
              value={product.ean_code}
              onChange={(e) => setProduct((s) => ({ ...s, ean_code: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div className="join w-full">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaFileLines size={18} />
            </span>
            <textarea
              className="textarea textarea-bordered join-item w-full min-h-28 md:min-h-24"
              placeholder="Description"
              value={product.description}
              onChange={(e) => setProduct((s) => ({ ...s, description: e.target.value }))}
            />
          </div>

          {/* Unit price */}
          <div className="join w-full">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaTag size={18} />
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input input-bordered join-item w-full h-12 md:h-10"
              placeholder="Unit price"
              value={product.unit_price}
              onChange={(e) => setProduct((s) => ({ ...s, unit_price: e.target.value }))}
            />
          </div>

          {/* Tax rate */}
          <div className="join w-full">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaPercent size={18} />
            </span>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              className="input input-bordered join-item w-full h-12 md:h-10"
              placeholder="Tax rate (%)"
              value={product.tax_rate}
              onChange={(e) => setProduct((s) => ({ ...s, tax_rate: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
