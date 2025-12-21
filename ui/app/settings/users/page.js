'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/loadingSpinner';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/settings/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users ?? []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error(error.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) =>
      `${u.first_name ?? ''} ${u.last_name ?? ''} ${u.email ?? ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [users, query]);

  if (loading) return <LoadingSpinner />;

  if (!users) {
    return (
      <div className="min-h-screen py-4 sm:py-5">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Users not found</h1>
          <p className="text-gray-500">We couldn&rsquo;t find any users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-5 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 sm:gap-10">
        {/* Header + actions (same pattern as OrdersPage) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Users</h1>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <label className="input w-full sm:w-[22rem]">
              <svg className="h-[1em] opacity-50" viewBox="0 0 24 24">
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </g>
              </svg>
              <input
                type="search"
                className="grow"
                placeholder="Search users"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            <Link
              className="btn w-full sm:w-auto"
              title="Add new user"
              href="/settings/users/new"
            >
              <FaPlus size={18} />
              <span className="sm:hidden">Add user</span>
            </Link>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-6 text-center text-gray-500">No users found.</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="grid gap-3 sm:hidden">
              {filtered.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => router.push(`/settings/users/${u.id}`)}
                  className="text-left rounded-lg bg-base-100 shadow p-4 active:scale-[0.99] transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">
                        {u.first_name} {u.last_name}
                      </div>
                      <div className="text-sm opacity-70">{u.email}</div>
                    </div>
                    <span
                      className={`badge ${
                        u.role === 'admin'
                          ? 'badge-primary'
                          : 'badge-secondary'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="opacity-70">Last login</div>
                    <div className="text-right">
                      {u.last_login
                        ? new Date(u.last_login).toLocaleString('fi-FI')
                        : '—'}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table table-zebra table-fixed w-full text-center">
                <thead>
                  <tr>
                    <th className="w-1/4">Name</th>
                    <th className="w-1/4">Email</th>
                    <th className="w-1/4">Role</th>
                    <th className="w-1/4">Last login</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="hover cursor-pointer hover:bg-accent/10"
                      onClick={() => router.push(`/settings/users/${u.id}`)}
                    >
                      <td>{u.first_name} {u.last_name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === 'admin'
                              ? 'badge-primary'
                              : 'badge-secondary'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.last_login
                          ? new Date(u.last_login).toLocaleString('fi-FI')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
