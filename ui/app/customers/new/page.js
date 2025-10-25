'use client';

import React, { useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { MdEmail } from "react-icons/md";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaHouse, FaPhone, FaUser, FaCity, FaMapLocationDot, FaMap } from "react-icons/fa6";
import { TbHexagonNumber7Filled } from "react-icons/tb";
import { BsSignpostFill } from "react-icons/bs";

export default function CustomersPage() {
  const [customerType, setCustomerType] = useState('person');
  const [sameAsInvoice, setSameAsInvoice] = useState(true);

  // Controlled state for both variants
  const [person, setPerson] = useState({
    fullName: '',
    email: '',
    phone: '',
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

  const [company, setCompany] = useState({
    companyName: '',
    businessId: '',
    email: '',
    phone: '',
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
    const values = Object.values(customerType === 'person' ? person : company);
    return values.some(v => (v ?? '').toString().trim() !== '');
  }, [customerType, person, company]);

  const handleSave = () => {
    const payload = customerType === 'person' ? { type: 'person', ...person } : { type: 'company', ...company };
    // Do your submit here (fetch/axios/action)
    // await saveCustomer(payload)
    toast.success('New customer created!');
  };

  return (
    <div className="flex justify-center items-start min-h-screen py-5">

      <ToastContainer />
      
      <div className="w-full max-w-4xl flex items-center gap-4">
        <div className="flex w-full flex-col gap-4">

          {/* Title + buttons */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Add new customer</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  // Reset form
                  setPerson({
                    fullName: '',
                    email: '',
                    phone: '',
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
                  setCompany({
                    companyName: '',
                    businessId: '',
                    email: '',
                    phone: '',
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

          {/* Person / Company switch */}
          <div className="flex items-center gap-4">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="radio"
                name="customerType"
                value="person"
                checked={customerType === 'person'}
                onChange={() => setCustomerType('person')}
              />
              <span>Person</span>
            </label>
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="radio"
                name="customerType"
                value="company"
                checked={customerType === 'company'}
                onChange={() => setCustomerType('company')}
              />
              <span>Company</span>
            </label>
          </div>

          {/* Company form */}
          {customerType === 'company' && (
            <>
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
            </>
          )}

          {/* Person form */}
          {customerType === 'person' && (
            <>
              {/* Name */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaUser size={18} />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  placeholder="Full name"
                  value={person.fullName}
                  onChange={(e) => setPerson(s => ({ ...s, fullName: e.target.value }))}
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

              {/* Phone */}
              <div className="join w-md">
                <span className="join-item px-3 text-gray-500 flex items-center">
                  <FaPhone size={18} />
                </span>
                <input
                  type="tel"
                  className="input input-bordered join-item w-full"
                  placeholder="Phone"
                  value={person.phone}
                  onChange={(e) => setPerson(s => ({ ...s, phone: e.target.value }))}
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
                  value={person.invoiceStreet}
                  onChange={(e) => setPerson(s => ({ ...s, invoiceStreet: e.target.value }))}
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
                  value={person.invoiceCity}
                  onChange={(e) => setPerson(s => ({ ...s, invoiceCity: e.target.value }))}
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
                  value={person.invoicePostalCode}
                  onChange={(e) => setPerson(s => ({ ...s, invoicePostalCode: e.target.value }))}
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
                  value={person.invoiceState}
                  onChange={(e) => setPerson(s => ({ ...s, invoiceState: e.target.value }))}
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
                  value={person.invoiceCountry}
                  onChange={(e) => setPerson(s => ({ ...s, invoiceCountry: e.target.value }))}
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
                      value={person.deliveryStreet}
                      onChange={(e) => setPerson(s => ({ ...s, deliveryStreet: e.target.value }))}
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
                      value={person.deliveryCity}
                      onChange={(e) => setPerson(s => ({ ...s, deliveryCity: e.target.value }))}
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
                      value={person.deliveryPostalCode}
                      onChange={(e) => setPerson(s => ({ ...s, deliveryPostalCode: e.target.value }))}
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
                      value={person.deliveryState}
                      onChange={(e) => setPerson(s => ({ ...s, deliveryState: e.target.value }))}
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
                      value={person.deliveryCountry}
                      onChange={(e) => setPerson(s => ({ ...s, deliveryCountry: e.target.value }))}
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
