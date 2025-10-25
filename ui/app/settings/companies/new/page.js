'use client';

import React, { useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { MdEmail } from "react-icons/md";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaHouse, FaPhone, FaCity, FaMapLocationDot, FaMap } from "react-icons/fa6";
import { TbHexagonNumber7Filled } from "react-icons/tb";
import { BsSignpostFill } from "react-icons/bs";
import { CgWebsite } from "react-icons/cg";

export default function NewCompanyPage() {
  const [sameAsInvoice, setSameAsInvoice] = useState(true);

  const [company, setCompany] = useState({
    companyName: '',
    businessId: '',
    email: '',
    phone: '',
    website: '',
    invoiceStreet: '',
    invoiceCity: '',
    invoicePostalCode: '',
    invoiceState: '',
    invoiceCountry: '',
    deliveryStreet: '',
    deliveryCity: '',
    deliveryPostalCode: '',
    deliveryState: '',
    deliveryCountry: '',
  });

  // Determine if *any* field in the currently visible form has text
  const hasText = useMemo(() => {
    const values = Object.values(company);
    return values.some(v => (v ?? '').toString().trim() !== '');
  }, [company]);

  const handleSave = () => {

    if (sameAsInvoice) {
      // Copy invoice address to delivery address
      company.deliveryStreet = company.invoiceStreet;
      company.deliveryCity = company.invoiceCity;
      company.deliveryPostalCode = company.invoicePostalCode;
      company.deliveryState = company.invoiceState;
      company.deliveryCountry = company.invoiceCountry;
    }

    fetch('/api/settings/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(company),
    })
    .then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create company');
      }
      return res.json();
    })
    .then((data) => {
      // Successfully created company
      toast.success('Company created!');
      // Reset form
      setCompany({
        companyName: '',
        businessId: '',
        email: '',
        phone: '',
        website: '',
        invoiceStreet: '',
        invoiceCity: '',
        invoicePostalCode: '',
        invoiceState: '',
        invoiceCountry: '',
        deliveryStreet: '',
        deliveryCity: '',
        deliveryPostalCode: '',
        deliveryState: '',
        deliveryCountry: '',
      });
    })
    .catch((error) => {
      toast.error(`Error: ${error.message}`);
    });
  };

  return (
    <div className="flex justify-center items-start min-h-screen py-5">

      <ToastContainer />
      
      <div className="w-full max-w-4xl flex items-center gap-4">
        <div className="flex w-full flex-col gap-4">

          {/* Title + buttons */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Add new company</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  // Reset form
                  setCompany({
                    companyName: '',
                    businessId: '',
                    email: '',
                    phone: '',
                    website: '',
                    invoiceStreet: '',
                    invoiceCity: '',
                    invoicePostalCode: '',
                    invoiceState: '',
                    invoiceCountry: '',
                    deliveryStreet: '',
                    deliveryCity: '',
                    deliveryPostalCode: '',
                    deliveryState: '',
                    deliveryCountry: '',
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

              {/* Company name */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaHouse size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  placeholder="Company name"
                  value={company.companyName}
                  onChange={(e) => setCompany(s => ({ ...s, companyName: e.target.value }))}
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
                  placeholder="Business ID"
                  value={company.businessId}
                  onChange={(e) => setCompany(s => ({ ...s, businessId: e.target.value }))}
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
                  value={company.email}
                  onChange={(e) => setCompany(s => ({ ...s, email: e.target.value }))}
                />
              </div>

              {/* Phone */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaPhone size={18} />
                </span>
                <input
                  type="tel"
                  className="input input-bordered join-item w-full"
                  placeholder="Phone"
                  value={company.phone}
                  onChange={(e) => setCompany(s => ({ ...s, phone: e.target.value }))}
                />
              </div>

              {/* Website */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <CgWebsite size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  placeholder="Website"
                  value={company.website}
                  onChange={(e) => setCompany(s => ({ ...s, website: e.target.value }))}
                />
              </div>

              {/* Invoice address divider */}
              <div className="mt-4">
                <span className="text-gray-500">Invoice address</span>
                <hr className="mt-2 mb-1 border-gray-300" />
              </div>

              {/* Street */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMapMarkerAlt size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  placeholder="Street address"
                  value={company.invoiceStreet}
                  onChange={(e) => setCompany(s => ({ ...s, invoiceStreet: e.target.value }))}
                />
              </div>

              {/* City */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaCity size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  placeholder="City"
                  value={company.invoiceCity}
                  onChange={(e) => setCompany(s => ({ ...s, invoiceCity: e.target.value }))}
                />
              </div>

              {/* Postal Code */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <BsSignpostFill size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  placeholder="Postal Code"
                  value={company.invoicePostalCode}
                  onChange={(e) => setCompany(s => ({ ...s, invoicePostalCode: e.target.value }))}
                />
              </div>

              {/* State */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMapLocationDot size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  placeholder="State"
                  value={company.invoiceState}
                  onChange={(e) => setCompany(s => ({ ...s, invoiceState: e.target.value }))}
                />
              </div>

              {/* Country */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaMap size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  placeholder="Country"
                  value={company.invoiceCountry}
                  onChange={(e) => setCompany(s => ({ ...s, invoiceCountry: e.target.value }))}
                />
              </div>

              <div className="mt-4">
                <span className="text-gray-500">Delivery address</span>
                <hr className="mt-2 mb-4 border-gray-300" />
                {/* Checkbox same as invoice address? */}
                <label className="label">
                  <input 
                    type="checkbox" 
                    defaultChecked
                    className="toggle w-8 h-6 mr-2 text-gray-400 checked:text-gray-600" 
                    onChange={(e) => setSameAsInvoice(e.target.checked)}
                  />
                    Same as invoice address
                </label>
              </div>

              {/* Show delivery address fields only if checkbox is unchecked */}

              {!sameAsInvoice && (
                <>
                  {/* Street */}
                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <FaMapMarkerAlt size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      placeholder="Street address"
                      value={company.deliveryStreet}
                      onChange={(e) => setCompany(s => ({ ...s, deliveryStreet: e.target.value }))}
                    />
                  </div>

                  {/* City */}
                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <FaCity size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      placeholder="Delivery address city"
                      value={company.deliveryCity}
                      onChange={(e) => setCompany(s => ({ ...s, deliveryCity: e.target.value }))}
                    />
                  </div>

                  {/* Postal Code */}
                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <BsSignpostFill size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      placeholder="Postal Code"
                      value={company.deliveryPostalCode}
                      onChange={(e) => setCompany(s => ({ ...s, deliveryPostalCode: e.target.value }))}
                    />
                  </div>

                  {/* State */}
                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <FaMapLocationDot size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      placeholder="State"
                      value={company.deliveryState}
                      onChange={(e) => setCompany(s => ({ ...s, deliveryState: e.target.value }))}
                    />
                  </div>

                  {/* Country */}
                  <div className="join w-md">
                    <span className="join-item px-3 text-gray-500 flex items-center">
                      <FaMap size={18} />
                    </span>
                    <input
                      type="text"
                      className="input input-bordered join-item w-full"
                      placeholder="Country"
                      value={company.deliveryCountry}
                      onChange={(e) => setCompany(s => ({ ...s, deliveryCountry: e.target.value }))}
                    />
                  </div>
                </>
              )}
        </div>
      </div>
    </div>
  );
}
