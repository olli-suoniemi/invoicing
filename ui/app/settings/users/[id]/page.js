'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useParams, useRouter } from 'next/navigation';
import { FaUser, FaShield } from "react-icons/fa6";
import LoadingSpinner from '@/app/components/loadingSpinner';

export default function UserPage() {
  const { id } = useParams();                // dynamic route param
  const router = useRouter();

  const [initial, setInitial] = useState(null); // original user from server
  const [form, setForm] = useState(null);       // editable copy
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/settings/users/${id}`);
        if (!r.ok) throw new Error('Failed to load user');
        const data = await r.json();
        setInitial(data.user);
        setForm({
          first_name: data.user.first_name ?? '',
          last_name: data.user.last_name ?? '',
          role: data.user.role ?? 'viewer',
        });
      } catch (e) {
        toast.error(e.message || 'Load failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const hasChanges = useMemo(() => {
    if (!initial || !form) return false;
    return (
      (initial.first_name ?? '') !== form.first_name ||
      (initial.last_name ?? '') !== form.last_name ||
      (initial.role ?? 'viewer') !== form.role
    );
  }, [initial, form]);

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const onReset = () => {
    if (!initial) return;
    setForm({
      first_name: initial.first_name ?? '',
      last_name: initial.last_name ?? '',
      role: initial.role ?? 'viewer',
    });
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const r = await fetch(`/api/settings/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'Save failed');
      }
      const data = await r.json();
      setInitial(data.user);
      // keep form in sync with what backend returned
      setForm({
        first_name: data.user.first_name ?? '',
        last_name: data.user.last_name ?? '',
        role: data.user.role ?? 'viewer',
      });
      toast.success('User saved');
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!initial) return <div className="p-6">User not found</div>;

  console.log({ initial, form, hasChanges });
  return (
    <div className="min-h-screen py-5">
      <div className="w-full max-w-3xl mx-auto px-6">
        {/* Header: back | title | actions */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 mb-6">
          <button className="btn btn-ghost" onClick={() => router.back()}>&larr; Back</button>
          <h1 className="text-2xl font-bold text-center">Edit User</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">First name</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaUser size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.first_name}
                onChange={onChange('first_name')}
                placeholder="First name"
              />
            </label>
            
            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">Last name</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaUser size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.last_name}
                onChange={onChange('last_name')}
                placeholder="Last name"
              />
            </label>

            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">Role</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaShield size={18} />
                </span>
              </div>
              <select className="select select-bordered" value={form.role} onChange={onChange('role')}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>
          </div>

          <div className="mt-6 text-sm opacity-70">
            <div><b>Email:</b> {initial.email}</div>
            <div><b>User ID:</b> {initial.id}</div>
            <div><b>Firebase ID:</b> {initial.firebase_uid}</div>
            <div><b>Created at:</b>{' '}
              {new Date(initial.created_at).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div><b>Updated at:</b>{' '}
              {initial.updated_at
                ? new Date(initial.updated_at).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : '—'}
            </div>
            <div><b>Last login:</b>{' '}
              {initial.last_login
                ? new Date(initial.last_login).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : '—'}
            </div>
          </div>

          <ToastContainer />
        </div>
      </div>
    </div>
  );
}
