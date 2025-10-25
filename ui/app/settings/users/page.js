'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/app/components/loadingSpinner';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/settings/users');
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!users) return (
    <div className="min-h-screen py-5">
      <div className="flex items-center gap-5 mb-6 px-5">
        {/* Back button */}
        <button className="btn btn-ghost" onClick={() => router.back()}>&larr; Back</button>
        <h1 className="text-3xl font-bold px-5">
          Users
        </h1>
        <button className="btn" onClick={() => router.push('/settings/users/new')}>
          + Add User
        </button>
      </div>
      <p className="text-center">No users found</p>
    </div>
  );

  return (
    <div className="min-h-screen py-5">
      {/* Row */}
      <div className="flex items-center gap-5 mb-6 px-5">
        {/* Back button */}
        <button className="btn btn-ghost" onClick={() => router.back()}>&larr; Back</button>
        <h1 className="text-3xl font-bold px-5">
          Users
        </h1>
        <button className="btn" onClick={() => router.push('/settings/users/new')}>
          + Add User
        </button>
      </div>
      <div className="w-full mx-auto px-6">
        <div className="overflow-x-auto rounded-xl">
          <table className="table table-zebra table-fixed w-full">
            <thead>
              <tr className="text-center">
                <th className="w-1/4">Name</th>
                <th className="w-1/4">Email</th>
                <th className="w-1/4">Role</th>
                <th className="w-1/4">Last login</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-base-300 cursor-pointer transition"
                  onClick={() => router.push(`/settings/users/${u.id}`)}
                >
                  <td>{u.first_name} {u.last_name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {new Date(u.last_login).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
