// app/inventory/[id]/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import { FaBox } from 'react-icons/fa';
import {
  FaBarcode,
  FaFileLines,
  FaTag,
  FaPercent,
} from 'react-icons/fa6';
import LoadingSpinner from '@/app/components/loadingSpinner';

export default function InventoryDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [initial, setInitial] = useState(null); // original product from server
  const [form, setForm] = useState(null);       // editable copy
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load product
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/inventory/${id}`);
        if (!res.ok) throw new Error('Failed to fetch inventory item');
        const data = await res.json();
        const inv = data.inventory ?? null;
        setInitial(inv);

        if (inv) {
          setForm({
            name: inv.name ?? '',
            ean_code: inv.ean_code ?? '',
            description: inv.description ?? '',
            unit_price:
              inv.unit_price === null || inv.unit_price === undefined
                ? ''
                : inv.unit_price.toString(),
            tax_rate:
              inv.tax_rate === null || inv.tax_rate === undefined
                ? ''
                : inv.tax_rate.toString(),
          });
        }
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const hasChanges = useMemo(() => {
    if (!initial || !form) return false;
    const unitPriceInitial =
      initial.unit_price === null || initial.unit_price === undefined
        ? ''
        : initial.unit_price.toString();
    const taxRateInitial =
      initial.tax_rate === null || initial.tax_rate === undefined
        ? ''
        : initial.tax_rate.toString();

    return (
      (initial.name ?? '') !== form.name ||
      (initial.ean_code ?? '') !== form.ean_code ||
      (initial.description ?? '') !== form.description ||
      unitPriceInitial !== form.unit_price ||
      taxRateInitial !== form.tax_rate
    );
  }, [initial, form]);

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onReset = () => {
    if (!initial) return;
    setForm({
      name: initial.name ?? '',
      ean_code: initial.ean_code ?? '',
      description: initial.description ?? '',
      unit_price:
        initial.unit_price === null || initial.unit_price === undefined
          ? ''
          : initial.unit_price.toString(),
      tax_rate:
        initial.tax_rate === null || initial.tax_rate === undefined
          ? ''
          : initial.tax_rate.toString(),
    });
  };

  const onSave = async () => {
    if (!form) return;

    // Basic numeric validation for price + tax
    const unitPrice =
      form.unit_price.trim() === '' ? null : Number(form.unit_price);
    const taxRate =
      form.tax_rate.trim() === '' ? null : Number(form.tax_rate);

    if (
      unitPrice !== null &&
      (!Number.isFinite(unitPrice) || unitPrice < 0)
    ) {
      toast.error('Unit price must be a non-negative number');
      return;
    }

    if (taxRate !== null && !Number.isFinite(taxRate)) {
      toast.error('Tax rate must be a valid number');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          ean_code: form.ean_code || null,
          description: form.description || null,
          unit_price: unitPrice,
          tax_rate: taxRate,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Save failed');
      }

      const data = await res.json();
      const inv = data.inventory;

      setInitial(inv);
      setForm({
        name: inv.name ?? '',
        ean_code: inv.ean_code ?? '',
        description: inv.description ?? '',
        unit_price:
          inv.unit_price === null || inv.unit_price === undefined
            ? ''
            : inv.unit_price.toString(),
        tax_rate:
          inv.tax_rate === null || inv.tax_rate === undefined
            ? ''
            : inv.tax_rate.toString(),
      });

      toast.success('Product saved');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!initial || !form) {
    return (
      <div className="min-h-screen py-5">
        <div className="w-full max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 mb-6">
            <button className="btn btn-ghost" onClick={() => router.back()}>
              &larr; Back
            </button>
            <h1 className="text-2xl font-bold text-center">Product not found</h1>
            <div />
          </div>

          <div className="rounded-xl border border-base-300 p-4">
            <p className="text-gray-500">
              We couldn&rsquo;t find a product with id <code>{id}</code>.
            </p>
            <ToastContainer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-5">
      <div className="w-full max-w-3xl mx-auto px-6">
        {/* Header: back | title | actions */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 mb-6">
          <button className="btn btn-ghost" onClick={() => router.back()}>
            &larr; Back
          </button>
          <h1 className="text-2xl font-bold text-center">Edit product</h1>
          <div className="flex gap-2 justify-self-end">
            <button
              className="btn btn-ghost"
              onClick={onReset}
              disabled={!hasChanges || saving}
            >
              Reset
            </button>
            <button
              className={`btn btn-primary ${
                !hasChanges ? 'btn-disabled opacity-50' : ''
              }`}
              onClick={onSave}
              disabled={!hasChanges || saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-base-300 p-4">
          {/* Title + badge */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {form.name || 'Product details'}
            </h2>
            <span className="badge badge-neutral mt-1 w-fit">
              Inventory item
            </span>
          </div>

          {/* Editable fields (same style as user page) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <label className="form-control md:col-span-2">
              <div className="join px-1 pb-2">
                <span className="label-text">Product name</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaBox size={18} />
                </span>
              </div>
              <input
                className="input input-bordered"
                value={form.name}
                onChange={onChange('name')}
                placeholder="Product name"
              />
            </label>

            {/* EAN code */}
            <label className="form-control">
              <div className="join px-1 pb-2">
                <span className="label-text">EAN code</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaBarcode size={18} />
                </span>
              </div>
              <input
                className="input input-bordered"
                value={form.ean_code}
                onChange={onChange('ean_code')}
                placeholder="EAN code"
              />
            </label>

            {/* Unit price */}
            <label className="form-control">
              <div className="join px-1 pb-2">
                <span className="label-text">Tax excluded unit price</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaTag size={18} />
                </span>
              </div>
              <input
                className="input input-bordered"
                value={form.unit_price}
                onChange={onChange('unit_price')}
                placeholder="Unit price"
              />
            </label>

            {/* Tax rate */}
            <label className="form-control">
              <div className="join px-1 pb-2">
                <span className="label-text">Tax rate</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaPercent size={18} />
                </span>
              </div>
              <input
                className="input input-bordered"
                value={form.tax_rate}
                onChange={onChange('tax_rate')}
                placeholder="Tax rate (%)"
              />
            </label>

            {/* Description (full width) */}
            <label className="form-control">
              <div className="join px-1 pb-2">
                <span className="label-text">Description</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaFileLines size={18} />
                </span>
              </div>
              <textarea
                className="textarea textarea-bordered"
                rows={4}
                value={form.description}
                onChange={onChange('description')}
                placeholder="Description"
              />
            </label>
          </div>

          {/* Meta info (like user page footer) */}
          <div className="mt-6 text-sm opacity-70">
            <div>
              <b>Product ID:</b> {initial.id}
            </div>
            <div>
              <b>Company ID:</b> {initial.company_id}
            </div>
            <div>
              <b>Created at:</b>{' '}
              {initial.created_at
                ? new Date(initial.created_at).toLocaleString('fi-FI')
                : '—'}
            </div>
            <div>
              <b>Updated at:</b>{' '}
              {initial.updated_at
                ? new Date(initial.updated_at).toLocaleString('fi-FI')
                : '—'}
            </div>
          </div>

          <ToastContainer />
        </div>
      </div>
    </div>
  );
}
