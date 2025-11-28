// app/invoices/[id]/page.jsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import { RiMoneyEuroBoxFill } from "react-icons/ri";

import {
    FaUser
} from "react-icons/fa6";
import { FaCalendarDay } from "react-icons/fa";
import Link from 'next/link';

export default function InvoiceDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        async function fetchInvoice() {
            try {
                const res = await fetch(`/api/invoices/${id}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch invoice data');
                }
                const data = await res.json();
                console.log(data.invoice);
                setInvoice(data.invoice ?? null);
            } catch (err) {
                console.error(err);
                toast.error(`Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }

        fetchInvoice();
    }, [id]);

    const displayTitle = useMemo(() => {
        if (!invoice) return '';
        // Prefer some kind of human-readable invoice number if available
        return (
            `Invoice # ${invoice.invoice_number}` ||
            ''
        );
    }, [invoice]);

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

    if (!invoice) {
        return (
            <div className="flex justify-center items-start min-h-screen py-5">
                <ToastContainer />
                <div className="w-full max-w-4xl flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Invoice not found</h1>
                        <button className="btn btn-ghost" onClick={() => router.back()}>
                            Back
                        </button>
                    </div>
                    <p className="text-gray-500">
                        We couldn&rsquo;t find an invoice with id <code>{id}</code>.
                    </p>
                </div>
            </div>
        );
    }

    const totalAmountVatExclDisplay =
        invoice.total_amount_vat_excl === null || invoice.total_amount_vat_excl === undefined
            ? '0.00'
            : Number(invoice.total_amount_vat_excl).toFixed(2);

    const totalAmountVatInclDisplay =
        invoice.total_amount_vat_incl === null || invoice.total_amount_vat_incl === undefined
            ? '0.00'
            : Number(invoice.total_amount_vat_incl).toFixed(2);

    const orderDateDisplay = invoice.order_date
        ? new Date(invoice.order_date).toLocaleDateString('fi-FI')
        : '—';

    const createdAtDisplay = invoice.created_at
        ? new Date(invoice.created_at).toLocaleString('fi-FI')
        : '—';

    const updatedAtDisplay = invoice.updated_at
        ? new Date(invoice.updated_at).toLocaleString('fi-FI')
        : '—';

    const items = invoice.items ?? [];

    return (
        <div className="flex justify-center items-start min-h-screen py-5 px-5">
            <ToastContainer />

            <div className="w-full max-w-7xl flex items-center gap-4">
                <div className="flex w-full flex-col gap-4">
                    {/* Title + buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-bold">
                                {displayTitle || 'invoice details'}
                            </h1>
                            <span className="badge badge-neutral mt-1 w-fit">
                                {invoice.status ?? 'pending'}
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
                                onClick={() => router.push(`/invoices/${id}/edit`)}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => window.open(`/api/invoices/${id}/invoice`, '_blank')}
                            >
                                Print Invoice
                            </button>
                        </div>
                    </div>

                    {/* Client & basic info */}
                    <div className="join w-md">
                        <span className="join-item px-3 text-gray-500 flex items-center">
                            <FaUser size={18} />
                        </span>
                        <Link href={`/customers/${invoice.customer_id}`}>
                            {invoice.customer_name ?? ''}
                        </Link>
                    </div>

                    {/* invoice date */}
                    <div className="join w-md">
                        <span className="join-item px-3 text-gray-500 flex items-center">
                            <FaCalendarDay size={18} />
                        </span>
                        {orderDateDisplay}
                    </div>

                    {/* Total amount VAT excl. */}
                    <div className="join w-md">
                        <span className="join-item px-3 text-gray-500 flex items-center">
                            <RiMoneyEuroBoxFill size={18} />
                        </span>
                        {totalAmountVatExclDisplay} € (excl. VAT)
                    </div>

                    {/* Total VAT amount */}
                    <div className="join w-md">
                        <span className="join-item px-3 text-gray-500 flex items-center">
                            <RiMoneyEuroBoxFill size={18} />
                        </span>
                        {(Number(invoice.total_amount_vat_incl || 0) - Number(invoice.total_amount_vat_excl || 0)).toFixed(2)} € (VAT)
                    </div>

                    {/* Total amount VAT incl. */}
                    <div className="join w-md">
                        <span className="join-item px-3 text-gray-500 flex items-center">
                            <RiMoneyEuroBoxFill size={18} />
                        </span>
                        {totalAmountVatInclDisplay} € (incl. VAT)
                    </div>

                    {/* Items section */}
                    <div className="mt-4">
                        <span className="text-gray-500">invoice items</span>
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
                                                    <Link href={`/inventory/${item.product_id}`}>
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
                    <div>
                        <p>{invoice.extra_info}</p>
                    </div>

                    {/* Meta info */}
                    <div className="mt-10">
                        <span className="text-gray-500">Meta data</span>
                        <hr className="mt-2 border-gray-300" />
                    </div>
                    <div className="text-sm text-gray-500">
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
