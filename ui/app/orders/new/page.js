'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import {
  FaUser,
  FaBox,
  FaTag,
  FaPercent,
  FaPlus,
  FaMinus,
} from "react-icons/fa6";
import CustomerSelect from '@/app/components/customerSelect';
import ProductSelect from '@/app/components/productSelect';
import { useRouter } from 'next/navigation';

export default function OrdersNewPage() {
  const router = useRouter();
  const [order, setOrder] = useState({
    customer_id: '',
    status: 'pending',
    items: [
      {
        product_id: '',
        quantity: '1',
        unit_price: '0.00', // VAT excluded
        tax_rate: '0.00',   // % as string, e.g. "24.00"
      },
    ],
  });


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
        const r = await fetch('/api/inventory'); // change if your endpoint is different
        if (!r.ok) throw new Error('Failed to load products');
        const data = await r.json();
        console.log('Loaded products:', data.inventory);
        setProducts(data.inventory || []);
      } catch (e) {
        console.error(e);
        toast.error(e.message || 'Failed to load products');
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
      unit_price: p.unit_price, // assumed VAT-excluded
      tax_rate: p.tax_rate,     // "123.00" etc.
    }));
  }, [products]);

  const handleProductChangeInRow = (rowIndex, option) => {
    setOrder((prev) => {
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

  // Is there any text in the form?
  const hasText = useMemo(() => {
    if (order.customer_id.trim()) return true;
    if (order.status && order.status !== 'pending') return true;
    return order.items.some(item =>
      Object.values(item).some(v => (v ?? '').toString().trim() !== '')
    );
  }, [order]);

  const totalAmount = useMemo(() => {
    return order.items.reduce((sum, item) => {
      const qty = toNumber(item.quantity);
      const priceExclVAT = toNumber(item.unit_price);
      const taxRate = toNumber(item.tax_rate);
      const priceInclVAT = priceExclVAT * (1 + taxRate / 100);

      return sum + qty * priceInclVAT;
    }, 0);
  }, [order.items]);

  const resetForm = () => {
    setOrder({
      customer_id: '',
      status: 'pending',
      items: [
        {
          product_id: '',
          quantity: '1',
          unit_price: '0.00',
        },
      ],
    });
    setSelectedCustomer(null);
  };

  const handleSave = async () => {
    const customerId = order.customer_id.trim();
    if (!customerId) {
      toast.error('Customer is required');
      return;
    }

    if (!order.items.length) {
      toast.error('At least one order item is required');
      return;
    }

    // Validate and convert items
    const itemsPayload = [];
    for (const item of order.items) {
      const productId = item.product_id.trim();
      const qtyStr = item.quantity.toString().trim();
      const priceStr = item.unit_price.toString().trim();

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
        unit_price: unitPrice,
      });
    }

    const total_amount = itemsPayload.reduce(
      (sum, it) => sum + it.quantity * it.unit_price,
      0
    );

    const payload = {
      customer_id: customerId,
      status: order.status || 'pending',
      total_amount,         // numeric(12,2)
      items: itemsPayload,  // for order_items
      // company_id can be added here if your API needs it
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
    } catch (err) {
      console.error(err);
      toast.error('Failed to create order');
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
          unit_price: '0.00',
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

  return (
    <div className="flex justify-center items-start min-h-screen py-5">
      <ToastContainer />

      <div className="w-full px-10 flex items-center gap-4">
        <div className="flex w-full flex-col">
          {/* Title + buttons */}
          <div className="flex items-center gap-10">
            <h1 className="text-3xl font-bold">Add new order</h1>
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
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
                  <th className="w-1/5 text-right">Unit (excl. VAT)</th>
                  <th className="w-1/10 text-right">VAT %</th>
                  <th className="w-1/5 text-right">Unit (incl. VAT)</th>
                  <th className="w-1/5 text-right">Amount</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => {
                  const qty = toNumber(item.quantity);
                  const priceExclVAT = toNumber(item.unit_price);
                  const taxRate = toNumber(item.tax_rate); // e.g. 24 => 24%
                  const priceInclVAT = priceExclVAT * (1 + taxRate / 100);
                  const lineTotal = qty * priceInclVAT;    // total incl. VAT (change if you want excl.)

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
                        />
                      </td>

                      {/* Quantity */}
                      <td className="text-right">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          className="input input-sm input-bordered w-full text-right"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        />
                      </td>

                      {/* Unit price (VAT excluded) – editable */}
                      <td className="text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input input-sm input-bordered w-full text-right"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                        />
                      </td>

                      {/* VAT rate – read-only */}
                      <td className="text-right">
                        <input
                          type="text"
                          className="input input-sm input-bordered w-full text-right"
                          value={`${taxRate.toFixed(2)} %`}
                          readOnly
                        />
                      </td>

                      {/* Unit price (VAT included) – read-only */}
                      <td className="text-right">
                        <input
                          type="text"
                          className="input input-sm input-bordered w-full text-right"
                          value={priceInclVAT.toFixed(2)}
                          readOnly
                        />
                      </td>

                      {/* Line total (qty * unit incl. VAT) */}
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
                  <td colSpan={7}>
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

          {/* Total amount (read-only) */}
          <div className="mt-10 mb-4">
            <span className="text-gray-500">Summary</span>
            <hr className="mt-2 mb-1 border-gray-300" />
          </div>
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaTag size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full"
              readOnly
              value={totalAmount.toFixed(2)}
              placeholder="Total amount"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
