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

            <div className="w-full max-w-7xl flex items-center gap-4">
                <div className="flex w-full flex-col gap-4">
                    {/* Title + buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-bold">
                                {displayTitle || 'invoice details'}
                            </h1>
                            <span className="badge badge-neutral mt-1 w-fit">
                                {invoice.status ?? 'draft'}
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

                    {/* Invoice details */}
                    <div className="mt-8 w-7/12">
                        <span className="text-gray-500">Invoice details</span>
                        <hr className="mt-2 mb-4 border-gray-300" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-x-10 gap-y-2 w-7/12">
                        <div className="flex items-center gap-4 h-full">
                            <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                                <FaUser size={16} />
                                <span>Customer</span>
                            </div>
                            <div className="flex-1 text-sm">
                                <Link
                                    href={`/customers/${invoice.customer_id}`}
                                    className="underline break-words"
                                >
                                    {invoice.customer?.name ?? '—'}
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 h-full">
                            <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                                <FaCalendarDay size={16} />
                                <span>Delivery date</span>
                            </div>
                            <div className="flex-1">
                                <div className="h-10 flex items-center text-sm justify-self-end">
                                    {deliveryDateDisplay}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 h-full">
                            <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                                <FaList size={16} />
                                <span>Order</span>
                            </div>
                            <div className="flex-1 text-sm">
                                {invoice.order ? (
                                    <Link
                                        href={`/orders/${invoice.order_id}`}
                                        className="underline break-words"
                                    >
                                        {`Order #${invoice.order.order_number || invoice.order.id}`}
                                    </Link>
                                ) : (
                                    '—'
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 h-full">
                            <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                                <FaCalendarDays size={16} />
                                <span>Days until due</span>
                            </div>
                            <div className="flex-1">
                                <div className="h-10 flex items-center text-sm justify-self-end">
                                    {daysUntilDueDisplay}
                                </div>
                            </div>
                        </div>

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

                        <div className="flex items-center gap-4 h-full">
                            <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                                <FaCalendarDay size={16} />
                                <span>Due date</span>
                            </div>
                            <div className="flex-1">
                                <div className="h-10 flex items-center text-sm justify-self-end">
                                    {dueDateDisplay}
                                </div>
                            </div>
                        </div>
                        
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

                        <div className="flex items-center gap-4 h-full">
                            <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                                <FaUserGear size={16} />
                                <span>Custom reference?</span>
                            </div>
                            <div className="flex-1">
                                <div className="h-10 flex items-center text-sm justify-self-end">
                                    {usesCustomReference ? 'Yes' : 'No'}
                                </div>
                            </div>
                        </div>

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

                        <div className="flex items-center gap-4 h-full">
                            <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                                <FaBook size={16} />
                                <span>Reference</span>
                            </div>
                            <div className="flex-1">
                                <div className="h-10 flex items-center text-sm justify-self-end">
                                    {referenceDisplay}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 h-full">
                            <div className="w-40 flex items-center gap-2 text-sm text-gray-500">
                                <FaCalendarDay size={16} />
                                <span>Issue date</span>
                            </div>
                            <div className="flex-1">
                                <div className="h-10 flex items-center text-sm">
                                    {issueDateDisplay}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items section */}
                    <div className="mt-4">
                        <span className="text-gray-500">Items of the order</span>
                        <hr className="mt-2 mb-1 border-gray-300" />
                    </div>

                    {invoice.order.items.length === 0 ? (
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
                                    {invoice.order.items.map((item) => {
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
                                                    <Link href={`/inventory/${item.product_id}`} className="underline">
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
                    <div className="whitespace-pre-line">
                        {invoice.extra_info}
                    </div>


                    {/* Meta info */}
                    <div className="mt-10">
                        <span className="text-gray-500">Meta data</span>
                        <hr className="mt-2 border-gray-300" />
                    </div>
                    <div className="text-sm text-gray-500">
                        <p>
                            Created:{' '}
                            {new Date(invoice.created_at).toLocaleString('fi-FI')}
                        </p>
                        <p>
                            Updated:{' '}
                            {new Date(invoice.updated_at).toLocaleString('fi-FI')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
