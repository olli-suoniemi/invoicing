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
        const r = await fetch('/api/customers'); // change if your endpoint is different
        
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.error || 'Upstream error');
        }

        const data = await r.json();
        setCustomers(data.customers || []);
      } catch (e) {
        console.error(e);
        toast.error(`Error loading customers: ${e.message || e}`);
      }
    })();
  }, []);

  // Load products
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/inventory'); // change if your endpoint is different
        
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.error || 'Upstream error');
        }

        const data = await r.json();
        setProducts(data.inventory || []);
      } catch (e) {
        console.error(e);
        toast.error(`Error loading products: ${e.message || e}`);
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

  
  return (
    <div className="flex justify-center items-start min-h-screen py-5">

      <div className="w-full px-10 flex items-center gap-4">
        <div className="flex w-full flex-col">
          {/* Title + buttons */}
          <div className="flex items-center gap-10">
            <h1 className="text-3xl font-bold">
              Add new order
            </h1>
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
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges}
                className={`btn btn-primary ${
                  !hasChanges ? 'btn-disabled opacity-50 cursor-not-allowed' : ''
                }`}
                aria-disabled={!hasChanges}
              >
                Save
              </button>
            </div>
          </div>

          {/* Order Details */}
          <div className="mt-10 mb-2 w-7/12">
            <span className="text-gray-500">Order details</span>
            <hr className="mt-2 mb-4 border-gray-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-10 gap-y-5 w-7/12">
            {/* ROW 1 LEFT: Customer */}
            <div className="flex items-center gap-4 h-full">
              <label className="w-32 flex items-center gap-2 text-sm text-gray-500">
                <FaUser size={18} />
                Customer
              </label>
              <div className="flex-1">
                <CustomerSelect
                  customerOptions={customerOptions}
                  selectedOption={selectedCustomer}
                  handleCustomerChangeInSelect={handleCustomerChangeInSelect}
                  instanceId="order-new-customer"
                />
              </div>
            </div>

            {/* ROW 1 RIGHT: Total excl. VAT */}
            <div className="flex items-center gap-4 h-full">
              <label className="w-40 flex items-center text-sm text-gray-500">
                Total (excl. VAT)
              </label>
              <div className="flex-1 text-right font-medium">
                {totals.excl.toFixed(2)} €
              </div>
            </div>

            {/* ROW 2: Status / VAT */}
            <div className="flex items-center gap-4 h-full">
              <label className="w-32 flex items-center gap-2 text-sm text-gray-500">
                <FaTag size={18} />
                <span className="label-text">Status</span>
              </label>
              <div className="flex-1">
                <select
                  className="select select-bordered w-full h-11 text-md max-w-none"
                  value={order.status}
                  onChange={(e) =>
                    setOrder((s) => ({ ...s, status: e.target.value }))
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 h-full">
              <label className="w-40 flex items-center text-sm text-gray-500">
                VAT
              </label>
              <div className="flex-1 text-right font-medium">
                {totals.vat.toFixed(2)} €
              </div>
            </div>

            {/* ROW 3: Order date / Total incl. VAT */}
            <div className="flex items-center gap-4 h-full">
              <label className="w-32 flex items-center gap-2 text-sm text-gray-500">
                <FaCalendarDay size={18} />
                <span className="label-text">Order date</span>
              </label>
              <DatePicker
                selected={order.order_date ? new Date(order.order_date) : null}
                onChange={(date) => {
                  const formatted = date ? format(date, 'yyyy-MM-dd') : '';
                  setOrder((s) => ({ ...s, order_date: formatted }));
                }}
                dateFormat="dd.MM.yyyy"
                locale={fi}
                wrapperClassName="flex-1"
                className="input input-bordered w-full h-11 text-sm"
              />
            </div>

            <div className="flex items-center gap-4 h-full">
              <label className="w-40 flex items-center text-sm text-gray-500">
                Total (incl. VAT)
              </label>
              <div className="flex-1 text-right font-semibold">
                {totals.incl.toFixed(2)} €
              </div>
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
                  <th className="w-1/10 text-right">EAN</th>
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
                  const priceExclVAT = toNumber(item.unit_price_vat_excl);
                  const taxRate = toNumber(item.tax_rate);
                  const priceInclVAT = priceExclVAT * (1 + taxRate / 100);
                  const vatAmount = priceExclVAT * (taxRate / 100);
                  const totalExcl = qty * priceExclVAT;
                  const lineTotal = qty * priceInclVAT;

                  const selectedProductOption =
                    productOptions.find((opt) => opt.value === item.product_id) || null;

                  return (
                    <tr key={index} className="align-top">
                      {/* Product select */}
                      <td>
                        <ProductSelect
                          options={productOptions}
                          value={selectedProductOption}
                          onChange={(opt) => handleProductChangeInRow(index, opt)}
                          onEdit={(opt) => {
                            router.push(`/inventory/${opt.value}`);
                          }}
                          placeholder="Search a product..."
                          instanceId={`order-new-product-${index}`}
                        />
                      </td>

                      {/* EAN */}
                      <td className="text-right">
                        {selectedProductOption
                          ? selectedProductOption.ean_code || '—'
                          : '—'}
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
                        />
                      </td>

                      {/* Unit price (VAT excluded) – editable */}
                      <td className="text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input input-md input-bordered w-full text-right"
                          value={item.unit_price_vat_excl}
                          onChange={(e) =>
                            updateItem(index, 'unit_price_vat_excl', e.target.value)
                          }
                        />
                      </td>

                      {/* VAT rate – read-only text */}
                      <td className="text-right">
                        {`${taxRate.toFixed(2)} %`}
                      </td>

                      {/* VAT amount – read-only */}
                      <td className="text-right">
                        {vatAmount.toFixed(2)}
                      </td>

                      {/* Unit price (VAT included) – read-only */}
                      <td className="text-right">
                        {priceInclVAT.toFixed(2)}
                      </td>

                      {/* Total (excl. VAT) – read-only */}
                      <td className="text-right">
                        {totalExcl.toFixed(2)}
                      </td>

                      {/* Total (incl. VAT) – read-only */}
                      <td className="text-right align-middle">
                        {lineTotal.toFixed(2)}
                      </td>

                      {/* Remove */}
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

                {/* Add-row line like Odoo */}
                <tr>
                  <td colSpan={10}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm mt-2"
                      onClick={addItem}
                    >
                      <FaPlus className="mr-1" /> Add a product
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>


          {/* Text area for extra info */}
          <div className="mt-10 mb-4">
            <span className="text-gray-500">Notes</span>
            <hr className="mt-2 mb-1 border-gray-300" />
          </div>
          <textarea
            className="textarea textarea-bordered w-2xl h-24"
            value={order.extra_info}
            onChange={(e) =>
              setOrder((s) => ({ ...s, extra_info: e.target.value }))
            }
          ></textarea>
        </div>
      </div>
    </div>
  );
}
