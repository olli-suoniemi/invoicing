'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FaUser,
  FaTag,
  FaPlus,
  FaMinus,
} from "react-icons/fa6";
import CustomerSelect from '@/app/components/customerSelect';
import ProductSelect from '@/app/components/productSelect';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';
import { FaCalendarDay } from "react-icons/fa";
import LoadingSpinner from '@/app/components/loadingSpinner';
import { RiMoneyEuroBoxFill } from "react-icons/ri";

const INITIAL_ORDER = {
  customer_id: '',
  status: 'draft',
  order_date: '',
  extra_info: '',
  items: [
    {
      product_id: '',
      quantity: '1',
      unit_price_vat_excl: '0.00',
      tax_rate: '0.00',
    },
  ],
};

export default function OrdersNewPage() {
  const router = useRouter();
  const [order, setOrder] = useState(INITIAL_ORDER);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Customers loaded from backend
  const [customers, setCustomers] = useState([]);
  // Products loaded from backend
  const [products, setProducts] = useState([]);

  // The selected customer in the select
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // The selected product in the select
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Load customers
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/customers');
        
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.error || 'Upstream error');
        }

        const data = await r.json();
        setCustomers(data.customers || []);
      } catch (e) {
        console.error(e);
        toast.error(`Error loading customers: ${e.message || e}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load products
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/inventory');
        
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.error || 'Upstream error');
        }

        const data = await r.json();
        setProducts(data.inventory || []);
      } catch (e) {
        console.error(e);
        toast.error(`Error loading products: ${e.message || e}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Map customers to react-select options
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
      ean_code: p.ean_code,
      unit_price_vat_excl: p.unit_price_vat_excl,
      unit_price_vat_incl: p.unit_price_vat_incl,
      tax_rate: p.tax_rate,
    }));
  }, [products]);

  const handleProductChangeInRow = (rowIndex, option) => {
    setOrder((prev) => {
      const items = [...prev.items];
      const updated = { ...items[rowIndex] };

      if (option) {
        updated.product_id = option.value;
        updated.unit_price_vat_excl =
          option.unit_price_vat_excl != null ? String(option.unit_price_vat_excl) : '0.00';
        updated.tax_rate =
          option.tax_rate != null ? String(option.tax_rate) : '0.00';
      } else {
        updated.product_id = '';
        updated.unit_price_vat_excl = '0.00';
        updated.tax_rate = '0.00';
      }

      items[rowIndex] = updated;
      return { ...prev, items };
    });
  };

  // Keep select in sync if order.customer_id changes from outside
  useEffect(() => {
    if (!order.customer_id || customerOptions.length === 0) return;
    const found = customerOptions.find((opt) => opt.value === order.customer_id);
    if (found) {
      setSelectedCustomer(found);
    }
  }, [order.customer_id, customerOptions]);

  const handleCustomerChangeInSelect = (option) => {
    setSelectedCustomer(option);
    setOrder((s) => ({
      ...s,
      customer_id: option ? option.value : '',
    }));
  };

  const hasChanges = useMemo(() => {
    return JSON.stringify(order) !== JSON.stringify(INITIAL_ORDER);
  }, [order]);

  const totalAmount = useMemo(() => {
    return order.items.reduce((sum, item) => {
      const qty = toNumber(item.quantity);
      const priceExclVAT = toNumber(item.unit_price_vat_excl);
      const taxRate = toNumber(item.tax_rate);
      const priceInclVAT = priceExclVAT * (1 + taxRate / 100);

      return sum + qty * priceInclVAT;
    }, 0);
  }, [order.items]);

  const resetForm = () => {
    setOrder(INITIAL_ORDER);
    setSelectedCustomer(null);
  };

  const handleSave = async () => {
    const customerId = order.customer_id.trim();
    if (!customerId) {
      toast.error('Customer is required');
      return;
    }

    if (!order.order_date) {
      toast.error('Order date is required');
      return;
    }

    if (order.items[0].product_id.trim() === '' && order.items.length === 1) {
      toast.error('At least one order item is required');
      return;
    }

    // Validate and convert items
    const itemsPayload = [];
    for (const item of order.items) {
      const productId = item.product_id.trim();
      const qtyStr = item.quantity.toString().trim();
      const priceStr = item.unit_price_vat_excl.toString().trim();

      if (!productId) {
        toast.error('Each item must have a product ID');
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
        product_id: productId,
        quantity,
        unit_price_vat_excl: unitPrice,
        tax_rate: toNumber(item.tax_rate),
      });
    }

    const payload = {
      customer_id: customerId,
      status: order.status || 'draft',
      order_date: order.order_date,
      items: itemsPayload,  // for order_items
      extra_info: order.extra_info,
    };

    try {
      setSaving(true);
      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Upstream error');
      }

      resetForm();
      
      toast.success('New order created!');
      router.push('/orders');
    } catch (err) {
      console.error(err);
      toast.error(`Error creating order: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (index, field, value) => {
    setOrder((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setOrder((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: '',
          quantity: '1',
          unit_price_vat_excl: '0.00',
          tax_rate: '0.00',
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setOrder((prev) => {
      if (prev.items.length === 1) return prev; // keep at least 1
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items };
    });
  };

  const totals = useMemo(() => {
    let excl = 0;
    let incl = 0;

    for (const item of order.items) {
      const qty = toNumber(item.quantity);
      const priceExcl = toNumber(item.unit_price_vat_excl);
      const taxRate = toNumber(item.tax_rate);

      const priceIncl = priceExcl * (1 + taxRate / 100);
      excl += qty * priceExcl;
      incl += qty * priceIncl;
    }

    return {
      excl,
      incl,
      vat: incl - excl,
    };
  }, [order.items]);

if (loading) {
    return (
      <LoadingSpinner />
    );
  }

return (
    <div className="flex justify-center items-start min-h-screen py-5 px-5">
      <div className="w-full md:max-w-9/12">
        <div className="flex w-full flex-col gap-4">
          {/* Title + buttons */}
          {/* DESKTOP */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">
                  New order
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-neutral">{order.status ?? 'draft'}</span>
              </div>
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
                  className="btn btn-ghost btn-md"
                  onClick={resetForm}
                  disabled={!hasChanges || saving}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className={`btn btn-primary btn-md ${!hasChanges ? 'btn-disabled opacity-50' : ''}`}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE*/}
          <div className='md:hidden flex flex-col'>
            <div className="flex items-center justify-between mb-4">
              <button className="btn btn-ghost btn-md" onClick={() => router.back()}>
                &larr; Back
              </button>
              <div>
                <button
                  type="button"
                  className="btn btn-ghost btn-md"
                  onClick={resetForm}
                  disabled={!hasChanges || saving}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className={`btn btn-primary btn-md ${!hasChanges ? 'btn-disabled opacity-50' : ''}`}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold">
                  New order
              </h1>
              <div className="flex items-center gap-2">
                <span className="badge badge-neutral">{order.status ?? 'draft'}</span>
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="rounded-xl border md:border-none border-base-300 px-4">
            <div className="mt-4 md:w-7/12">
              <span className="text-gray-500">Order details</span>
              <hr className="mt-2 mb-4 border-gray-300" />
            </div>

            {/* MOBILE */}
            <div className="md:hidden space-y-4 pb-4">
              {/* Customer */}
              <div className="flex flex-col gap-2">
                <div className="label py-1 items-center">
                  <span className="label-text">Customer</span>
                  <span className="label-text-alt text-base-content/60 flex items-center">
                    <FaUser size={18} />
                  </span>
                </div>

                <CustomerSelect
                  customerOptions={customerOptions}
                  selectedOption={selectedCustomer}
                  handleCustomerChangeInSelect={handleCustomerChangeInSelect}
                  instanceId="order-new-customer"
                />
              </div>

              {/* Order date */}
              <div className="flex flex-col gap-2">
                <div className="label py-1 items-center">
                  <span className="label-text">Order date</span>
                  <span className="label-text-alt text-base-content/60 flex items-center">
                    <FaCalendarDay size={18} />
                  </span>
                </div>

                <DatePicker
                  selected={order.order_date ? new Date(order.order_date) : null}
                  onChange={(date) => {
                    const formatted = date ? format(date, 'yyyy-MM-dd') : '';
                    setOrder((s) => ({ ...s, order_date: formatted }));
                  }}
                  dateFormat="dd.MM.yyyy"
                  locale={fi}
                  wrapperClassName="w-full"
                  className="input input-bordered w-full h-12 text-sm"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <div className="label py-1 items-center">
                  <span className="label-text">Status</span>
                  <span className="label-text-alt text-base-content/60 flex items-center">
                    <FaTag size={18} />
                  </span>
                </div>

                <select
                  className="select select-bordered w-full h-12 text-sm"
                  value={order.status}
                  onChange={(e) => setOrder((s) => ({ ...s, status: e.target.value }))}
                >
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-gray-500">Total (excl. VAT)</div>
                  <div className="font-medium">{totals.excl.toFixed(2)} €</div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-gray-500">VAT</div>
                  <div className="font-medium">{totals.vat.toFixed(2)} €</div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-gray-500">Total (incl. VAT)</div>
                  <div className="font-semibold">{totals.incl.toFixed(2)} €</div>
                </div>
              </div>
            </div>

            {/* DESKTOP */}
            <div className="hidden md:grid grid-cols-[3fr_2fr] gap-x-10 gap-y-2 w-7/12">
              {/* Customer */}
              <div className="flex flex-col gap-2">
                <div className="label py-1 items-center">
                  <span className="label-text">Customer</span>
                  <span className="label-text-alt text-base-content/60 flex items-center">
                    <FaUser size={18} />
                  </span>
                </div>

                <CustomerSelect
                  customerOptions={customerOptions}
                  selectedOption={selectedCustomer}
                  handleCustomerChangeInSelect={handleCustomerChangeInSelect}
                  instanceId="order-new-customer"
                />
              </div>

              {/* Total excl */}
              <div className="flex flex-col gap-2">
                <div className="label py-1 items-center justify-end">
                  <span className="label-text">Total (excl. VAT)</span>
                  <span className="label-text-alt text-base-content/60">
                    <RiMoneyEuroBoxFill size={18} />
                  </span>
                </div>
                <div className="font-medium text-right">{totals.excl.toFixed(2)} €</div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <div className="label py-1 items-center">
                  <span className="label-text">Status</span>
                  <span className="label-text-alt text-base-content/60 flex items-center">
                    <FaTag size={18} />
                  </span>
                </div>

                <select
                  className="select select-bordered w-full h-11 text-sm"
                  value={order.status}
                  onChange={(e) => setOrder((s) => ({ ...s, status: e.target.value }))}
                >
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* VAT */}
              <div className="flex flex-col gap-2">
                <div className="label py-1 items-center justify-end">
                  <span className="label-text">VAT</span>
                  <span className="label-text-alt text-base-content/60">
                    <RiMoneyEuroBoxFill size={18} />
                  </span>
                </div>
                <div className="font-medium text-right">{totals.vat.toFixed(2)} €</div>
              </div>

              {/* Order date */}
              <div className="flex flex-col gap-2">
                <div className="label py-1 items-center">
                  <span className="label-text">Order date</span>
                  <span className="label-text-alt text-base-content/60 flex items-center">
                    <FaCalendarDay size={18} />
                  </span>
                </div>

                <DatePicker
                  selected={order.order_date ? new Date(order.order_date) : null}
                  onChange={(date) => {
                    const formatted = date ? format(date, 'yyyy-MM-dd') : '';
                    setOrder((s) => ({ ...s, order_date: formatted }));
                  }}
                  dateFormat="dd.MM.yyyy"
                  locale={fi}
                  wrapperClassName="w-full"
                  className="input input-bordered w-full h-11 text-sm"
                />
              </div>

              {/* Total incl */}
              <div className="flex flex-col gap-2">
                <div className="label py-1 items-center justify-end">
                  <span className="label-text">Total (incl. VAT)</span>
                  <span className="label-text-alt text-base-content/60">
                    <RiMoneyEuroBoxFill size={18} />
                  </span>
                </div>
                <div className="font-medium text-right">{totals.incl.toFixed(2)} €</div>
              </div>
            </div>
          </div>

          {/* ORDER ITEMS */}
          <div className="rounded-xl border md:border-none border-base-300 px-4">
            <div className="mt-4">
              <div className="text-gray-500">Order items</div>
              <div className="divider my-2 opacity-60" />
            </div>

            {/* MOBILE */}
            <div className="md:hidden space-y-3">
              {order.items.map((item, index) => {
                const qty = toNumber(item.quantity);
                const priceExclVAT = toNumber(item.unit_price_vat_excl);
                const taxRate = toNumber(item.tax_rate);
                const priceInclVAT = priceExclVAT * (1 + taxRate / 100);
                const lineTotalIncl = qty * priceInclVAT;
                const lineTotalExcl = qty * priceExclVAT;

                const selectedProductOption =
                  productOptions.find((opt) => opt.value === item.product_id) || null;

                return (
                  <div key={index} className="rounded-xl border md:border-none border-base-300 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold">
                        Line {index + 1}
                        <div className="text-xs opacity-70">
                          {selectedProductOption?.ean_code ? `EAN: ${selectedProductOption.ean_code}` : 'EAN: —'}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeItem(index)}
                        disabled={order.items.length === 1}
                        title="Remove line"
                      >
                        <FaMinus />
                      </button>
                    </div>

                    <div className="mt-3">
                      <div className="text-sm opacity-70 mb-1">Product</div>
                      <ProductSelect
                        options={productOptions}
                        value={selectedProductOption}
                        onChange={(opt) => handleProductChangeInRow(index, opt)}
                        onEdit={(opt) => router.push(`/inventory/${opt.value}`)}
                        placeholder="Search a product..."
                        instanceId={`order-edit-product-mobile-${index}`}
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <label className="form-control">
                        <div className="label py-1">
                          <span className="label-text text-sm">Qty</span>
                        </div>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          className="input input-bordered w-full h-12 text-right px-4"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        />
                      </label>

                      <label className="form-control">
                        <div className="label py-1">
                          <span className="label-text text-sm">Unit (excl. VAT) €</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input input-bordered w-full h-12 text-right px-4"
                          value={item.unit_price_vat_excl}
                          onChange={(e) => updateItem(index, 'unit_price_vat_excl', e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="opacity-70">VAT %</span>
                        <span className="whitespace-nowrap tabular-nums">{`${taxRate.toFixed(2)}%`}</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="opacity-70">Unit (incl.)</span>
                        <span className="whitespace-nowrap tabular-nums">{`${priceInclVAT.toFixed(2)} €`}</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="opacity-70">Total (excl.)</span>
                        <span className="whitespace-nowrap tabular-nums">{`${lineTotalExcl.toFixed(2)} €`}</span>
                      </div>

                      <div className="flex justify-between gap-3 font-semibold">
                        <span className="opacity-70">Total (incl.)</span>
                        <span className="whitespace-nowrap tabular-nums">{`${lineTotalIncl.toFixed(2)} €`}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button type="button" className="btn btn-outline btn-md w-full mb-2" onClick={addItem}>
                <FaPlus className="mr-2" /> Add a product
              </button>
            </div>

            {/* DESKTOP */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="table w-full table-fixed">
                <thead>
                  <tr>
                    <th className="whitespace-nowrap w-80">Product</th>
                    <th className="text-right whitespace-nowrap w-40">EAN</th>
                    <th className="text-right whitespace-nowrap w-30">Qty</th>
                    <th className="text-right whitespace-nowrap w-30">Unit (excl. VAT) €</th>
                    <th className="text-right whitespace-nowrap w-25">VAT %</th>
                    <th className="text-right whitespace-nowrap w-20">VAT €</th>
                    <th className="text-right whitespace-nowrap w-35">Unit (incl. VAT) €</th>
                    <th className="text-right whitespace-nowrap w-35">Total (excl. VAT) €</th>
                    <th className="text-right whitespace-nowrap w-35">Total (incl. VAT) €</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => {
                    const qty = toNumber(item.quantity);
                    const priceExclVAT = toNumber(item.unit_price_vat_excl);
                    const taxRate = toNumber(item.tax_rate);
                    const priceInclVAT = priceExclVAT * (1 + taxRate / 100);
                    const lineTotal = qty * priceInclVAT;

                    const selectedProductOption =
                      productOptions.find((opt) => opt.value === item.product_id) || null;

                    return (
                      <tr key={index} className="align-top">
                        <td>
                          <ProductSelect
                            options={productOptions}
                            value={selectedProductOption}
                            onChange={(opt) => handleProductChangeInRow(index, opt)}
                            onEdit={(opt) => router.push(`/inventory/${opt.value}`)}
                            placeholder="Search a product..."
                            instanceId={`order-edit-product-${index}`}
                          />
                        </td>

                        <td className="text-right">
                          {selectedProductOption ? selectedProductOption.ean_code || '—' : '—'}
                        </td>

                        <td className="text-right">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            className="input input-md input-bordered w-full text-right"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          />
                        </td>

                        <td className="text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input input-md input-bordered w-full text-right"
                            value={item.unit_price_vat_excl}
                            onChange={(e) => updateItem(index, 'unit_price_vat_excl', e.target.value)}
                          />
                        </td>

                        <td className="text-right">{`${taxRate.toFixed(2)} %`}</td>
                        <td className="text-right">{(priceExclVAT * (taxRate / 100)).toFixed(2)}</td>
                        <td className="text-right">{priceInclVAT.toFixed(2)}</td>
                        <td className="text-right">{(qty * priceExclVAT).toFixed(2)}</td>
                        <td className="text-right align-middle">{lineTotal.toFixed(2)}</td>

                        <td className="text-center align-middle">
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => removeItem(index)}
                            disabled={order.items.length === 1}
                          >
                            <FaMinus />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  <tr>
                    <td colSpan={7}>
                      <button type="button" className="btn btn-outline btn-sm mt-2" onClick={addItem}>
                        <FaPlus className="mr-1" /> Add a product
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* NOTES */}
          <div className="rounded-xl border md:border-none border-base-300 px-4">
            {/* Notes */}
            <div className="mt-4 md:w-7/12">
              <span className="text-gray-500">Notes</span>
              <hr className="mt-2 mb-4 border-gray-300" />
            </div>
            <div>
              <textarea
                className="textarea textarea-bordered w-full min-h-28 md:min-h-24 mb-4"
                value={order.extra_info}
                onChange={(e) => setOrder((s) => ({ ...s, extra_info: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
