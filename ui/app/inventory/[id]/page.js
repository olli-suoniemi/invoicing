// app/inventory/[id]/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaBox } from 'react-icons/fa';
import {
  FaBarcode,
  FaFileLines,
  FaTag,
  FaPercent,
} from 'react-icons/fa6';
import LoadingSpinner from '@/components/loadingSpinner';

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
            unit_price_vat_excl:
              inv.unit_price_vat_excl === null || inv.unit_price_vat_excl === undefined
                ? ''
                : inv.unit_price_vat_excl.toString(),
            unit_price_vat_incl:
              inv.unit_price_vat_incl === null || inv.unit_price_vat_incl === undefined
                ? ''
                : inv.unit_price_vat_incl.toString(),
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
    const unitPriceVatExclInitial =
      initial.unit_price_vat_excl === null || initial.unit_price_vat_excl === undefined
        ? ''
        : initial.unit_price_vat_excl.toString();
    const unitPriceVatInclInitial =
      initial.unit_price_vat_incl === null || initial.unit_price_vat_incl === undefined
        ? ''
        : initial.unit_price_vat_incl.toString();
    const taxRateInitial =
      initial.tax_rate === null || initial.tax_rate === undefined
        ? ''
        : initial.tax_rate.toString();

    return (
      (initial.name ?? '') !== form.name ||
      (initial.ean_code ?? '') !== form.ean_code ||
      (initial.description ?? '') !== form.description ||
      unitPriceVatExclInitial !== form.unit_price_vat_excl ||
      unitPriceVatInclInitial !== form.unit_price_vat_incl ||
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
      unit_price_vat_excl:
      initial.unit_price_vat_excl === null || initial.unit_price_vat_excl === undefined
        ? ''
        : initial.unit_price_vat_excl.toString(),
      unit_price_vat_incl:
      initial.unit_price_vat_incl === null || initial.unit_price_vat_incl === undefined
        ? ''
        : initial.unit_price_vat_incl.toString(),
      tax_rate:
        initial.tax_rate === null || initial.tax_rate === undefined
          ? ''
          : initial.tax_rate.toString(),
    });
  };

  const onSave = async () => {
    if (!form) return;

    // Basic numeric validation for price + tax
    const unitPriceVatExcl =
      form.unit_price_vat_excl.trim() === '' ? null : Number(form.unit_price_vat_excl);
    const unitPriceVatIncl =
      form.unit_price_vat_incl.trim() === '' ? null : Number(form.unit_price_vat_incl);
    const taxRate =
      form.tax_rate.trim() === '' ? null : Number(form.tax_rate);

    if (
      unitPriceVatExcl !== null 
      && 
      (!Number.isFinite(unitPriceVatExcl) || unitPriceVatExcl < 0) 
      && 
      (unitPriceVatIncl !== null 
      && 
      !Number.isFinite(unitPriceVatIncl) || unitPriceVatIncl < 0)
    ) {
      toast.error('Unit prices must be non-negative numbers');
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
          unit_price_vat_excl: unitPriceVatExcl,
          unit_price_vat_incl: unitPriceVatIncl,
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
        unit_price_vat_excl:
        inv.unit_price_vat_excl === null || inv.unit_price_vat_excl === undefined
          ? ''
          : inv.unit_price_vat_excl.toString(),
        unit_price_vat_incl:
        inv.unit_price_vat_incl === null || inv.unit_price_vat_incl === undefined
          ? ''
          : inv.unit_price_vat_incl.toString(),
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

  const calculateVatIncl = (exclStr, taxStr) => {
    const excl = parseFloat(exclStr);
    const tax = parseFloat(taxStr);

    if (isNaN(excl) || isNaN(tax)) {
      return '';
    }

    const incl = excl * (1 + tax / 100);
    // Force 2 decimals for display
    return incl.toFixed(2);
  };

  const onUnitPriceExclChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      unit_price_vat_excl: value,
      unit_price_vat_incl: calculateVatIncl(value, prev.tax_rate),
    }));
  };

  const onTaxRateChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      tax_rate: value,
      unit_price_vat_incl: calculateVatIncl(prev.unit_price_vat_excl, value),
    }));
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-5">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header (copied structure from CustomerDetailsPage) */}
        <div className="mb-4 md:mb-6">
          <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-base-100/90 backdrop-blur border-b border-base-200">
            <div className="flex flex-col gap-2 md:grid md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="flex items-center justify-between md:justify-start gap-2">
                <button className="btn btn-ghost btn-md" onClick={() => router.back()}>
                  &larr; Back
                </button>

                {/* Mobile actions */}
                <div className="flex gap-2 md:hidden">
                  <button
                    className="btn btn-ghost btn-md"
                    onClick={onReset}
                    disabled={!hasChanges || saving}
                  >
                    Reset
                  </button>
                  <button
                    className={`btn btn-primary btn-md ${
                      !hasChanges ? 'btn-disabled opacity-50' : ''
                    }`}
                    onClick={onSave}
                    disabled={!hasChanges || saving}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Desktop actions */}
              <div className="hidden md:flex gap-2 justify-self-end">
                <button className="btn btn-ghost" onClick={onReset} disabled={!hasChanges || saving}>
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
          </div>
        </div>

        {/* Card (same as CustomerDetailsPage) */}
        <div className="rounded-xl border border-base-300 p-4 sm:p-6">
          {/* Title + badge */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold">{form.name || 'Product details'}</h2>
            <span className="badge badge-neutral mt-1 w-fit">Inventory item</span>
          </div>

          {/* Editable fields (match CustomerDetailsPage label styling) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product name */}
            <label className="form-control md:col-span-2">
              <div className="label py-1">
                <span className="label-text">Product name</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <FaBox size={18} />
                </span>
              </div>
              <input
                className="input input-bordered w-full h-12 md:h-10"
                value={form.name}
                onChange={onChange('name')}
                placeholder="Product name"
              />
            </label>

            {/* EAN code */}
            <label className="form-control">
              <div className="label py-1">
                <span className="label-text">EAN code</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <FaBarcode size={18} />
                </span>
              </div>
              <input
                className="input input-bordered w-full h-12 md:h-10"
                value={form.ean_code}
                onChange={onChange('ean_code')}
                placeholder="EAN code"
              />
            </label>

            {/* Tax excluded unit price */}
            <label className="form-control">
              <div className="label py-1">
                <span className="label-text">Unit price (VAT excl.)</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <FaTag size={18} />
                </span>
              </div>
              <input
                className="input input-bordered w-full h-12 md:h-10"
                value={form.unit_price_vat_excl}
                type="number"
                step="0.01"
                onChange={onUnitPriceExclChange}
                placeholder="0.00"
              />
            </label>

            {/* Tax rate */}
            <label className="form-control">
              <div className="label py-1">
                <span className="label-text">Tax rate</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <FaPercent size={18} />
                </span>
              </div>
              <input
                className="input input-bordered w-full h-12 md:h-10"
                value={form.tax_rate}
                onChange={onTaxRateChange}
                placeholder="Tax rate (%)"
              />
            </label>

            {/* Tax included unit price (read-only) */}
            <label className="form-control">
              <div className="label py-1">
                <span className="label-text">Unit price (VAT incl.)</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <FaTag size={18} />
                </span>
              </div>
              <input
                className="input input-bordered w-full h-12 md:h-10"
                value={form.unit_price_vat_incl}
                type="number"
                placeholder="0.00"
                disabled
              />
            </label>

            {/* Description */}
            <label className="form-control md:col-span-2">
              <div className="label py-1">
                <span className="label-text">Description</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <FaFileLines size={18} />
                </span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full min-h-28 md:min-h-24"
                value={form.description}
                onChange={onChange('description')}
                placeholder="Description"
              />
            </label>
          </div>

          {/* Meta (same divider style as CustomerDetailsPage) */}
          <div className="mt-6">
            <div className="divider my-2 text-md opacity-60">Meta</div>
            <div className="text-sm sm:text-md opacity-70 space-y-1">
              <div>
                <b>Product ID:</b> {initial.id}
              </div>
              <div>
                <b>Company ID:</b> {initial.company_id}
              </div>
              <div>
                <b>Created:</b>{' '}
                {initial.created_at ? new Date(initial.created_at).toLocaleString('fi-FI') : '—'}
              </div>
              <div>
                <b>Updated:</b>{' '}
                {initial.updated_at ? new Date(initial.updated_at).toLocaleString('fi-FI') : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
