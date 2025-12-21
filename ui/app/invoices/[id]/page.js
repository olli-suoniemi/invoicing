// app/invoices/[id]/page.jsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { RiMoneyEuroBoxFill } from "react-icons/ri";
import { FaList, FaBook, FaCalendarDay } from "react-icons/fa";
import { FaCalendarDays, FaUser, FaUserGear } from "react-icons/fa6";
import LoadingSpinner from '@/components/loadingSpinner';
import Link from 'next/link';
import SendInvoiceModal from '@/components/SendInvoiceModal';


export default function InvoiceDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sendOpen, setSendOpen] = useState(false);

    const defaultTo = invoice?.customer?.email ?? '';
    const defaultSubject = invoice ? 
        `Invoice #${invoice.invoice_number} from ${invoice.customer?.name ?? ''}`.trim() : 
        '';
    const defaultText = invoice
    ? [
        `Hi ${invoice.customer?.name ?? ''},`,
        '',
        `Please find your invoice #${invoice.invoice_number} attached.`,
        '',
        'Best regards,',
        'Demo Company',
        ].join('\n')
    : '';

    useEffect(() => {
        if (!id) return;

        async function fetchInvoice() {
            try {
                const res = await fetch(`/api/invoices/${id}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch invoice data');
                }
                const data = await res.json();
                setInvoice(data.invoice ?? null);
                console.log('Fetched invoice data:', data);
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

    const handleMarkingAsSent = async () => {
        // PUT to update invoice status to "sent"
        const payload = { 
            reference: invoice.reference,
            issue_date: invoice.issue_date,
            days_until_due: invoice.days_until_due,
            due_date: invoice.due_date,
            delivery_date: invoice.delivery_date,
            extra_info: invoice.extra_info,
            show_info_on_invoice: invoice.show_info_on_invoice,
            status: 'sent' 
        };
        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                throw new Error('Failed to update invoice status');
            }
            const data = await res.json();
            setInvoice(data.invoice);
            toast.success('Invoice marked as sent');
        } catch (err) {
            console.error(err);
            toast.error(`Error: ${err.message}`);
        }
    };

    const handleMarkingAsPaid = async () => {
        // PUT to update invoice status to "paid"
        const payload = { 
            reference: invoice.reference,
            issue_date: invoice.issue_date,
            days_until_due: invoice.days_until_due,
            due_date: invoice.due_date,
            delivery_date: invoice.delivery_date,
            extra_info: invoice.extra_info,
            show_info_on_invoice: invoice.show_info_on_invoice,
            status: 'paid' 
        };
        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                throw new Error('Failed to update invoice status');
            }
            const data = await res.json();
            setInvoice(data.invoice);
            toast.success('Invoice marked as paid');
        } catch (err) {
            console.error(err);
            toast.error(`Error: ${err.message}`);
        }
    };

    if (loading) {
        return (
        <LoadingSpinner />
        );
    }

    if (!invoice) {
        return (
            <div className="flex justify-center items-start min-h-screen py-5">
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
        invoice.total_amount_vat_excl == null
            ? '0.00'
            : Number(invoice.total_amount_vat_excl).toFixed(2);

    const totalAmountVatInclDisplay =
        invoice.total_amount_vat_incl == null
            ? '0.00'
            : Number(invoice.total_amount_vat_incl).toFixed(2);

    const vatAmountDisplay = (
        Number(invoice.total_amount_vat_incl || 0) -
        Number(invoice.total_amount_vat_excl || 0)
    ).toFixed(2);

    const issueDateDisplay = invoice.issue_date
        ? new Date(invoice.issue_date).toLocaleDateString('fi-FI')
        : '—';

    const deliveryDateDisplay = invoice.delivery_date
        ? new Date(invoice.delivery_date).toLocaleDateString('fi-FI')
        : '—';

    const dueDateDisplay = invoice.due_date
        ? new Date(invoice.due_date).toLocaleDateString('fi-FI')
        : '—';

    const daysUntilDueDisplay =
        invoice.days_until_due == null ? '—' : String(invoice.days_until_due);

    const usesCustomReference = Boolean(invoice.customer?.require_manual_reference);

    const referenceDisplay =
        invoice.reference ??
        (usesCustomReference ? '—' : 'Auto-generated');


    return (
        <div className="flex justify-center items-start min-h-screen py-5 px-5">
            <SendInvoiceModal
                open={sendOpen}
                onClose={() => setSendOpen(false)}
                initialTo={defaultTo}
                initialSubject={defaultSubject}
                initialText={defaultText}
                onSubmit={async ({ to, subject, text }) => {
                    const res = await fetch(`/api/invoices/${id}/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ to, subject, text }),
                    });
                    if (!res.ok) throw new Error(await res.text());
                }}
            />

            <div className="w-full max-w-7xl">
                <div className="flex w-full flex-col gap-4">
                    {/* Title + buttons */}
                    {/* DESKTOP */}
                    <div className="hidden md:flex items-center justify-between">
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-bold">
                                {displayTitle || 'Invoice details'}
                            </h1>
                            <span className="badge badge-neutral mt-1 w-fit">
                                {invoice.status ?? 'draft'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className='flex flex-row gap-2'>
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
                                    className="btn btn-info ml-4"
                                    onClick={handleMarkingAsSent}
                                >
                                    Mark as sent
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-accent"
                                    onClick={handleMarkingAsPaid}
                                >
                                    Mark as paid
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary ml-4"
                                    onClick={() => window.open(`/api/invoices/${id}/print`, '_blank')}
                                >
                                    Print Invoice
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setSendOpen(true)}>
                                    Send Invoice
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MOBILE */}
                    <div className="md:hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <button className="btn btn-ghost btn-md" onClick={() => router.back()}>
                                &larr; Back
                            </button>
                        
                            <div className="dropdown dropdown-end">
                                <button type="button" className="btn btn-ghost btn-md">
                                    Actions
                                </button>

                                <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-56">
                                    <li>
                                        <button type="button" onClick={() => router.push(`/invoices/${id}/edit`)}>
                                            Edit invoice
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" onClick={handleMarkingAsSent}>
                                            Mark as sent
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" onClick={handleMarkingAsPaid}>
                                            Mark as paid
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" onClick={() => window.open(`/api/invoices/${id}/print`, '_blank')}>
                                            Print invoice
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" onClick={() => setSendOpen(true)}>
                                            Send invoice
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold">{displayTitle || 'Invoice details'}</h1>
                            <span className="badge badge-neutral mt-1 w-fit">{invoice.status ?? 'draft'}</span>
                        </div>
                    </div>

                    {/* DETAILS */}
                    <div className="rounded-xl border md:border-none border-base-300 px-4">
                        <div className="mt-4 md:w-7/12">
                            <span className="text-gray-500">Invoice details</span>
                            <hr className="mt-2 mb-4 border-gray-300" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-x-10 md:gap-2 gap-5 w-7/12">
                            {/* Left: general info */}
                            <div className="flex flex-col md:gap-3 gap-5">
                                {/* Order */}
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                                        <FaList size={16} />
                                        <span>Order</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="md:h-10 flex items-center text-sm">
                                            {invoice.order_id ? (
                                                <Link href={`/orders/${invoice.order_id}`} className="underline">
                                                    # {invoice.order.order_number || invoice.order_id}
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Customer */}
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                                        <FaUser size={16} />
                                        <span>Customer</span>
                                    </div>
                                    <div className="flex-1">
                                        <Link href={`/customers/${invoice.customer_id}`} className="underline md:h-10 flex items-center text-sm">
                                            {invoice.customer.name ?? '—'}
                                        </Link>
                                    </div>
                                </div>
                                
                                {/* Issue date */}
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                                        <FaCalendarDay size={16} />
                                        <span>Issue date</span>
                                    </div>
                                    <div className="flex-1 text-sm">
                                        <div className="md:h-10 flex items-center">
                                            {issueDateDisplay}
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery date */}
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                                        <FaCalendarDay size={16} />
                                        <span>Delivery date</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="md:h-10 flex items-center text-sm">
                                            {deliveryDateDisplay}
                                        </div>
                                    </div>
                                </div>

                                {/* Days until due */}
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                                        <FaCalendarDay size={16} />
                                        <span>Days until due</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="md:h-10 flex items-center text-sm">
                                            {daysUntilDueDisplay}
                                        </div>
                                    </div>
                                </div>

                                {/* Due date */}
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                                        <FaCalendarDay size={16} />
                                        <span>Due date</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="md:h-10 flex items-center text-sm">
                                            {dueDateDisplay}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: totals (always together) */}
                            <div className="flex flex-col md:gap-3 gap-5">
                                {/* Custom reference? */}
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                                        <FaUserGear size={16} />
                                        <span>Custom reference?</span>
                                    </div>
                                    <div className="flex-1 text-sm">
                                        <div className="md:h-10 flex items-center md:justify-end">
                                            {usesCustomReference ? 'Yes' : 'No'}
                                        </div>
                                    </div>
                                </div>

                                {/* Reference */}
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                                        <FaBook size={16} />
                                        <span>Reference</span>
                                    </div>
                                    <div className="flex-1 text-sm">
                                        <div className="md:h-10 flex items-center md:justify-end">
                                            {referenceDisplay}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Total excl. VAT */}
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                                        <RiMoneyEuroBoxFill size={16} />
                                        <span>Total (excl. VAT)</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="md:h-10 flex items-center text-sm md:justify-end">
                                        {totalAmountVatExclDisplay} €
                                        </div>
                                    </div>
                                </div>

                                {/* VAT amount */}
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                                        <RiMoneyEuroBoxFill size={16} />
                                        <span>VAT amount</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="md:h-10 flex items-center text-sm md:justify-end">
                                        {vatAmountDisplay} €
                                        </div>
                                    </div>
                                </div>

                                {/* Total incl. VAT */}
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mb-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 md:w-40">
                                        <RiMoneyEuroBoxFill size={16} />
                                        <span>Total (incl. VAT)</span>
                                    </div>
                                    <div className="flex-1 text-sm font-semibold">
                                        <div className="md:h-10 flex items-center md:justify-end">
                                            {totalAmountVatInclDisplay} €
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items section */}
                    <div className="rounded-xl border md:border-none border-base-300 px-4">
                        <div className="mt-4">
                            <span className="text-gray-500">Items of the order</span>
                            <hr className="mt-2 mb-1 border-gray-300" />
                        </div>

                        {invoice.order.items.length === 0 ? (
                        <p className="text-gray-500">No items in this invoice.</p>
                        ) : (
                        <>
                            {/* MOBILE */}
                            <div className="md:hidden flex flex-col gap-3 py-2">
                            {invoice.order.items.map((item) => (
                                <div key={item.id}>
                                <div className="font-semibold mb-2">
                                    <Link href={`/inventory/${item.product_id}`} className="underline">
                                    {item.product_name ?? item.product_id ?? '-'}
                                    </Link>
                                </div>

                                <div className="text-sm text-gray-500 mb-2">
                                    EAN: {item.ean_code ?? '-'}
                                </div>
                                <div className="text-sm text-gray-500 mb-2">
                                    Qty: {item.quantity ?? 0}
                                </div>
                                <div className="text-sm text-gray-500 mb-2">
                                    Unit price (excl. VAT): {Number(item.unit_price_vat_excl ?? 0).toFixed(2)} €
                                </div>
                                <div className="text-sm text-gray-500 mb-2">
                                    VAT rate: {item.tax_rate ?? '0'} %
                                </div>
                                <div className="text-sm text-gray-500 mb-2">
                                    VAT amount per unit:{' '}
                                    {Number((item.unit_price_vat_incl ?? 0) - (item.unit_price_vat_excl ?? 0)).toFixed(2)} €
                                </div>
                                <div className="text-sm text-gray-500 mb-2">
                                    Unit price (incl. VAT): {Number(item.unit_price_vat_incl ?? 0).toFixed(2)} €
                                </div>
                                <div className="text-sm text-gray-500 mb-2">
                                    Total (excl. VAT): {Number(item.total_price_vat_excl ?? 0).toFixed(2)} €
                                </div>
                                <div className="text-sm font-medium">
                                    Total (incl. VAT): {Number(item.total_price_vat_incl ?? 0).toFixed(2)} €
                                </div>
                                </div>
                            ))}
                            </div>

                            {/* DESKTOP: table */}
                            <div className="hidden md:block overflow-x-auto">
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
                                {invoice.order.items.map((item) => {
                                    const quantity = item.quantity ?? 0;
                                    const unit_price_vat_excl =
                                    item.unit_price_vat_excl == null ? 0 : Number(item.unit_price_vat_excl);
                                    const unit_price_vat_incl =
                                    item.unit_price_vat_incl == null ? 0 : Number(item.unit_price_vat_incl);

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
                                        <Link href={`/inventory/${item.product_id}`} className="underline">
                                            {item.product_name ?? item.product_id ?? '-'}
                                        </Link>
                                        </td>
                                        <td className="text-right">{item.ean_code ?? '-'}</td>
                                        <td className="text-right">{quantity}</td>
                                        <td className="text-right">{unit_price_vat_excl.toFixed(2)}</td>
                                        <td className="text-right">{item.tax_rate ?? '-'}</td>
                                        <td className="text-right">
                                        {(unit_price_vat_incl - unit_price_vat_excl).toFixed(2)}
                                        </td>
                                        <td className="text-right">{unit_price_vat_incl.toFixed(2)}</td>
                                        <td className="text-right">{totalPriceVatExcl.toFixed(2)}</td>
                                        <td className="text-right">{totalPriceVatIncl.toFixed(2)}</td>
                                    </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                            </div>
                        </>
                        )}
                    </div>

                    {/* Notes on invoice */}
                    <div className="rounded-xl border md:border-none border-base-300 px-4">
                        <div className='mt-4'>
                            <span className="text-gray-500">Notes on invoice</span>
                            <hr className="mt-2 mb-2 border-gray-300" />
                        </div>
                        <p className="text-sm mb-2">{invoice.extra_info || '—'}</p>
                    </div>
                    
                    {/* Notes on order */}
                    <div className="rounded-xl border md:border-none border-base-300 px-4">
                        <div className='mt-4'>
                            <span className="text-gray-500">Notes on order</span>
                            <hr className="mt-2 mb-2 border-gray-300" />
                        </div>
                        <p className="text-sm mb-2">{invoice.order.extra_info || '—'}</p>
                    </div>

                    {/* Meta info */}
                    <div className="rounded-xl border md:border-none border-base-300 px-4">
                        <div className='mt-4'>
                            <span className="text-gray-500">Meta information</span>
                            <hr className="mt-2 mb-2 border-gray-300" />
                        </div>
                        <p className="text-sm">
                            Created:{' '}
                            {new Date(invoice.created_at).toLocaleString('fi-FI')}
                        </p>
                        <p className="text-sm mb-2">
                            Updated:{' '}
                            {new Date(invoice.updated_at).toLocaleString('fi-FI')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
