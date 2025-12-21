'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { FaKey } from 'react-icons/fa';

export default function EmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({ api_key: '' });

  const hasChanges = useMemo(() => {
    if (!initial) return false;
    return form.api_key !== initial.api_key;
  }, [form, initial]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const resp = await fetch('/api/settings/email');
        if (!resp.ok) throw new Error('Failed to fetch email settings');
        const data = await resp.json();
        setInitial(data.email);
        setForm({ api_key: data.email.api_key || '' });
      } catch (error) {
        toast.error(error.message || 'Failed to load email settings');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const onChange = (field) => (e) =>
    setForm((s) => ({ ...s, [field]: e.target.value }));

  const onReset = () => {
    if (!initial) return;
    setForm({ api_key: initial.api_key || '' });
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const resp = await fetch('/api/settings/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!resp.ok) throw new Error('Failed to save email settings');
      const data = await resp.json();
      setInitial(data.email);
      toast.success('Email settings saved');
    } catch (error) {
      toast.error(error.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-4 sm:py-5 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
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
                <button
                  className="btn btn-ghost btn-md"
                  onClick={() => router.back()}
                >
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
                    className={`btn btn-primary btn-md ${
                      !hasChanges ? 'btn-disabled opacity-50' : ''
                    }`}
                    onClick={onSave}
                    disabled={!hasChanges || saving}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
              
              {/* Desktop actions */}
              <div className="hidden md:flex gap-2 justify-self-end">
                <button
                  className="btn btn-ghost"
                  onClick={onReset}
                  disabled={!hasChanges || saving}
                >
                  Reset
                </button>
                <button
                  className={`btn btn-primary ${
                    !hasChanges ? 'btn-disabled opacity-50' : ''
                  }`}
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
            <h2 className="text-xl font-semibold">Email configuration</h2>
            <span className="badge badge-neutral mt-1 w-fit">
              Provider settings
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control md:col-span-2">
              <div className="label py-1">
                <span className="label-text">API key</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <FaKey size={18} />
                </span>
              </div>
              <input
                className="input input-bordered w-full h-12 md:h-10"
                value={form.api_key}
                onChange={onChange('api_key')}
                placeholder="API key"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
