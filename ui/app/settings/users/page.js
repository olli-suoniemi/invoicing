'use client';

import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
        toast.error(`Error: ${error.message ?? 'Failed to fetch users'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-start min-h-screen py-5">
        <ToastContainer />
        <div className="w-full max-w-4xl flex items-center justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  if (!users) {
    return (
      <div className="flex justify-center items-start min-h-screen py-5">
        <ToastContainer />
        <div className="w-full max-w-4xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Users not found</h1>
          </div>
          <p className="text-gray-500">
            We couldn&rsquo;t find any users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen py-5">
      <div className="w-full flex flex-col gap-10">
        {/* Header + actions */}
        <div className="w-full max-w-4xl flex items-center gap-12 self-center">
          <h1 className="text-3xl font-bold">Users</h1>

          <label className="input w-full">
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
            <input type="search" className="grow" placeholder="Search" />
          </label>

          <Link
            className="btn"
            title="Add new user"
            href="/settings/users/new"
          >
            <FaPlus size={20} />
          </Link>
        </div>

        {/* Table */}
        {users.length === 0 ? (
          <p className="mt-10 text-center text-gray-500">
            No users found.
          </p>
        ) : (
          <div className="w-full max-w-4xl self-center overflow-x-auto">
            <table className="table table-zebra table-fixed w-full text-center">
              <thead>
                <tr>
                  <th className="w-1/4 text-center">Name</th>
                  <th className="w-1/4 text-center">Email</th>
                  <th className="w-1/4 text-center">Role</th>
                  <th className="w-1/4 text-center">Last login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover cursor-pointer hover:bg-accent/10"
                    onClick={() => router.push(`/settings/users/${u.id}`)}
                  >
                    <td className="text-center">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="text-center">{u.email}</td>
                    <td className="text-center">
                      <span
                        className={`badge inline-flex ${
                          u.role === 'admin'
                            ? 'badge-primary'
                            : 'badge-secondary'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="text-center">
                      {u.last_login
                        ? new Date(u.last_login).toLocaleString('fi-FI')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}



        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
}
