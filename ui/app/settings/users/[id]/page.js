'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, useRouter } from 'next/navigation';
import { FaUser, FaShield } from 'react-icons/fa6';
import LoadingSpinner from '@/app/components/loadingSpinner';

export default function UserPage() {
  const { id } = useParams();
  const router = useRouter();

  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState(null);
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
          role: data.user.role ?? 'user',
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
      (initial.role ?? 'user') !== form.role
    );
  }, [initial, form]);

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const onReset = () => {
    if (!initial) return;
    setForm({
      first_name: initial.first_name ?? '',
      last_name: initial.last_name ?? '',
      role: initial.role ?? 'user',
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
      setForm({
        first_name: data.user.first_name ?? '',
        last_name: data.user.last_name ?? '',
        role: data.user.role ?? 'user',
      });

      toast.success('User saved');
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!initial) {
    return (
      <div className="min-h-screen py-4 sm:py-5">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
          <div className="rounded-xl border border-base-300 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">User not found</h1>
              <button className="btn btn-ghost" onClick={() => router.back()}>
                Back
              </button>
            </div>
            <p className="text-gray-500 mt-2">We couldn&rsquo;t find that user.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-5">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        {/* Sticky header */}
        <div className="mb-4 md:mb-6">
          <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-base-100/90 backdrop-blur border-b border-base-200">
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
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {`${form.first_name || ''} ${form.last_name || ''}`.trim() || 'User details'}
            </h2>
            <span className="badge badge-neutral mt-1 w-fit">{initial.role ?? 'user'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <div className="label py-1">
                <span className="label-text">First name</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <FaUser size={18} />
                </span>
              </div>
              <input
                className="input input-bordered w-full h-12 md:h-10"
                value={form.first_name}
                onChange={onChange('first_name')}
                placeholder="First name"
              />
            </label>

            <label className="form-control">
              <div className="label py-1">
                <span className="label-text">Last name</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <FaUser size={18} />
                </span>
              </div>
              <input
                className="input input-bordered w-full h-12 md:h-10"
                value={form.last_name}
                onChange={onChange('last_name')}
                placeholder="Last name"
              />
            </label>

            <label className="form-control md:col-span-2">
              <div className="label py-1">
                <span className="label-text">Role</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <FaShield size={18} />
                </span>
              </div>
              <select
                className="select select-bordered w-full h-12 md:h-10"
                value={form.role}
                onChange={onChange('role')}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>
          </div>

          {/* Meta */}
          <div className="mt-6">
            <div className="divider my-2 text-md opacity-60">Meta</div>
            <div className="text-sm sm:text-md opacity-70 space-y-1">
              <div>
                <b>Email:</b> {initial.email}
              </div>
              <div>
                <b>User ID:</b> {initial.id}
              </div>
              <div>
                <b>Firebase ID:</b> {initial.firebase_uid}
              </div>
              <div>
                <b>Created:</b>{' '}
                {initial.created_at ? new Date(initial.created_at).toLocaleString('fi-FI') : '—'}
              </div>
              <div>
                <b>Updated:</b>{' '}
                {initial.updated_at ? new Date(initial.updated_at).toLocaleString('fi-FI') : '—'}
              </div>
              <div>
                <b>Last login:</b>{' '}
                {initial.last_login ? new Date(initial.last_login).toLocaleString('fi-FI') : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
