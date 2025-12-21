'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBuilding, FaUsers, FaEnvelope } from 'react-icons/fa6';

function SettingsCard({ href, title, desc, icon }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-base-300 bg-base-100 p-5 sm:p-6 hover:bg-base-200/40 transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <p className="mt-2 text-base-content/70 text-sm sm:text-base">{desc}</p>
        </div>
        <div className="text-base-content/60 mt-1">{icon}</div>
      </div>

      <div className="mt-4">
        <span className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto">
          Manage
        </span>
      </div>
    </Link>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen py-4 sm:py-5">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        {/* Sticky header */}
        <div className="mb-4 md:mb-6">
          <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-base-100/90 backdrop-blur border-b border-base-200">
            <div className="flex items-center justify-between">
              <button className="btn btn-ghost btn-md" onClick={() => router.back()}>
                &larr; Back
              </button>
              <h1 className="text-lg sm:text-xl font-bold">General Settings</h1>
              <div className="w-[88px]" /> {/* spacer to keep title centered */}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingsCard
            href="/settings/company"
            title="Company Settings"
            desc="Change your company name, address, contact info, and other details."
            icon={<FaBuilding size={22} />}
          />
          <SettingsCard
            href="/settings/users"
            title="Users"
            desc="Add, remove, and modify user accounts for your company."
            icon={<FaUsers size={22} />}
          />
          <SettingsCard
            href="/settings/email"
            title="Email"
            desc="Configure email settings."
            icon={<FaEnvelope size={22} />}
          />
        </div>
      </div>
    </div>
  );
}
