'use client';

import React, { useEffect, useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaPlus } from "react-icons/fa";
import Link from 'next/link';

export default function CustomersPage() {

  return (
    <div className="flex justify-center items-start min-h-screen py-5">
      <div className="w-full max-w-4xl flex items-center gap-12">
        <h1 className="text-3xl font-bold">Customers</h1>

        <label className="input w-full">
          <svg className="h-[1em] opacity-50" viewBox="0 0 24 24">
            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </g>
          </svg>
          <input type="search" className="grow" placeholder="Search" />
        </label>

        <Link className="btn" title="Add new customer" href="/customers/new">
          <FaPlus size={20} />
        </Link>
      </div>
    </div>

  );
}
