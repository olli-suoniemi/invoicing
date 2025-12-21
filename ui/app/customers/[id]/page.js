// app/customers/[id]/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { MdEmail } from 'react-icons/md';
import { FaMapMarkerAlt, FaInfo } from 'react-icons/fa';
import {
  FaHouse,
  FaPhone,
  FaUser,
  FaCity,
  FaMapLocationDot,
  FaMap,
} from 'react-icons/fa6';
import { TbHexagonNumber7Filled } from 'react-icons/tb';
import { BsSignpostFill } from 'react-icons/bs';

import LoadingSpinner from '@/app/components/loadingSpinner';

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [initial, setInitial] = useState(null); // original customer from server
  const [form, setForm] = useState(null);       // editable copy
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helper: build form state from customer object
  const buildFormFromCustomer = (cust) => {
    if (!cust) return null;

    const invoicing =
      cust.addresses?.find((a) => a.type === 'invoicing') ?? {};
    const delivery =
      cust.addresses?.find((a) => a.type === 'delivery') ?? {};

    return {
      // basic
      name: cust.name ?? '',
      email: cust.email ?? '',
      phone: cust.phone ?? '',
      type: cust.type ?? 'individual',

      // business fields
      business_id: cust.business_id ?? cust.businessId ?? '',
      vat_id: cust.vat_id ?? '',

      // invoicing address
      invoicing_address: invoicing.address ?? '',
      invoicing_city: invoicing.city ?? '',
      invoicing_postal_code: invoicing.postal_code ?? '',
      invoicing_state: invoicing.state ?? '',
      invoicing_country: invoicing.country ?? '',
      invoicing_address_id: invoicing.id ?? '',
      invoicing_extra_info: invoicing.extra_info ?? '',

      // delivery address
      delivery_address: delivery.address ?? '',
      delivery_city: delivery.city ?? '',
      delivery_postal_code: delivery.postal_code ?? '',
      delivery_state: delivery.state ?? '',
      delivery_country: delivery.country ?? '',
      delivery_address_id: delivery.id ?? '',
      delivery_extra_info: delivery.extra_info ?? '',

      // meta
      company_id: cust.company_id ?? '',
      internal_info: cust.internal_info ?? '',
    };
  };

  // Load customer
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/customers/${id}`);
        if (!res.ok) throw new Error('Failed to fetch customer');
        const data = await res.json();
        const cust = data.customer ?? null;

        setInitial(cust);
        if (cust) {
          setForm(buildFormFromCustomer(cust));
        }
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to load customer');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const isCompany = useMemo(() => {
    if (form?.type) return form.type === 'business';
    if (initial?.type) return initial.type === 'business';
    return false;
  }, [form, initial]);

  const displayName = form?.name ?? '';

  const hasChanges = useMemo(() => {
    if (!initial || !form) return false;

    const baseline = buildFormFromCustomer(initial);
    if (!baseline) return false;

    return (
      baseline.name !== form.name ||
      baseline.email !== form.email ||
      baseline.phone !== form.phone ||
      baseline.type !== form.type ||
      baseline.business_id !== form.business_id ||
      baseline.vat_id !== form.vat_id ||
      baseline.internal_info !== form.internal_info ||
      baseline.invoicing_address !== form.invoicing_address ||
      baseline.invoicing_city !== form.invoicing_city ||
      baseline.invoicing_postal_code !== form.invoicing_postal_code ||
      baseline.invoicing_state !== form.invoicing_state ||
      baseline.invoicing_country !== form.invoicing_country ||
      baseline.invoicing_extra_info !== form.invoicing_extra_info ||
      baseline.delivery_address !== form.delivery_address ||
      baseline.delivery_city !== form.delivery_city ||
      baseline.delivery_postal_code !== form.delivery_postal_code ||
      baseline.delivery_state !== form.delivery_state ||
      baseline.delivery_country !== form.delivery_country ||
      baseline.delivery_extra_info !== form.delivery_extra_info
    );
  }, [initial, form]);

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onReset = () => {
    if (!initial) return;
    setForm(buildFormFromCustomer(initial));
  };

  const onSave = async () => {
    if (!form || !initial) return;

    const isBlankAddress = (addr) =>
      !addr.address &&
      !addr.city &&
      !addr.postal_code &&
      !addr.state &&
      !addr.country;

    const invoicingAddress = {
      type: 'invoicing',
      address: form.invoicing_address || '',
      city: form.invoicing_city || '',
      postal_code: form.invoicing_postal_code || '',
      state: form.invoicing_state || '',
      country: form.invoicing_country || '',
      id: form.invoicing_address_id || '',
      extra_info: form.invoicing_extra_info || '',
    };

    const deliveryAddress = {
      type: 'delivery',
      address: form.delivery_address || '',
      city: form.delivery_city || '',
      postal_code: form.delivery_postal_code || '',
      state: form.delivery_state || '',
      country: form.delivery_country || '',
      id: form.delivery_address_id || '',
      extra_info: form.delivery_extra_info || '',
    };

    // Preserve any other address types
    const otherAddresses =
      initial.addresses?.filter(
        (a) => a.type !== 'invoicing' && a.type !== 'delivery'
      ) ?? [];

    const addresses = [
      ...otherAddresses,
      !isBlankAddress(invoicingAddress) ? invoicingAddress : null,
      !isBlankAddress(deliveryAddress) ? deliveryAddress : null,
    ].filter(Boolean);

    const payload = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      type: initial.type ?? form.type ?? 'individual',
      business_id: isCompany ? form.business_id || null : null,
      vat_id: isCompany ? form.vat_id || null : null,
      internal_info: form.internal_info || null,
      addresses,
      company_id: form.company_id || null,
    };

    try {
      setSaving(true);
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Save failed');
      }

      const data = await res.json();
      const updated = data.customer;

      setInitial(updated);
      setForm(buildFormFromCustomer(updated));

      toast.success('Customer saved');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
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
            <h1 className="text-2xl font-bold text-center">
              Customer not found
            </h1>
            <div />
          </div>

          <div className="rounded-xl border border-base-300 p-4">
            <p className="text-gray-500">
              We couldn&rsquo;t find a customer with id <code>{id}</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-5">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-base-100/90 backdrop-blur border-b border-base-200">
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
                    className={`btn btn-primary btn-md ${!hasChanges ? 'btn-disabled opacity-50' : ''}`}
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
                  className={`btn btn-primary ${!hasChanges ? 'btn-disabled opacity-50' : ''}`}
                  onClick={onSave}
                  disabled={!hasChanges || saving}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Card */}
        <div className="rounded-xl border border-base-300 p-4 sm:p-6">
          {/* Title + badge */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {displayName || 'Customer details'}
            </h2>
            <span className="badge badge-neutral mt-1 w-fit">
              {isCompany ? 'Company' : 'Person'}
            </span>
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name / Company name */}
            <label className="form-control md:col-span-2">
              <div className="label py-1">
                <span className="label-text">
                  {isCompany ? 'Company name' : 'Full name'}
                </span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  {isCompany ? <FaHouse size={18} /> : <FaUser size={18} />}
                </span>
              </div>
              <input
                className="input input-bordered w-full h-12 md:h-10"
                value={form.name}
                onChange={onChange('name')}
                placeholder={isCompany ? 'Company name' : 'Full name'}
              />
            </label>

            {/* Business ID (only for company) */}
            {isCompany && (
              <>
                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text">Business ID</span>
                    <span className="label-text-alt text-base-content/60 flex items-center">
                      <TbHexagonNumber7Filled size={18} />
                    </span>
                  </div>
                  <input
                    className="input input-bordered w-full h-12 md:h-10"
                    value={form.business_id}
                    onChange={onChange('business_id')}
                    placeholder="Business ID"
                  />
                </label>

                {/* VAT ID */}
                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text">VAT ID</span>
                    <span className="label-text-alt text-base-content/60 flex items-center">
                      <TbHexagonNumber7Filled size={18} />
                    </span>
                  </div>
                  <input
                    className="input input-bordered w-full h-12 md:h-10"
                    value={form.vat_id}
                    onChange={onChange('vat_id')}
                    placeholder="VAT ID"
                  />
                </label>
              </>
            )}

            {/* Email */}
            <label className="form-control">
              <div className="label py-1">
                <span className="label-text">Email</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <MdEmail size={18} />
                </span>
              </div>
              <input
                className="input input-bordered w-full h-12 md:h-10"
                type="email"
                value={form.email}
                onChange={onChange('email')}
                placeholder="Email"
              />
            </label>

            {/* Phone */}
            <label className="form-control">
              <div className="label py-1">
                <span className="label-text">Phone</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <FaPhone size={18} />
                </span>
              </div>
              <input
                className="input input-bordered w-full h-12 md:h-10"
                type="tel"
                value={form.phone}
                onChange={onChange('phone')}
                placeholder="Phone"
              />
            </label>

            {/* Internal info*/}
            <label className="form-control md:col-span-2">
              <div className="label py-1">
                <span className="label-text">Internal info</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <FaInfo size={18} />
                </span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full min-h-28 md:min-h-24"
                value={form.internal_info}
                onChange={onChange('internal_info')}
                placeholder="Internal info"
              />
            </label>


            {/* Invoice address header */}
            <div className="md:col-span-2 mt-2">
              <details className="collapse collapse-arrow bg-base-200/40 md:bg-transparent rounded-xl">
                <summary className="collapse-title text-base font-semibold">
                  Invoice address
                </summary>
                <div className="collapse-content">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Invoice address fields */}
                <label className="form-control md:col-span-2">
                  <div className="label py-1">
                    <span className="label-text">Street address</span>
                    <span className="label-text-alt text-base-content/60 flex items-center">
                      <FaMapMarkerAlt size={18} />
                    </span>
                  </div>
                  <input
                    className="input input-bordered w-full h-12 md:h-10"
                    value={form.invoicing_address}
                    onChange={onChange('invoicing_address')}
                    placeholder="Street address"
                  />
                </label>

                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text">City</span>
                    <span className="label-text-alt text-base-content/60 flex items-center">
                      <FaCity size={18} />
                    </span>
                  </div>
                  <input
                    className="input input-bordered w-full h-12 md:h-10"
                    value={form.invoicing_city}
                    onChange={onChange('invoicing_city')}
                    placeholder="City"
                  />
                </label>

                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text">Postal code</span>
                    <span className="label-text-alt text-base-content/60 flex items-center">
                      <BsSignpostFill size={18} />
                    </span>
                  </div>
                  <input
                    className="input input-bordered w-full h-12 md:h-10"
                    value={form.invoicing_postal_code}
                    onChange={onChange('invoicing_postal_code')}
                    placeholder="Postal code"
                  />
                </label>

                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text">State</span>
                    <span className="label-text-alt text-base-content/60 flex items-center">
                      <FaMapLocationDot size={18} />
                    </span>
                  </div>
                  <input
                    className="input input-bordered w-full h-12 md:h-10"
                    value={form.invoicing_state}
                    onChange={onChange('invoicing_state')}
                    placeholder="State"
                  />
                </label>

                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text">Country</span>
                    <span className="label-text-alt text-base-content/60 flex items-center">
                      <FaMap size={18} />
                    </span>
                  </div>
                  <input
                    className="input input-bordered w-full h-12 md:h-10"
                    value={form.invoicing_country}
                    onChange={onChange('invoicing_country')}
                    placeholder="Country"
                  />
                </label>


                {/* External invoicing info*/}
                <label className="form-control md:col-span-2">
                  <div className="label py-1">
                    <span className="label-text">External invoicing info</span>
                    <span className="label-text-alt text-base-content/60 flex items-center">
                      <FaInfo size={18} />
                    </span>
                  </div>
                  <textarea
                    className="textarea textarea-bordered w-full min-h-28 md:min-h-24"
                    value={form.invoicing_extra_info}
                    onChange={onChange('invoicing_extra_info')}
                    placeholder="External invoicing info"
                  />
                </label>
                  </div>
                </div>
              </details>
            </div>

            {/* Delivery address header */}
            <div className="md:col-span-2 mt-2">
              <details className="collapse collapse-arrow bg-base-200/40 md:bg-transparent rounded-xl">
                <summary className="collapse-title text-base font-semibold">
                  Delivery address
                </summary>
                <div className="collapse-content">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Delivery address fields */}
                    <label className="form-control md:col-span-2">
                      <div className="label py-1">
                        <span className="label-text">Street address</span>
                        <span className="label-text-alt text-base-content/60 flex items-center">
                          <FaMapMarkerAlt size={18} />
                        </span>
                      </div>
                      <input
                        className="input input-bordered w-full h-12 md:h-10"
                        value={form.delivery_address}
                        onChange={onChange('delivery_address')}
                        placeholder="Street address"
                      />
                    </label>

                    <label className="form-control">
                      <div className="label py-1">
                        <span className="label-text">City</span>
                        <span className="label-text-alt text-base-content/60 flex items-center">
                          <FaCity size={18} />
                        </span>
                      </div>
                      <input
                        className="input input-bordered w-full h-12 md:h-10"
                        value={form.delivery_city}
                        onChange={onChange('delivery_city')}
                        placeholder="City"
                      />
                    </label>

                    <label className="form-control">
                      <div className="label py-1">
                        <span className="label-text">Postal code</span>
                        <span className="label-text-alt text-base-content/60 flex items-center">
                          <BsSignpostFill size={18} />
                        </span>
                      </div>
                      <input
                        className="input input-bordered w-full h-12 md:h-10"
                        value={form.delivery_postal_code}
                        onChange={onChange('delivery_postal_code')}
                        placeholder="Postal code"
                      />
                    </label>

                    <label className="form-control">
                      <div className="label py-1">
                        <span className="label-text">State</span>
                        <span className="label-text-alt text-base-content/60 flex items-center">
                          <FaMapLocationDot size={18} />
                        </span>
                      </div>
                      <input
                        className="input input-bordered w-full h-12 md:h-10"
                        value={form.delivery_state}
                        onChange={onChange('delivery_state')}
                        placeholder="State"
                      />
                    </label>

                    <label className="form-control">
                      <div className="label py-1">
                        <span className="label-text">Country</span>
                        <span className="label-text-alt text-base-content/60 flex items-center">
                          <FaMap size={18} />
                        </span>
                      </div>
                      <input
                        className="input input-bordered w-full h-12 md:h-10"
                        value={form.delivery_country}
                        onChange={onChange('delivery_country')}
                        placeholder="Country"
                      />
                    </label>

                    
                    {/* External delivery info*/}
                    <label className="form-control md:col-span-2">
                      <div className="label py-1">
                        <span className="label-text">External delivery info</span>
                        <span className="label-text-alt text-base-content/60 flex items-center">
                          <FaInfo size={18} />
                        </span>
                      </div>
                      <textarea
                        className="textarea textarea-bordered w-full min-h-28 md:min-h-24"
                        value={form.delivery_extra_info}
                        onChange={onChange('delivery_extra_info')}
                        placeholder="External delivery info"
                      />
                    </label>
                  </div>
                </div>
              </details>
            </div>
          </div>

          <div className="mt-6">
            <div className="divider my-2 text-md opacity-60">Meta</div>
            <div className="text-sm sm:text-md opacity-70 space-y-1">
              <div><b>Customer ID:</b> {initial.id}</div>
              <div><b>Company ID:</b> {initial.company_id}</div>
              <div><b>Created:</b> {initial.created_at ? new Date(initial.created_at).toLocaleString('fi-FI') : '—'}</div>
              <div><b>Updated:</b> {initial.updated_at ? new Date(initial.updated_at).toLocaleString('fi-FI') : '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
