'use client';

import React, { useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { MdEmail } from "react-icons/md";
import { FaUser, FaShield } from "react-icons/fa6";

export default function NewUserPage() {
  const [person, setPerson] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
  });

  // Determine if *any* field in the currently visible form has text
  const hasText = useMemo(() => {
    const values = Object.values(person);
    return values.some(v => (v ?? '').toString().trim() !== '');
  }, [person]);

  const handleSave = async () => {
    if (!person.firstName && !person.lastName && !person.email) {
      toast.error("Please fill in name, last name, and email.");
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Upstream error');
      }

      // Success
      toast.success("User created successfully.");
      // Reset form
      setPerson({
        firstName: '',
        lastName: '',
        email: '',
        role: 'user',
      });
    } catch (error) {
      console.error(error);
      toast.error(`Error creating user: ${error.message || error}`);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen py-5">

      <ToastContainer />
      
      <div className="w-full max-w-4xl flex items-center gap-4">
        <div className="flex w-full flex-col gap-4">

          {/* Title + buttons */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Add new user</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  // Reset form
                  setPerson({
                    firstName: '',
                    lastName: '',
                    email: '',
                    role: 'user',
                  });
                }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasText}
                className={`btn btn-primary ${!hasText ? 'btn-disabled opacity-50 cursor-not-allowed' : ''}`}
                aria-disabled={!hasText}
              >
                Save
              </button>
            </div>
          </div>
          
          {/* Name */}
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaUser size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full"
              placeholder="First name"
              value={person.firstName}
              onChange={(e) => setPerson(s => ({ ...s, firstName: e.target.value }))}
            />
          </div>

          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaUser size={18} />
            </span>
            <input
              type="text"
              className="input input-bordered join-item w-full"
              placeholder="Last name"
              value={person.lastName}
              onChange={(e) => setPerson(s => ({ ...s, lastName: e.target.value }))}
            />
          </div>

          {/* Email */}
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <MdEmail size={18} />
            </span>
            <input
              type="email"
              className="input input-bordered join-item w-full"
              placeholder="Email"
              value={person.email}
              onChange={(e) => setPerson(s => ({ ...s, email: e.target.value }))}
            />
          </div>

          {/* Role */}
          <div className="join w-md">
            <span className="join-item px-3 text-gray-500 flex items-center">
              <FaShield size={18} />
            </span>
            <select
              className="select select-bordered join-item w-full"
              value={person.role}
              onChange={(e) => setPerson(s => ({ ...s, role: e.target.value }))}
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
