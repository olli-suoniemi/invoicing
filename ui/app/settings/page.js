'use client';

import React from 'react';
import Link from 'next/link';

export default function SettingsPage() {

  return (
    <div className="flex min-h-screen py-5">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center">General Settings</h1>

      <div className="w-full flex flex-col gap-10">
        <div className="flex flex-col p-10 mr-10 rounded-md shadow-md bg-base-300">
          <h2 className="text-2xl font-semibold">Users</h2>
          <p className="mt-4 text-base-content/70">Add, remove, and modify user accounts for your company.</p>
          <p className="mt-2 text-base-content/70">Manage user roles, permissions, and access levels.</p>
          <Link href="/settings/users">
            <button className="mt-4 btn btn-primary w-fit">Manage Users</button>
          </Link>
        </div>
        <div className="flex flex-col p-10 mr-10 rounded-md shadow-md bg-base-300">
          <h2 className="text-2xl font-semibold">Company Settings</h2>
          <p className="mt-4 text-base-content/70">Add, remove, and modify company settings.</p>
          <p className="mt-2 text-base-content/70">Change your company name, address, contact info, and other details.</p>
          <Link href="/settings/companies">
            <button className="mt-4 btn btn-primary w-fit">Manage Company Settings</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
