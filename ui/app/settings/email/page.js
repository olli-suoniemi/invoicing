'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { FaKey } from "react-icons/fa";



export default function EmailPage() {     
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initial, setInitial] = useState(null); // original data from server
  const [form, setForm] = useState({
    api_key: '',
  });

  // track if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!initial) return false;
    return form.api_key !== initial.api_key;
  }, [form, initial]);

  // fetch current settings on mount
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const resp = await fetch('/api/settings/email');
        if (!resp.ok) throw new Error('Failed to fetch email settings');
        const data = await resp.json();
        setInitial(data.email);
        setForm({
          api_key: data.email.api_key || '',
        });
      } catch (error) {
        toast.error(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // handlers
  const onChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const onReset = () => {
    if (initial) {
      setForm({
        api_key: initial.api_key || '',
      });
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const resp = await fetch('/api/settings/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!resp.ok) throw new Error('Failed to save email settings');
      const data = await resp.json();
      setInitial(data.email);
      toast.success('Email settings saved successfully');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-5">
      <div className="w-full max-w-3xl mx-auto px-6">
        {/* Header: back | title | actions */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 mb-6">
          <button className="btn btn-ghost" onClick={() => router.back()}>&larr; Back</button>
          <h1 className="text-2xl font-bold text-center">Edit Email Settings</h1>
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
            <span className="text-gray-500">Email settings</span>
            <hr className="mt-2 mb-4 border-gray-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <div className='join px-1 pb-2'>
                <span className="label-text">API Key</span>
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaKey size={18} />
                </span>
              </div>
              <input className="input input-bordered"
                value={form.api_key}
                onChange={onChange('api_key')}
                placeholder="API Key"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

}