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

export default function OrdersNewPage() {
  const [order, setOrder] = useState({
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
        setProducts(data.inventory || []);
      } catch (e) {
        console.error(e);
        toast.error(e.message || 'Failed to load products');
      }
    })();
  }, []);

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
      const qty = Number((item.quantity ?? '').toString().trim() || '0');
      const price = Number((item.unit_price ?? '').toString().trim() || '0');
      if (Number.isNaN(qty) || Number.isNaN(price)) return sum;
      return sum + qty * price;
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
        { product_id: '', quantity: '1', unit_price: '0.00' },
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

      <div className="w-full max-w-4xl flex items-center gap-4">
        <div className="flex w-full flex-col gap-4">
          {/* Title + buttons */}
          <div className="flex items-center justify-between">
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

          {/* Customer Select */}
          <div className="w-md">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <FaUser size={18} />
                Customer
              </span>
            </label>
            <CustomerSelect
              customerOptions={customerOptions}
              selectedOption={selectedCustomer}
              handleCustomerChangeInSelect={handleCustomerChangeInSelect}
            />
          </div>

          {/* Status */}
          <div className="w-md">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select
              className="select select-bordered w-full"
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
          <div className="mt-4">
            <span className="text-gray-500">Order items</span>
            <hr className="mt-2 mb-1 border-gray-300" />
          </div>

          {/* Items list */}
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 border border-base-300 rounded-lg p-3"
            >
              {/* Product ID */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaBox size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  placeholder="Product ID (UUID)"
                  value={item.product_id}
                  onChange={(e) =>
                    updateItem(index, 'product_id', e.target.value)
                  }
                />
              </div>

              {/* Quantity */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaPercent size={18} />
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="input input-bordered join-item w-full"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, 'quantity', e.target.value)
                  }
                />
              </div>

              {/* Unit price */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaTag size={18} />
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input input-bordered join-item w-full"
                  placeholder="Unit price"
                  value={item.unit_price}
                  onChange={(e) =>
                    updateItem(index, 'unit_price', e.target.value)
                  }
                />
              </div>

              {/* Remove item button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => removeItem(index)}
                  disabled={order.items.length === 1}
                >
                  <FaMinus className="mr-1" /> Remove item
                </button>
              </div>
            </div>
          ))}

          {/* Add item button */}
          <button
            type="button"
            className="btn btn-outline btn-sm self-start mt-2"
            onClick={addItem}
          >
            <FaPlus className="mr-1" /> Add item
          </button>

          {/* Total amount (read-only) */}
          <div className="mt-4">
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
