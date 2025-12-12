// app/invoices/[id]/edit/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { RiMoneyEuroBoxFill } from "react-icons/ri";
import { FaList, FaBook, FaQuestion } from "react-icons/fa";
import { FaCalendarDays, FaUser } from "react-icons/fa6";
import { FaCalendarDay } from "react-icons/fa";
import Link from 'next/link';
import LoadingSpinner from '@/components/loadingSpinner';

export default function InvoiceEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [initialInvoice, setInitialInvoice] = useState(null); // original from server
  const [invoice, setInvoice] = useState(null);               // editable copy
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---- Helpers ----
  const formatDateForInput = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${year}-${month}-${day}`; // what <input type="date"> expects
  };

  const normalizeForCompare = (inv) => {
    if (!inv) return null;
    return {
      issue_date: inv.issue_date || '',
      delivery_date: inv.delivery_date || '',
      due_date: inv.due_date || '',
      days_until_due:
        inv.days_until_due === null || inv.days_until_due === undefined
          ? ''
          : String(inv.days_until_due),
      reference: inv.reference || '',
      extra_info: inv.extra_info || '',
      show_info_on_invoice: inv.show_info_on_invoice || false,
    };
  };

  // ---- Load invoice ----
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch invoice data');
        }
        const data = await res.json();
        const inv = data.invoice ?? null;
        if (!inv) {
          setInitialInvoice(null);
          setInvoice(null);
          return;
        }

        setInitialInvoice(inv);

        // Editable copy: dates formatted for <input type="date">
        setInvoice({
          ...inv,
          issue_date: formatDateForInput(inv.issue_date),
          delivery_date: formatDateForInput(inv.delivery_date),
          due_date: formatDateForInput(inv.due_date),
          // keep days_until_due as number or null; reference as string/null
        });
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const hasChanges = useMemo(() => {
    if (!initialInvoice || !invoice) return false;

    const initNorm = normalizeForCompare({
      issue_date: formatDateForInput(initialInvoice.issue_date),
      delivery_date: formatDateForInput(initialInvoice.delivery_date),
      due_date: formatDateForInput(initialInvoice.due_date),
      days_until_due: initialInvoice.days_until_due,
      reference: initialInvoice.reference,
      extra_info: initialInvoice.extra_info,
      show_info_on_invoice: initialInvoice.show_info_on_invoice,
    });

    const currNorm = normalizeForCompare(invoice);

    return JSON.stringify(initNorm) !== JSON.stringify(currNorm);
  }, [initialInvoice, invoice]);

  if (loading || !initialInvoice || !invoice) {
    return (
      <LoadingSpinner />
    );
  }

  const totalAmountVatExclDisplay =
    initialInvoice.total_amount_vat_excl == null
      ? '0.00'
      : Number(initialInvoice.total_amount_vat_excl).toFixed(2);

  const totalAmountVatInclDisplay =
    initialInvoice.total_amount_vat_incl == null
      ? '0.00'
      : Number(initialInvoice.total_amount_vat_incl).toFixed(2);

  const vatAmountDisplay = (
    Number(initialInvoice.total_amount_vat_incl || 0) -
    Number(initialInvoice.total_amount_vat_excl || 0)
  ).toFixed(2);

  const issueDateDisplay = invoice.issue_date || '';
  const deliveryDateDisplay = invoice.delivery_date || '';
  const dueDateDisplay = invoice.due_date || '';

  const createdAtDisplay = initialInvoice.created_at
    ? new Date(initialInvoice.created_at).toLocaleString('fi-FI')
    : '—';

  const updatedAtDisplay = initialInvoice.updated_at
    ? new Date(initialInvoice.updated_at).toLocaleString('fi-FI')
    : '—';

  const daysUntilDueDisplay =
    invoice.days_until_due == null || invoice.days_until_due === ''
      ? ''
      : String(invoice.days_until_due);

  const usesCustomReference = Boolean(initialInvoice.customer?.require_manual_reference);

  const items = initialInvoice.order?.items ?? [];

  const computeDueDateFromDays = (issueDate, daysUntilDue) => {
    if (!issueDate || daysUntilDue === '' || daysUntilDue == null) return '';

    const days = Number(daysUntilDue);
    if (Number.isNaN(days)) return '';

    const base = new Date(issueDate); // `issueDate` is already yyyy-mm-dd from the date input
    if (Number.isNaN(base.getTime())) return '';

    base.setDate(base.getDate() + days);

    // Reuse your existing formatter
    return formatDateForInput(base.toISOString());
  };

  // ---- Handlers ----
  const handleChangeField = (field, value) => {
    setInvoice((prev) => {
      let next = {
        ...prev,
        [field]:
          field === 'days_until_due'
            ? (value === '' ? '' : Number(value))
            : value,
      };

      // Recompute due_date whenever the relevant fields change
      if (field === 'issue_date' || field === 'days_until_due') {
        next.due_date = computeDueDateFromDays(
          next.issue_date,
          next.days_until_due
        );
      }

      return next;
    });
  };


  const resetForm = () => {
    if (!initialInvoice) return;
    setInvoice({
      ...initialInvoice,
      issue_date: formatDateForInput(initialInvoice.issue_date),
      delivery_date: formatDateForInput(initialInvoice.delivery_date),
      due_date: formatDateForInput(initialInvoice.due_date),
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        issue_date: invoice.issue_date || null,
        delivery_date: invoice.delivery_date || null,
        due_date: invoice.due_date || null,
        days_until_due:
          invoice.days_until_due === '' || invoice.days_until_due == null
            ? null
            : Number(invoice.days_until_due),
        reference: invoice.reference || null,
        extra_info: invoice.extra_info || null,
        show_info_on_invoice: invoice.show_info_on_invoice || false,
        status: invoice.status || null,
      };

      const resp = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Upstream error');
      }

      const data = await resp.json();
      const updated = data.invoice ?? null;

      if (updated) {
        setInitialInvoice(updated);
        setInvoice({
          ...updated,
          issue_date: formatDateForInput(updated.issue_date),
          delivery_date: formatDateForInput(updated.delivery_date),
          due_date: formatDateForInput(updated.due_date),
          show_info_on_invoice: updated.show_info_on_invoice || false,
        });
      }

      toast.success('Invoice updated!');
    } catch (err) {
      console.error(err);
      toast.error(`Error updating invoice: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const referencePlaceholder = usesCustomReference
    ? 'Enter reference'
    : 'Auto-generated';

  const referenceValue =
    invoice.reference ??
    (usesCustomReference ? '' : '');

  return (
    <div className="flex justify-center items-start min-h-screen py-5 px-5">

      <div className="w-full max-w-7xl flex items-center gap-4">
        <div className="flex w-full flex-col gap-4">
          {/* Title + buttons */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">
                Edit invoice #{initialInvoice.invoice_number}
              </h1>
              <span className="badge badge-neutral mt-1 w-fit">
                {initialInvoice.status ?? 'draft'}
              </span>
            </div>
            <div className="flex items-center gap-2">
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
                onClick={resetForm}
                disabled={!hasChanges || saving}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`btn btn-primary ${
                  !hasChanges
                    ? 'btn-disabled opacity-50 cursor-not-allowed'
                    : ''
                }`}
                aria-disabled={!hasChanges || saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          {/* Invoice details */}
          <div className="mt-8 w-7/12">
            <span className="text-gray-500">Invoice details</span>
            <hr className="mt-2 mb-4 border-gray-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-x-10 gap-y-2 w-7/12">
            {/* Customer */}
            <div className="flex items-center gap-4 h-full">
              <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                <FaUser size={16} />
                <span>Customer</span>
              </div>
              <div className="flex-1 text-sm">
                <Link
                  href={`/customers/${initialInvoice.customer_id}`}
                  className="underline break-words"
                >
                  {initialInvoice.customer?.name ?? '—'}
                </Link>
              </div>
            </div>

            {/* Delivery date (editable) */}
            <div className="flex items-center gap-4 h-full">
              <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                <FaCalendarDay size={16} />
                <span>Delivery date</span>
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  className="input input-bordered w-full h-10 text-sm"
                  value={deliveryDateDisplay}
                  onChange={(e) =>
                    handleChangeField('delivery_date', e.target.value || '')
                  }
                />
              </div>
            </div>


            {/* Order link */}
            <div className="flex items-center gap-4 h-full">
              <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                <FaList size={16} />
                <span>Order</span>
              </div>
              <div className="flex-1 text-sm">
                {initialInvoice.order ? (
                  <Link
                    href={`/orders/${initialInvoice.order_id}`}
                    className="underline break-words"
                  >
                    {`Order #${initialInvoice.order.order_number || initialInvoice.order.id}`}
                  </Link>
                ) : (
                  '—'
                )}
              </div>
            </div>


            {/* Days until due (editable) */}
            <div className="flex items-center gap-4 h-full">
              <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                <FaCalendarDays size={16} />
                <span>Days until due</span>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min={0}
                  className="input input-bordered w-full h-10 text-sm"
                  value={daysUntilDueDisplay}
                  onChange={(e) =>
                    handleChangeField(
                      'days_until_due',
                      e.target.value === '' ? '' : e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* Total excl. VAT (read-only) */}
            <div className="flex items-center gap-4 h-full">
              <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                <RiMoneyEuroBoxFill size={16} />
                <span>Total (excl. VAT)</span>
              </div>
              <div className="flex-1">
                <div className="h-10 flex items-center text-sm">
                  {totalAmountVatExclDisplay} €
                </div>
              </div>
            </div>

            {/* Due date (computed, read-only text) */}
            <div className="flex items-center gap-4 h-full">
              <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                <FaCalendarDay size={16} />
                <span>Due date</span>
              </div>
              <div className="flex-1">
                <div className="h-10 flex items-center text-sm justify-self-end">
                  {dueDateDisplay || '—'}
                </div>
              </div>
            </div>


            {/* VAT amount (read-only) */}
            <div className="flex items-center gap-4 h-full">
              <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                <RiMoneyEuroBoxFill size={16} />
                <span>VAT amount</span>
              </div>
                <div className="flex-1">
                  <div className="h-10 flex items-center text-sm">
                    {vatAmountDisplay} €
                  </div>
                </div>
            </div>

            {/* Custom reference? (read-only) */}
            <div className="flex items-center gap-4 h-full">
              <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                <FaQuestion size={16} />
                <span>Custom reference?</span>
              </div>
              <div className="flex-1">
                <div className="h-10 flex items-center text-sm justify-self-end">
                  {usesCustomReference ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            {/* Total incl. VAT (read-only) */}
            <div className="flex items-center gap-4 h-full">
              <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                <RiMoneyEuroBoxFill size={16} />
                <span>Total (incl. VAT)</span>
              </div>
              <div className="flex-1">
                <div className="h-10 flex items-center text-sm">
                  {totalAmountVatInclDisplay} €
                </div>
              </div>
            </div>

            {/* Reference (editable if custom required) */}
            <div className="flex items-center gap-4 h-full">
              <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                <FaBook size={16} />
                <span>Reference</span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  className="input input-bordered w-full h-10 text-sm"
                  value={referenceValue}
                  onChange={(e) =>
                    handleChangeField('reference', e.target.value)
                  }
                  disabled={!usesCustomReference}
                  placeholder={referencePlaceholder}
                />
              </div>
            </div>

            {/* Issue date (editable) */}
            <div className="flex items-center gap-4 h-full">
              <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                <FaCalendarDay size={16} />
                <span>Issue date</span>
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  className="input input-bordered w-full h-10 text-sm"
                  value={issueDateDisplay}
                  onChange={(e) =>
                    handleChangeField('issue_date', e.target.value || '')
                  }
                />
              </div>
            </div>
          </div>

          {/* Items section (read-only, from order) */}
          <div className="mt-4">
            <span className="text-gray-500">Items of the order</span>
            <hr className="mt-2 mb-1 border-gray-300" />
          </div>

          {items.length === 0 ? (
            <p className="text-gray-500">No items in this invoice.</p>
          ) : (
            <div className="overflow-x-auto">
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
                      item.unit_price_vat_excl == null
                        ? 0
                        : Number(item.unit_price_vat_excl);
                    const unit_price_vat_incl =
                      item.unit_price_vat_incl == null
                        ? 0
                        : Number(item.unit_price_vat_incl);
                    const totalPriceVatExcl =
                      item.total_price_vat_excl == null
                        ? quantity * unit_price_vat_excl
                        : Number(item.total_price_vat_excl);
                    const totalPriceVatIncl =
                      item.total_price_vat_incl == null
                        ? quantity * unit_price_vat_incl
                        : Number(item.total_price_vat_incl);

                    return (
                      <tr key={item.id}>
                        <td>
                          <Link
                            href={`/inventory/${item.product_id}`}
                            className="underline"
                          >
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
          )}

          {/* Notes */}
          <div className="mt-10">
            <span className="text-gray-500">Notes</span>
            <hr className="mt-2 border-gray-300" />
          </div>
          {/* Checkbox whether to show info on invoice */}
          <div className="form-control">
            <label className="cursor-pointer label">
              <span className="label-text">Show note on invoice</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={invoice.show_info_on_invoice ?? false}
                onChange={(e) =>
                  setInvoice((s) => ({
                    ...s,
                    show_info_on_invoice: e.target.checked,
                  }))
                }
              />
            </label>
          </div>
          <textarea
            className="textarea textarea-bordered w-2xl h-24"
            value={invoice.extra_info ?? ''}
            onChange={(e) =>
              setInvoice((s) => ({ ...s, extra_info: e.target.value }))
            }
          ></textarea>

          {/* Meta info */}
          <div className="mt-10">
            <span className="text-gray-500">Meta data</span>
            <hr className="mt-2 border-gray-300" />
          </div>
          <div className="text-sm text-gray-500">
            <p>Created: {createdAtDisplay}</p>
            <p>Updated: {updatedAtDisplay}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
