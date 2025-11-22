// app/customers/[id]/page.jsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';

import { MdEmail } from "react-icons/md";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaHouse, FaPhone, FaUser, FaCity, FaMapLocationDot, FaMap } from "react-icons/fa6";
import { TbHexagonNumber7Filled } from "react-icons/tb";
import { BsSignpostFill } from "react-icons/bs";

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchCustomer() {
      try {
        const res = await fetch(`/api/customers/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch customer');
        }
        const data = await res.json();
        console.log(data);
        // API returns { customer: {...} }
        setCustomer(data.customer);
      } catch (err) {
        console.error(err);
        toast.error(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomer();
  }, [id]);

  const isCompany = customer?.type === 'business'; // from your enum: 'business' | 'individual'

  // Display name and basic fields
  const displayName = useMemo(() => {
    if (!customer) return '';
    return customer.name || '';
  }, [customer]);

  const email = customer?.email ?? '';

  // --- Address helpers: pick from addresses[] by type ---

  const invoicingAddress = useMemo(() => {
    return customer?.addresses?.find(a => a.type === 'invoicing') ?? null;
  }, [customer]);

  const deliveryAddress = useMemo(() => {
    return customer?.addresses?.find(a => a.type === 'delivery') ?? null;
  }, [customer]);

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

  if (!customer) {
    return (
      <div className="flex justify-center items-start min-h-screen py-5">
        <ToastContainer />
        <div className="w-full max-w-4xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Customer not found</h1>
            <button className="btn btn-ghost" onClick={() => router.back()}>
              Back
            </button>
          </div>
          <p className="text-gray-500">
            We couldn&rsquo;t find a customer with id <code>{id}</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen py-5">
      <ToastContainer />

      <div className="w-full max-w-4xl flex items-center gap-4">
        <div className="flex w-full flex-col gap-4">
          {/* Title + buttons */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">
                {displayName || 'Customer details'}
              </h1>
              <span className="badge badge-neutral mt-1 w-fit">
                {isCompany ? 'Company' : 'Person'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.back()}
              >
                Back
              </button>
              {/* Optional: link to edit page later */}
              {/* <Link href={`/customers/${id}/edit`} className="btn btn-primary">
                Edit
              </Link> */}
            </div>
          </div>

          {/* COMPANY VIEW (type = 'business') */}
          {isCompany && (
            <>
              {/* Company name */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaHouse size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={displayName}
                  placeholder="Company name"
                />
              </div>

              {/* Business ID */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <TbHexagonNumber7Filled size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={customer.business_id ?? customer.businessId ?? ''}
                  placeholder="Business ID"
                />
              </div>

              {/* VAT ID */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <TbHexagonNumber7Filled size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={customer.vat_id ?? ''}
                  placeholder="VAT ID"
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
                  readOnly
                  value={email}
                  placeholder="Email"
                />
              </div>

              {/* Phone (if you add it later to API, otherwise will just be empty) */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaPhone size={18} />
                </span>
                <input
                  type="tel"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={customer.phone ?? ''}
                  placeholder="Phone"
                />
              </div>

              {/* Invoice address from invoicingAddress */}
              <div className="mt-4">
                <span className="text-gray-500">Invoice address</span>
                <hr className="mt-2 mb-1 border-gray-300" />
              </div>

              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMapMarkerAlt size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={invoicingAddress?.address ?? ''}
                  placeholder="Street address"
                />
              </div>

              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaCity size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={invoicingAddress?.city ?? ''}
                  placeholder="City"
                />
              </div>

              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <BsSignpostFill size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={invoicingAddress?.postal_code ?? ''}
                  placeholder="Postal Code"
                />
              </div>

              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMapLocationDot size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={invoicingAddress?.state ?? ''}
                  placeholder="State"
                />
              </div>

              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMap size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={invoicingAddress?.country ?? ''}
                  placeholder="Country"
                />
              </div>

              {/* Delivery address from deliveryAddress (if present) */}
              {deliveryAddress && (
                <>
                  <div className="mt-4">
                    <span className="text-gray-500">Delivery address</span>
                    <hr className="mt-2 mb-1 border-gray-300" />
                  </div>

                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <FaMapMarkerAlt size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      readOnly
                      value={deliveryAddress.address ?? ''}
                      placeholder="Street address"
                    />
                  </div>

                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <FaCity size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      readOnly
                      value={deliveryAddress.city ?? ''}
                      placeholder="City"
                    />
                  </div>

                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <BsSignpostFill size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      readOnly
                      value={deliveryAddress.postal_code ?? ''}
                      placeholder="Postal Code"
                    />
                  </div>

                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <FaMapLocationDot size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      readOnly
                      value={deliveryAddress.state ?? ''}
                      placeholder="State"
                    />
                  </div>

                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <FaMap size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      readOnly
                      value={deliveryAddress.country ?? ''}
                      placeholder="Country"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* PERSON VIEW (type = 'individual') */}
          {!isCompany && (
            <>
              {/* Name */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaUser size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={displayName}
                  placeholder="Full name"
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
                  readOnly
                  value={email}
                  placeholder="Email"
                />
              </div>

              {/* Phone (if you add it) */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaPhone size={18} />
                </span>
                <input
                  type="tel"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={customer.phone ?? ''}
                  placeholder="Phone"
                />
              </div>

              {/* Invoice address (still invoicingAddress) */}
              <div className="mt-4">
                <span className="text-gray-500">Invoice address</span>
                <hr className="mt-2 mb-1 border-gray-300" />
              </div>

              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMapMarkerAlt size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={invoicingAddress?.address ?? ''}
                  placeholder="Street address"
                />
              </div>

              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaCity size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={invoicingAddress?.city ?? ''}
                  placeholder="City"
                />
              </div>

              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <BsSignpostFill size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={invoicingAddress?.postal_code ?? ''}
                  placeholder="Postal Code"
                />
              </div>

              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMapLocationDot size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={invoicingAddress?.state ?? ''}
                  placeholder="State"
                />
              </div>

              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMap size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  readOnly
                  value={invoicingAddress?.country ?? ''}
                  placeholder="Country"
                />
              </div>

              {/* Delivery address for person */}
              {deliveryAddress && (
                <>
                  <div className="mt-4">
                    <span className="text-gray-500">Delivery address</span>
                    <hr className="mt-2 mb-1 border-gray-300" />
                  </div>

                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <FaMapMarkerAlt size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      readOnly
                      value={deliveryAddress.address ?? ''}
                      placeholder="Street address"
                    />
                  </div>

                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <FaCity size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      readOnly
                      value={deliveryAddress.city ?? ''}
                      placeholder="City"
                    />
                  </div>

                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <BsSignpostFill size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      readOnly
                      value={deliveryAddress.postal_code ?? ''}
                      placeholder="Postal Code"
                    />
                  </div>

                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <FaMapLocationDot size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      readOnly
                      value={deliveryAddress.state ?? ''}
                      placeholder="State"
                    />
                  </div>

                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <FaMap size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      readOnly
                      value={deliveryAddress.country ?? ''}
                      placeholder="Country"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
