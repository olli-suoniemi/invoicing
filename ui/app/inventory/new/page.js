'use client';

import React, { useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { FaBox, FaBarcode, FaFileLines, FaTag, FaPercent } from "react-icons/fa6";

export default function InventoryNewPage() {
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
    // Trim values
    const name = product.name.trim();
    const ean = product.ean_code.trim();
    const desc = product.description.trim();
    const unitPriceStr = product.unit_price.toString().trim();
    const taxRateStr = product.tax_rate.toString().trim();

    // Basic validation: require name, unit price, tax rate
    if (!name) {
      toast.error('Product name is required');
      return;
    }

    if (!unitPriceStr) {
      toast.error('Unit price is required');
      return;
    }

    if (!taxRateStr) {
      toast.error('Tax rate is required');
      return;
    }

    // Convert to numbers
    const unitPrice = Number(unitPriceStr);
    if (Number.isNaN(unitPrice)) {
      toast.error('Unit price must be a valid number');
      return;
    }

    const taxRate = Number(taxRateStr);
    if (Number.isNaN(taxRate)) {
      toast.error('Tax rate must be a valid number');
      return;
    }

    // Build payload with proper types (no empty strings for numeric fields)
    const payload = {
      name,
      ean_code: ean || null,
      description: desc || null,
      unit_price: unitPrice, // number
      tax_rate: taxRate,     // number
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

      setProduct({
        name: '',
        ean_code: '',
        description: '',
        unit_price: '',
        tax_rate: '',
      });
      toast.success('New product created!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create product');
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
    <div className="flex justify-center items-start min-h-screen py-5">
      <ToastContainer />

      <div className="w-full max-w-4xl flex items-center gap-4">
        <div className="flex w-full flex-col gap-4">
          {/* Title + buttons */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Add new product</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={resetForm}
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
                aria-disabled={!hasText}
              >
                Save
              </button>
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
              placeholder="Product name"
              value={product.name}
              onChange={(e) =>
                setProduct((s) => ({ ...s, name: e.target.value }))
              }
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
              placeholder="EAN code"
              value={product.ean_code}
              onChange={(e) =>
                setProduct((s) => ({ ...s, ean_code: e.target.value }))
              }
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
              value={product.description}
              onChange={(e) =>
                setProduct((s) => ({ ...s, description: e.target.value }))
              }
            />
          </div>

          {/* Unit price */}
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaTag size={18} />
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input input-bordered join-item w-full"
              placeholder="Unit price"
              value={product.unit_price}
              onChange={(e) =>
                setProduct((s) => ({ ...s, unit_price: e.target.value }))
              }
            />
          </div>

          {/* Tax rate */}
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaPercent size={18} />
            </span>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              className="input input-bordered join-item w-full"
              placeholder="Tax rate (%)"
              value={product.tax_rate}
              onChange={(e) =>
                setProduct((s) => ({ ...s, tax_rate: e.target.value }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
