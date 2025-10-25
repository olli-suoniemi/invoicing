'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/app/components/loadingSpinner';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/settings/companies');
        const data = await response.json();
        setCompanies(data?.companies || []);
        console.log(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (companies?.length === 0) return (
    <div className="min-h-screen py-5">
      <div className="flex items-center gap-5 mb-6 px-5">
        {/* Back button */}
        <button className="btn btn-ghost" onClick={() => router.back()}>&larr; Back</button>
        <h1 className="text-3xl font-bold px-5">
          Companies
        </h1>
        <button className="btn" onClick={() => router.push('/settings/companies/new')}>
          + Add Company
        </button>
      </div>
      <p className="text-center">No companies found</p>
    </div>
  );

  return (
    <div className="min-h-screen py-5">
      {/* Row */}
      <div className="flex items-center gap-5 mb-6 px-5">
        {/* Back button */}
        <button className="btn btn-ghost" onClick={() => router.back()}>&larr; Back</button>
        <h1 className="text-3xl font-bold px-5">
          Companies
        </h1>
        <button className="btn" onClick={() => router.push('/settings/companies/new')}>
          + Add Company
        </button>
      </div>
      <div className="w-full mx-auto px-6">
        <div className="overflow-x-auto rounded-xl">
          <table className="table table-zebra table-fixed w-full">
            <thead>
              <tr className="text-center">
                <th className="w-1/4">Name</th>
                <th className="w-1/4">Email</th>
                <th className="w-1/4">Business ID</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {companies.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-base-300 cursor-pointer transition"
                  onClick={() => router.push(`/settings/companies/${c.id}`)}
                >
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.business_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
