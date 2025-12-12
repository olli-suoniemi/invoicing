'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { MdEmail } from "react-icons/md";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaHouse, FaPhone, FaUser, FaCity, FaMapLocationDot, FaMap } from "react-icons/fa6";
import { TbHexagonNumber7Filled } from "react-icons/tb";
import { BsSignpostFill } from "react-icons/bs";
import { useRouter } from 'next/navigation';

export default function CustomerNewPage() {
  const router = useRouter();
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

  const handleSave = async () => {
    const fullName = person.fullName.trim();
    const email = person.email.trim();
    const phone = person.phone.trim();

    // Person invoice address (always from invoice fields)
    const invoiceStreet = person.invoiceStreet.trim();
    const invoiceCity = person.invoiceCity.trim();
    const invoicePostalCode = person.invoicePostalCode.trim();
    const invoiceState = person.invoiceState.trim();
    const invoiceCountry = person.invoiceCountry.trim();

    // Person delivery address (may mirror invoice if sameAsInvoice)
    let deliveryStreet;
    let deliveryCity;
    let deliveryPostalCode;
    let deliveryState;
    let deliveryCountry;

    if (sameAsInvoice) {
      deliveryStreet = invoiceStreet;
      deliveryCity = invoiceCity;
      deliveryPostalCode = invoicePostalCode;
      deliveryState = invoiceState;
      deliveryCountry = invoiceCountry;
    } else {
      deliveryStreet = person.deliveryStreet.trim();
      deliveryCity = person.deliveryCity.trim();
      deliveryPostalCode = person.deliveryPostalCode.trim();
      deliveryState = person.deliveryState.trim();
      deliveryCountry = person.deliveryCountry.trim();
    }

    // --- Trim company basics ---
    const companyName = company.companyName.trim();
    const businessId = company.businessId.trim();
    const compEmail = company.email.trim();
    const compPhone = company.phone.trim();

    // Company invoice address
    const compInvoiceStreet = company.invoiceStreet.trim();
    const compInvoiceCity = company.invoiceCity.trim();
    const compInvoicePostalCode = company.invoicePostalCode.trim();
    const compInvoiceState = company.invoiceState.trim();
    const compInvoiceCountry = company.invoiceCountry.trim();

    // Company delivery address
    let compDeliveryStreet;
    let compDeliveryCity;
    let compDeliveryPostalCode;
    let compDeliveryState;
    let compDeliveryCountry;

    if (sameAsInvoice) {
      compDeliveryStreet = compInvoiceStreet;
      compDeliveryCity = compInvoiceCity;
      compDeliveryPostalCode = compInvoicePostalCode;
      compDeliveryState = compInvoiceState;
      compDeliveryCountry = compInvoiceCountry;
    } else {
      compDeliveryStreet = company.deliveryStreet.trim();
      compDeliveryCity = company.deliveryCity.trim();
      compDeliveryPostalCode = company.deliveryPostalCode.trim();
      compDeliveryState = company.deliveryState.trim();
      compDeliveryCountry = company.deliveryCountry.trim();
    }

    // --- Validation helpers ---
    const requireIfPerson = (value, message) => {
      if (customerType === 'person' && !value) {
        toast.error(message);
        return false;
      }
      return true;
    };

    const requireIfCompany = (value, message) => {
      if (customerType === 'company' && !value) {
        toast.error(message);
        return false;
      }
      return true;
    };

    // --- Basic validation ---

    // Person
    if (
      !requireIfPerson(fullName, 'Full name is required') ||
      !requireIfPerson(email, 'Email is required') ||
      !requireIfPerson(invoiceStreet, 'Invoice street is required') ||
      !requireIfPerson(invoiceCity, 'Invoice city is required') ||
      !requireIfPerson(invoicePostalCode, 'Invoice postal code is required') ||
      !requireIfPerson(invoiceCountry, 'Invoice country is required') ||
      !requireIfPerson(deliveryStreet, 'Delivery street is required') ||
      !requireIfPerson(deliveryCity, 'Delivery city is required') ||
      !requireIfPerson(deliveryPostalCode, 'Delivery postal code is required') ||
      !requireIfPerson(deliveryCountry, 'Delivery country is required')
    ) {
      return;
    }

    // Company
    if (
      !requireIfCompany(companyName, 'Company name is required') ||
      !requireIfCompany(compEmail, 'Email is required') ||
      !requireIfCompany(compInvoiceStreet, 'Invoice street is required') ||
      !requireIfCompany(compInvoiceCity, 'Invoice city is required') ||
      !requireIfCompany(compInvoicePostalCode, 'Invoice postal code is required') ||
      !requireIfCompany(compInvoiceCountry, 'Invoice country is required') ||
      !requireIfCompany(compDeliveryStreet, 'Delivery street is required') ||
      !requireIfCompany(compDeliveryCity, 'Delivery city is required') ||
      !requireIfCompany(compDeliveryPostalCode, 'Delivery postal code is required') ||
      !requireIfCompany(compDeliveryCountry, 'Delivery country is required')
    ) {
      return;
    }

    // --- Build payload ---
    const payload = {
      type: customerType,
      person:
        customerType === 'person'
          ? {
              full_name: fullName,
              email: email || null,
              phone: phone || null,
              invoice_street: invoiceStreet || null,
              invoice_city: invoiceCity || null,
              invoice_postal_code: invoicePostalCode || null,
              invoice_state: invoiceState || null,
              invoice_country: invoiceCountry || null,
              delivery_street: deliveryStreet || null,
              delivery_city: deliveryCity || null,
              delivery_postal_code: deliveryPostalCode || null,
              delivery_state: deliveryState || null,
              delivery_country: deliveryCountry || null,
            }
          : null,
      company:
        customerType === 'company'
          ? {
              company_name: companyName,
              business_id: businessId || null,
              email: compEmail || null,
              phone: compPhone || null,
              invoice_street: compInvoiceStreet || null,
              invoice_city: compInvoiceCity || null,
              invoice_postal_code: compInvoicePostalCode || null,
              invoice_state: compInvoiceState || null,
              invoice_country: compInvoiceCountry || null,
              delivery_street: compDeliveryStreet || null,
              delivery_city: compDeliveryCity || null,
              delivery_postal_code: compDeliveryPostalCode || null,
              delivery_state: compDeliveryState || null,
              delivery_country: compDeliveryCountry || null,
            }
          : null,
    };

    try {
      const resp = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Upstream error');
      }

      resetForm();
      toast.success('New customer created!');
      router.push('/customers');
    } catch (err) {
      console.error(err);
      toast.error(`Error creating customer: ${err.message || err}`);
    }
  };


  const resetForm = () => {
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
  };

  return (
    <div className="flex justify-center items-start min-h-screen py-5">
      
      <div className="w-full max-w-4xl flex items-center gap-4">
        <div className="flex w-full flex-col gap-4">

          {/* Title + buttons */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Add new customer</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.back()}
              >
                &larr; Back
              </button>
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
