// app/orders/[id]/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import {
  FaUser,
  FaTag,
  FaPlus,
  FaMinus,
} from 'react-icons/fa6';
import CustomerSelect from '@/app/components/customerSelect';
import ProductSelect from '@/app/components/productSelect';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [initialOrder, setInitialOrder] = useState(null); // original order from server
  const [order, setOrder] = useState(null);               // editable copy

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Customers & products
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // For selects
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Load order
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) throw new Error('Failed to fetch order');
        const data = await res.json();
        const ord = data.order ?? null;
        if (!ord) {
          setInitialOrder(null);
          setOrder(null);
          return;
        }

        setInitialOrder(ord);

        console.log('Loaded order for edit:', ord);

        setOrder({
          customer_id: ord.customer_id ?? '',
          status: ord.status ?? 'pending',
          total_amount_vat_excl: ord.total_amount ?? 0,
          total_amount_vat_incl: ord.total_amount_vat_incl ?? 0,
          items:
            (ord.items ?? []).length > 0
              ? ord.items.map((item) => ({
                  id: item.id,
                  product_id: item.product_id ?? '',
                  quantity: String(item.quantity ?? '1'),
                  unit_price:
                    item.unit_price != null
                      ? String(item.unit_price)
                      : '0.00',
                  tax_rate:
                    item.tax_rate != null
                      ? String(item.tax_rate)
                      : '0.00',
                }))
              : [
                  {
                    product_id: '',
                    quantity: '1',
                    unit_price: '0.00',
                    tax_rate: '0.00',
                  },
                ],
        });
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Load customers
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/customers');
        if (!r.ok) throw new Error('Failed to load customers');
        const data = await r.json();
        setCustomers(data.customers || []);
      } catch (e) {
        console.error(e);
        toast.error(e.message || 'Failed to load customers');
      }
    })();
  }, []);

  // Load products
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/inventory');
        if (!r.ok) throw new Error('Failed to load products');
        const data = await r.json();
        setProducts(data.inventory || []);
      } catch (e) {
        console.error(e);
        toast.error(e.message || 'Failed to load products');
      }
    })();
  }, []);

  const customerOptions = useMemo(() => {
    return (customers || []).map((c) => {
      const namePart = c.name || '';
      const emailPart = c.email ? ` (${c.email})` : '';
      const label = `${namePart}${emailPart}`.trim() || c.id;
      return {
        value: c.id,
        label,
      };
    });
  }, [customers]);

  const productOptions = useMemo(() => {
    return (products || []).map((p) => ({
      value: p.id,
      label: p.name,
      unit_price: p.unit_price,
      tax_rate: p.tax_rate,
    }));
  }, [products]);

  // Keep customer select in sync with order.customer_id
  useEffect(() => {
    if (!order?.customer_id || customerOptions.length === 0) return;
    const found = customerOptions.find(
      (opt) => opt.value === order.customer_id,
    );
    setSelectedCustomer(found || null);
  }, [order?.customer_id, customerOptions]);

  const handleCustomerChangeInSelect = (option) => {
    if (!order) return;
    setSelectedCustomer(option);
    setOrder((s) => ({
      ...s,
      customer_id: option ? option.value : '',
    }));
  };

  const handleProductChangeInRow = (rowIndex, option) => {
    setOrder((prev) => {
      if (!prev) return prev;
      const items = [...prev.items];
      const updated = { ...items[rowIndex] };

      if (option) {
        updated.product_id = option.value;
        updated.unit_price =
          option.unit_price != null ? String(option.unit_price) : '0.00';
        updated.tax_rate =
          option.tax_rate != null ? String(option.tax_rate) : '0.00';
      } else {
        updated.product_id = '';
        updated.unit_price = '0.00';
        updated.tax_rate = '0.00';
      }

      items[rowIndex] = updated;
      return { ...prev, items };
    });
  };

  const updateItem = (index, field, value) => {
    setOrder((prev) => {
      if (!prev) return prev;
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setOrder((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            product_id: '',
            quantity: '1',
            unit_price: '0.00',
            tax_rate: '0.00',
          },
        ],
      };
    });
  };

  const removeItem = (index) => {
    setOrder((prev) => {
      if (!prev) return prev;
      if (prev.items.length === 1) return prev;
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items };
    });
  };

  const canEdit = initialOrder?.status === 'pending';

  const normalizeForCompare = (ord) => {
    if (!ord) return null;
    return {
      customer_id: ord.customer_id ?? '',
      status: ord.status ?? 'pending',
      items: (ord.items || []).map((it) => ({
        product_id: it.product_id ?? '',
        quantity: String(it.quantity ?? '1'),
        unit_price:
          it.unit_price != null ? String(it.unit_price) : '0.00',
        tax_rate:
          it.tax_rate != null ? String(it.tax_rate) : '0.00',
      })),
    };
  };

  const hasChanges = useMemo(() => {
    if (!initialOrder || !order) return false;

    const initNorm = normalizeForCompare({
      customer_id: initialOrder.customer_id,
      status: initialOrder.status,
      items: initialOrder.items ?? [],
    });

    const currNorm = normalizeForCompare(order);

    return JSON.stringify(initNorm) !== JSON.stringify(currNorm);
  }, [initialOrder, order]);

  const resetForm = () => {
    if (!initialOrder) return;
    setOrder({
      total_amount_vat_excl: initialOrder.total_amount_vat_excl ?? 0,
      total_amount_vat_incl: initialOrder.total_amount_vat_incl ?? 0,
      customer_id: initialOrder.customer_id ?? '',
      status: initialOrder.status ?? 'pending',
      items:
        (initialOrder.items ?? []).length > 0
          ? initialOrder.items.map((item) => ({
              product_id: item.product_id ?? '',
              quantity: String(item.quantity ?? '1'),
              unit_price:
                item.unit_price != null
                  ? String(item.unit_price)
                  : '0.00',
              tax_rate:
                item.tax_rate != null
                  ? String(item.tax_rate)
                  : '0.00',
            }))
          : [
              {
                product_id: '',
                quantity: '1',
                unit_price: '0.00',
                tax_rate: '0.00',
              },
            ],
    });
  };

  const handleSave = async () => {
    if (!order) return;

    if (!canEdit) {
      toast.error('Only pending orders can be edited.');
      return;
    }

    const customerId = order.customer_id.trim();
    if (!customerId) {
      toast.error('Customer is required');
      return;
    }

    if (!order.items.length) {
      toast.error('At least one order item is required');
      return;
    }

    const itemsPayload = [];
    for (const item of order.items) {
      const rowId = item.id;
      const productId = item.product_id.trim();
      const qtyStr = item.quantity.toString().trim();
      const priceStr = item.unit_price.toString().trim();

      if (!productId) {
        toast.error('Each item must have a product');
        return;
      }

      if (!qtyStr) {
        toast.error('Each item must have a quantity');
        return;
      }

      if (!priceStr) {
        toast.error('Each item must have a unit price');
        return;
      }

      const quantity = Number(qtyStr);
      const unitPrice = Number(priceStr);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        toast.error('Quantity must be a positive number');
        return;
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        toast.error('Unit price must be a non-negative number');
        return;
      }

      itemsPayload.push({
        id: rowId,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        total_price: quantity * unitPrice,
        tax_rate: toNumber(item.tax_rate)
      });
    }

    const total_amount = itemsPayload.reduce(
      (sum, it) => sum + it.total_price,
      0,
    );

    const payload = {
      customer_id: customerId,
      status: order.status || 'pending',
      total_amount,
      items: itemsPayload,
    };

    try {
      setSaving(true);
      const resp = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Upstream error');
      }

      const data = await resp.json();
      const updated = data.order ?? null;
      console.log('Order updated, server returned:', updated);

      if (updated) {
        setInitialOrder(updated);
        setOrder({
          total_amount_vat_excl: updated.total_amount ?? 0,
          total_amount_vat_incl: updated.total_amount_vat_incl ?? 0,
          customer_id: updated.customer_id ?? '',
          status: updated.status ?? 'pending',
          items:
            (updated.items ?? []).length > 0
              ? updated.items.map((item) => ({
                  product_id: item.product_id ?? '',
                  quantity: String(item.quantity ?? '1'),
                  unit_price:
                    item.unit_price != null
                      ? String(item.unit_price)
                      : '0.00',
                  tax_rate:
                    item.tax_rate != null
                      ? String(item.tax_rate)
                      : '0.00',
                }))
              : [
                  {
                    product_id: '',
                    quantity: '1',
                    unit_price: '0.00',
                    tax_rate: '0.00',
                  },
                ],
        });
      }

      toast.success('Order updated!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !order || !initialOrder) {
    return (
      <div className="flex justify-center items-start min-h-screen py-5">
        <ToastContainer />
        <div className="w-full max-w-4xl flex items-center justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  const orderDateDisplay = initialOrder.order_date
    ? new Date(initialOrder.order_date).toLocaleString('fi-FI')
    : '—';

  const createdAtDisplay = initialOrder.created_at
    ? new Date(initialOrder.created_at).toLocaleString('fi-FI')
    : '—';

  const updatedAtDisplay = initialOrder.updated_at
    ? new Date(initialOrder.updated_at).toLocaleString('fi-FI')
    : '—';

  return (
    <div className="flex justify-center items-start min-h-screen py-5">
      <ToastContainer />

      <div className="w-full px-10 flex items-center gap-4">
        <div className="flex w-full flex-col">
          {/* Title + buttons */}
          <div className="flex items-center gap-10">
            <h1 className="text-3xl font-bold">
              Edit order #{initialOrder.id}
            </h1>
            <div className="flex items-center gap-2">
              <span className="badge badge-neutral">
                {order.status ?? 'pending'}
              </span>
              {!canEdit && (
                <span className="text-xs text-gray-500">
                  Only orders in <b>pending</b> status can be edited.
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 ml-auto">
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
                disabled={!hasChanges || saving || !canEdit}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges || saving || !canEdit}
                className={`btn btn-primary ${
                  !hasChanges || !canEdit
                    ? 'btn-disabled opacity-50 cursor-not-allowed'
                    : ''
                }`}
                aria-disabled={!hasChanges || saving || !canEdit}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          {/* Customer */}
          <div className="w-2xl flex items-center gap-4 my-5">
            <label className="label w-32 flex items-center gap-2">
              <FaUser size={18} />
              <span className="label-text">Customer</span>
            </label>
            <div className="flex-1">
              <CustomerSelect
                customerOptions={customerOptions}
                selectedOption={selectedCustomer}
                handleCustomerChangeInSelect={handleCustomerChangeInSelect}
                isDisabled={!canEdit}
              />
            </div>
          </div>

          {/* Status */}
          <div className="w-2xl flex items-center gap-4">
            <label className="label w-32 flex items-center gap-2">
              <FaUser size={18} />
              <span className="label-text">Status</span>
            </label>
            <select
              className="select select-bordered w-full h-11 text-sm flex-1"
              value={order.status}
              onChange={(e) =>
                setOrder((s) => ({ ...s, status: e.target.value }))
              }
              disabled={!canEdit}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Order date (read-only) */}
          <div className="w-2xl flex items-center gap-4 mt-4">
            <label className="label w-32 flex items-center gap-2">
              <FaUser size={18} />
              <span className="label-text">Order date</span>
            </label>
            <div className="flex-1 h-11 flex items-center px-3">
              {orderDateDisplay}
            </div>
          </div>

          {/* Items header */}
          <div className="mt-10 mb-2">
            <span className="text-gray-500">Order lines</span>
            <hr className="mt-2 mb-1 border-gray-300" />
          </div>

          {/* Items table */}
          <div className="w-4/5 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="w-2/5">Product</th>
                  <th className="w-1/10 text-right">Qty</th>
                  <th className="w-1/5 text-right">Unit (excl. VAT) €</th>
                  <th className="w-1/10 text-right">VAT %</th>
                  <th className="w-1/10 text-right">VAT €</th>
                  <th className="w-1/5 text-right">Unit (incl. VAT) €</th>
                  <th className="w-1/5 text-right">Total (excl. VAT) €</th>
                  <th className="w-1/5 text-right">Total (incl. VAT) €</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => {
                  const qty = toNumber(item.quantity);
                  const priceExclVAT = toNumber(item.unit_price);
                  const taxRate = toNumber(item.tax_rate);
                  const priceInclVAT = priceExclVAT * (1 + taxRate / 100);
                  const lineTotal = qty * priceInclVAT;

                  const selectedProductOption =
                    productOptions.find(
                      (opt) => opt.value === item.product_id,
                    ) || null;

                  return (
                    <tr key={index} className="align-top">
                      {/* Product select */}
                      <td>
                        <ProductSelect
                          options={productOptions}
                          value={selectedProductOption}
                          onChange={(opt) =>
                            handleProductChangeInRow(index, opt)
                          }
                          onEdit={(opt) => {
                            router.push(`/inventory/${opt.value}`);
                          }}
                          placeholder="Search a product..."
                          isDisabled={!canEdit}
                        />
                      </td>

                      {/* Quantity */}
                      <td className="text-right">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          className="input input-md input-bordered w-full text-right"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, 'quantity', e.target.value)
                          }
                          disabled={!canEdit}
                        />
                      </td>

                      {/* Unit price (VAT excluded) */}
                      <td className="text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input input-md input-bordered w-full text-right"
                          value={item.unit_price}
                          onChange={(e) =>
                            updateItem(index, 'unit_price', e.target.value)
                          }
                          disabled={!canEdit}
                        />
                      </td>

                      {/* VAT rate – read-only from product/tax_rate */}
                      <td className="text-right">
                        {`${taxRate.toFixed(2)} %`}
                      </td>

                      {/* VAT amount – read-only */}
                      <td className="text-right">
                        {(priceExclVAT * (taxRate / 100)).toFixed(2)}
                      </td>
                      
                      {/* Unit price (VAT included) – read-only */}
                      <td className="text-right">
                        {priceInclVAT.toFixed(2)}
                      </td>
                      
                      {/* Total (excl. VAT) – read-only */}
                      <td className="text-right">
                        {(qty * priceExclVAT).toFixed(2)}
                      </td>
                      
                      {/* Line total */}
                      <td className="text-right align-middle">
                        {lineTotal.toFixed(2)}
                      </td>

                      {/* Remove line */}
                      <td className="text-center align-middle">
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => removeItem(index)}
                          disabled={order.items.length === 1 || !canEdit}
                        >
                          <FaMinus />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Add-row line */}
                <tr>
                  <td colSpan={7}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm mt-2"
                      onClick={addItem}
                      disabled={!canEdit}
                    >
                      <FaPlus className="mr-1" /> Add a product
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-10 mb-4">
            <span className="text-gray-500">Summary</span>
            <hr className="mt-2 mb-1 border-gray-300" />
          </div>

          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaTag size={18} />
            </span>
            {order.total_amount_vat_excl} € (excl. VAT)
          </div>

          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaTag size={18} />
            </span>
            {order.total_amount_vat_incl} € (incl. VAT)
          </div>

          {/* Meta info */}
          <div className="mt-4 text-sm text-gray-500">
            <p>Created: {createdAtDisplay}</p>
            <p>Updated: {updatedAtDisplay}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
