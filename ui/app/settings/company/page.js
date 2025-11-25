'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useParams, useRouter } from 'next/navigation';
import { MdEmail } from "react-icons/md";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaHouse, FaPhone, FaCity, FaMapLocationDot, FaMap } from "react-icons/fa6";
import { TbHexagonNumber7Filled } from "react-icons/tb";
import { BsSignpostFill } from "react-icons/bs";
import { CgWebsite } from "react-icons/cg";
import LoadingSpinner from '@/app/components/loadingSpinner';
import UserSelect from '@/app/components/userSelect';


export default function CompanyPage() {
  const { id } = useParams();                // dynamic route param
  const router = useRouter();

  const [initial, setInitial] = useState(null); // original company from server
  const [form, setForm] = useState(null);       // editable copy
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Users from database for UserSelect
  const [users, setUsers] = useState([]);

  // State for adding user
  const [isAddingUser, setIsAddingUser] = useState(false);

  // The selected user from UserSelect
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/settings/company`);
        if (!r.ok) throw new Error('Failed to load company');
        const data = await r.json();
        setInitial(data.company);
        setForm({
          id: data.company.id ?? '',
          invoicingAddressId: data.company.invoicingAddress?.id ?? '',
          deliveryAddressId: data.company.deliveryAddress?.id ?? '',
          companyName: data.company.name ?? '',
          businessId: data.company.business_id ?? '',
          email: data.company.email ?? '',
          phone: data.company.phone ?? '',
          website: data.company.website ?? '',
          invoiceStreet: data.company.invoicingAddress?.address ?? '',
          invoiceCity: data.company.invoicingAddress?.city ?? '',
          invoicePostalCode: data.company.invoicingAddress?.postal_code ?? '',
          invoiceState: data.company.invoicingAddress?.state ?? '',
          invoiceCountry: data.company.invoicingAddress?.country ?? '',
          deliveryStreet: data.company.deliveryAddress?.address ?? '',
          deliveryCity: data.company.deliveryAddress?.city ?? '',
          deliveryPostalCode: data.company.deliveryAddress?.postal_code ?? '',
          deliveryState: data.company.deliveryAddress?.state ?? '',
          deliveryCountry: data.company.deliveryAddress?.country ?? '',
        });
      } catch (e) {
        toast.error(e.message || 'Load failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);
  
  // Load users for UserSelect
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/settings/users`);
        if (!r.ok) throw new Error('Failed to load users');
        const data = await r.json();
        setUsers(data.users);
      } catch (e) {
        toast.error(e.message || 'Load failed');
      }
    })();
  }, []);

  const hasChanges = useMemo(() => {
    if (!initial || !form) return false;
    return (
      (initial.id ?? '') !== form.id ||
      (initial.invoicingAddress?.id ?? '') !== form.invoicingAddressId ||
      (initial.deliveryAddress?.id ?? '') !== form.deliveryAddressId ||
      (initial.companyName ?? '') !== form.companyName ||
      (initial.businessId ?? '') !== form.businessId ||
      (initial.email ?? '') !== form.email ||
      (initial.phone ?? '') !== form.phone ||
      (initial.website ?? '') !== form.website ||
      (initial.invoiceStreet ?? '') !== form.invoiceStreet ||
      (initial.invoiceCity ?? '') !== form.invoiceCity ||
      (initial.invoicePostalCode ?? '') !== form.invoicePostalCode ||
      (initial.invoiceState ?? '') !== form.invoiceState ||
      (initial.invoiceCountry ?? '') !== form.invoiceCountry ||
      (initial.deliveryStreet ?? '') !== form.deliveryStreet ||
      (initial.deliveryCity ?? '') !== form.deliveryCity ||
      (initial.deliveryPostalCode ?? '') !== form.deliveryPostalCode ||
      (initial.deliveryState ?? '') !== form.deliveryState ||
      (initial.deliveryCountry ?? '') !== form.deliveryCountry
    );
  }, [initial, form]);

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const onReset = () => {
    if (!initial) return;
    setForm({
      id: initial.id ?? '',
      invoicingAddressId: initial.invoicingAddress?.id ?? '',
      deliveryAddressId: initial.deliveryAddress?.id ?? '',
      companyName: initial.name ?? '',
      businessId: initial.business_id ?? '',
      email: initial.email ?? '',
      phone: initial.phone ?? '',
      website: initial.website ?? '',
      invoiceStreet: initial.invoicingAddress?.address ?? '',
      invoiceCity: initial.invoicingAddress?.city ?? '',
      invoicePostalCode: initial.invoicingAddress?.postal_code ?? '',
      invoiceState: initial.invoicingAddress?.state ?? '',
      invoiceCountry: initial.invoicingAddress?.country ?? '',
      deliveryStreet: initial.deliveryAddress?.address ?? '',
      deliveryCity: initial.deliveryAddress?.city ?? '',
      deliveryPostalCode: initial.deliveryAddress?.postal_code ?? '',
      deliveryState: initial.deliveryAddress?.state ?? '',
      deliveryCountry: initial.deliveryAddress?.country ?? ''
    });
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const r = await fetch(`/api/settings/company`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'Save failed');
      }

      const data = await r.json();

      setInitial(data.company);
      // keep form in sync with what backend returned
      setForm({
        id: data.company.id ?? '',
        invoicingAddressId: data.company.invoicingAddress?.id ?? '',
        deliveryAddressId: data.company.deliveryAddress?.id ?? '',
        companyName: data.company.name ?? '',
        businessId: data.company.business_id ?? '',
        email: data.company.email ?? '',
        phone: data.company.phone ?? '',
        website: data.company.website ?? '',
        invoiceStreet: data.company.invoicingAddress?.address ?? '',
        invoiceCity: data.company.invoicingAddress?.city ?? '',
        invoicePostalCode: data.company.invoicingAddress?.postal_code ?? '',
        invoiceState: data.company.invoicingAddress?.state ?? '',
        invoiceCountry: data.company.invoicingAddress?.country ?? '',
        deliveryStreet: data.company.deliveryAddress?.address ?? '',
        deliveryCity: data.company.deliveryAddress?.city ?? '',
        deliveryPostalCode: data.company.deliveryAddress?.postal_code ?? '',
        deliveryState: data.company.deliveryAddress?.state ?? '',
        deliveryCountry: data.company.deliveryAddress?.country ?? '',
      });
      toast.success('Company saved');
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUser) {
      toast.error('Please select a user to add.');
      return;
    }

    try {
      const r = await fetch(`/api/settings/company/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.value }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to add user');
      }

      const data = await r.json();

      setInitial((prev) => ({
        ...prev,
        users: [...prev.users, data.user],
      }));

      setIsAddingUser(false);
      setSelectedUser(null);
      toast.success('User added to company');
    } catch (e) {
      toast.error(e.message || 'Failed to add user');
    }
  };

  const handleUserChangeInSelect = (selected) => {
    setSelectedUser(selected);
  };

  // 1) Compute ids of users already in the company
  const existingUserIds = useMemo(() => {
    const users = (initial?.users ?? []).filter(Boolean); // remove undefined/null
    return new Set(users.map(u => u.id));
  }, [initial?.users]);

  // 2) Options for the select = all users NOT already in company
  const selectableUserOptions = useMemo(() => {
    return users
      .filter(u => !existingUserIds.has(u.id))
      .map(u => ({
        value: u.id,
        label: `${u.first_name ?? ''} ${u.last_name ?? ''} (${u.email ?? ''})`.trim(),
      }));
  }, [users, existingUserIds]);

  // 3) If the currently selected user is no longer selectable, clear it
  useEffect(() => {
    if (selectedUser && existingUserIds.has(selectedUser.value)) {
      setSelectedUser(null);
    }
  }, [existingUserIds, selectedUser]);

  const handleRemoveUser = async (userId) => {
    try {
      const r = await fetch(`/api/settings/company/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to remove user');
      }

      // Remove the user from the initial state to update the UI
      setInitial((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== userId),
      }));

      toast.success('User removed from company');
    } catch (e) {
      toast.error(e.message || 'Failed to remove user');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!initial) return <div className="p-6">Company not found</div>;

  return (
    <div className="min-h-screen py-5">
      <div className="w-full max-w-3xl mx-auto px-6">
        {/* Header: back | title | actions */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 mb-6">
          <button className="btn btn-ghost" onClick={() => router.back()}>&larr; Back</button>
          <h1 className="text-2xl font-bold text-center">Edit Company</h1>
          <div className="flex gap-2 justify-self-end">
            <button className="btn btn-ghost" onClick={onReset} disabled={!hasChanges || saving}>
              Reset
            </button>
            <button className={`btn btn-primary ${!hasChanges ? 'btn-disabled opacity-50' : ''}`}
                    onClick={onSave} disabled={!hasChanges || saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-base-300 p-4">
          <div>
            <span className="text-gray-500">Company details</span>
            <hr className="mt-2 mb-4 border-gray-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">Company Name</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaHouse size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.companyName}
                onChange={onChange('companyName')}
                placeholder="Company name"
              />
            </label>
            
            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">Business ID</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <TbHexagonNumber7Filled size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.businessId}
                onChange={onChange('businessId')}
                placeholder="Business ID"
              />
            </label>

            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">Email</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <MdEmail size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.email}
                onChange={onChange('email')}
                placeholder="Email"
              />
            </label>

            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">Phone</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaPhone size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.phone}
                onChange={onChange('phone')}
                placeholder="Phone"
              />
            </label>

            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">Website</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <CgWebsite size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.website}
                onChange={onChange('website')}
                placeholder="Website"
              />
            </label>
          </div>

          {/* Invoice address divider */}
          <div className="mt-8">
            <span className="text-gray-500">Invoice address</span>
            <hr className="mt-2 mb-4 border-gray-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">Street</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMapMarkerAlt size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.invoiceStreet}
                onChange={onChange('invoiceStreet')}
                placeholder="Street"
              />
            </label>

            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">City</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaCity size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.invoiceCity}
                onChange={onChange('invoiceCity')}
                placeholder="City"
              />
            </label>

            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">Postal Code</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <BsSignpostFill size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.invoicePostalCode}
                onChange={onChange('invoicePostalCode')}
                placeholder="Postal Code"
              />
            </label>

            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">State</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMapLocationDot size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.invoiceState}
                onChange={onChange('invoiceState')}
                placeholder="State"
              />
            </label>

            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">Country</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMap size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.invoiceCountry}
                onChange={onChange('invoiceCountry')}
                placeholder="Country"
              />
            </label>
          </div>

          {/* Delivery address divider */}
          <div className="mt-8">
            <span className="text-gray-500">Delivery address</span>
            <hr className="mt-2 mb-4 border-gray-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">Street</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMapMarkerAlt size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.deliveryStreet}
                onChange={onChange('deliveryStreet')}
                placeholder="Street"
              />
            </label>

            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">City</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaCity size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.deliveryCity}
                onChange={onChange('deliveryCity')}
                placeholder="City"
              />
            </label>

            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">Postal Code</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <BsSignpostFill size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.deliveryPostalCode}
                onChange={onChange('deliveryPostalCode')}
                placeholder="Postal Code"
              />
            </label>

            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">State</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMapLocationDot size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.deliveryState}
                onChange={onChange('deliveryState')}
                placeholder="State"
              />
            </label>

            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">Country</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMap size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.deliveryCountry}
                onChange={onChange('deliveryCountry')}
                placeholder="Country"
              />
            </label>
          </div>

          {/* Users divider */}
          <div className="mt-8">
            <span className="text-gray-500">Users</span>
            <hr className="mt-2 mb-4 border-gray-300" />
          </div>

          <div className="mt-4 flex flex-col">
            {Array.isArray(initial.users) && initial.users.length > 0 ? (
              <ul className="list-disc list-inside mb-4">
                {initial.users.map((user) => (
                  <li key={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                    <button
                      className="btn btn-xs btn-error ml-4"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : !isAddingUser ? (
              <p>No users found for this company.</p>
            ) : null}

            {isAddingUser && (
              <>
                <UserSelect
                  userOptions={selectableUserOptions}
                  handleUserChangeInSelect={handleUserChangeInSelect}
                  selectedOption={selectedUser}
                />

                <div className="flex mt-4 justify-center gap-4">
                  <button
                    className="btn btn-sm btn-secondary mt-2 self-center"
                    onClick={() => {
                      setSelectedUser(null);   // clear the select
                      setIsAddingUser(false);  // close the add UI
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-sm btn-primary mt-2 self-center"
                    onClick={handleAddUser}
                  >
                    Add user
                  </button>
                </div>
              </>
            )}

            {!isAddingUser && (
              <button
                className="btn btn-sm btn-primary w-40 self-center mt-5"
                onClick={() => setIsAddingUser(true)}
              >
                Add users
              </button>
            )}
          </div>

          {/* Metadata */}
          <div className="mt-8">
            <span className="text-gray-500">Metadata</span>
            <hr className="mt-2 mb-4 border-gray-300" />
          </div>

          <div className="mt-2 text-sm opacity-70">
            <div><b>Company ID:</b> {initial.id}</div>
            <div><b>Created at:</b>{' '}
              {new Date(initial.created_at).toLocaleString('fi-FI')}
            </div>
            <div><b>Updated at:</b>{' '}
              {initial.updated_at
                ? new Date(initial.updated_at).toLocaleString('fi-FI')
                : '—'}
            </div>
          </div>

          <ToastContainer />
        </div>
      </div>
    </div>
  );
}
