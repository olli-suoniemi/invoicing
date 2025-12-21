'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { MdEmail } from 'react-icons/md';
import { FaUser, FaShield } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';

const initialPerson = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'user',
};

export default function NewUserPage() {
  const [person, setPerson] = useState(initialPerson);
  const router = useRouter();

  // Has the user typed *anything* or changed role?
  const canSave = useMemo(() => {
    return (
      person.firstName.trim() !== '' ||
      person.lastName.trim() !== '' ||
      person.email.trim() !== '' ||
      person.role !== initialPerson.role
    );
  }, [person]);

  // Any change compared to initial state (for enabling Reset)
  const hasChanges = useMemo(() => {
    return JSON.stringify(person) !== JSON.stringify(initialPerson);
  }, [person]);

  const handleSave = async () => {
    if (!canSave) return;

    if (!person.firstName && !person.lastName && !person.email) {
      toast.error('Please fill in name, last name, and email.');
      return;
    }

    const payload = {
      first_name: person.firstName,
      last_name: person.lastName,
      email: person.email,
      role: person.role,
    };

    try {
      const resp = await fetch('/api/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || 'Upstream error');

      toast.success('User created successfully.');
      setPerson(initialPerson);
      router.push('/settings/users');
    } catch (error) {
      console.error(error);
      toast.error(`Error creating user: ${error.message || error}`);
    }
  };

  const resetForm = () => setPerson(initialPerson);

  return (
    <div className="min-h-screen py-4 sm:py-5">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4">
          {/* Sticky header (same pattern as CustomerNewPage / InventoryNewPage) */}
          <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-base-100/90 backdrop-blur border-b border-base-200">
            <div className="flex flex-col gap-2 md:grid md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="flex items-center justify-between md:justify-start gap-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-md"
                  onClick={() => router.back()}
                >
                  &larr; Back
                </button>

                {/* Mobile actions */}
                <div className="flex gap-2 md:hidden">
                  <button
                    type="button"
                    className={`btn btn-ghost btn-md ${
                      !hasChanges ? 'btn-disabled opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!hasChanges}
                    onClick={resetForm}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    className={`btn btn-primary btn-md ${
                      !canSave ? 'btn-disabled opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-disabled={!canSave}
                  >
                    Save
                  </button>
                </div>
              </div>

              <h1 className="text-lg md:text-3xl font-bold md:text-center leading-tight ml-2">
                Add new user
              </h1>

              {/* Desktop actions */}
              <div className="hidden md:flex items-center gap-2 justify-self-end">
                <button
                  type="button"
                  className={`btn btn-ghost ${
                    !hasChanges ? 'btn-disabled opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!hasChanges}
                  onClick={resetForm}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave}
                  className={`btn btn-primary ${
                    !canSave ? 'btn-disabled opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-disabled={!canSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="join w-full">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaUser size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full h-12 md:h-10"
              placeholder="First name"
              value={person.firstName}
              onChange={(e) => setPerson((s) => ({ ...s, firstName: e.target.value }))}
            />
          </div>

          <div className="join w-full">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaUser size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full h-12 md:h-10"
              placeholder="Last name"
              value={person.lastName}
              onChange={(e) => setPerson((s) => ({ ...s, lastName: e.target.value }))}
            />
          </div>

          <div className="join w-full">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <MdEmail size={18} />
            </span>
            <input
              type="email"
              className="input input-bordered join-item w-full h-12 md:h-10"
              placeholder="Email"
              value={person.email}
              onChange={(e) => setPerson((s) => ({ ...s, email: e.target.value }))}
            />
          </div>

          <div className="join w-full">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaShield size={18} />
            </span>
            <select
              className="select select-bordered join-item w-full h-12 md:h-10"
              value={person.role}
              onChange={(e) => setPerson((s) => ({ ...s, role: e.target.value }))}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
