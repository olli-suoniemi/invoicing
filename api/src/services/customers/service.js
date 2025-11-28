// services/customers/service.js
import * as repo from "./repository.js";
import { canReadCustomer } from "./policy.js";
import { ForbiddenError } from "../../util/errors.js";

export async function listCompanyCustomersById(id) {
  const customers = await repo.listCompanyCustomersById(id, 100);
  return customers;
};

export async function getCustomerById(user, company, customerId) {
  // check if user has access to the customer
  const customer = await repo.getCustomerById(customerId);
  if (!customer || !canReadCustomer(user, company, customer)) {
    throw new ForbiddenError('Customer not found or access denied');
  }

  // fetch addresses
  const addresses = await repo.listCustomerAddressesById(customerId);
  customer.addresses = addresses;
  return customer;
}

export async function createCustomer(company, customerData) {
  let newCustomer;
  if (customerData.type === 'company') {
    newCustomer = {
      type: 'business',
      name: customerData.company.company_name,
      business_id: customerData.company.business_id,
      email: customerData.company.email,
      phone: customerData.company.phone,
      internal_info: customerData.company.internal_info,
    }
  } else {
    newCustomer = {
      type: 'individual',
      name: customerData.person.full_name,
      email: customerData.person.email,
      phone: customerData.person.phone,
      internal_info: customerData.person.internal_info,
    }
  }

  const customer = await repo.createCustomer({company_id: company.org_id, ...newCustomer});

  const invoicingAddress = {
      type: 'invoicing',
      street: customerData.person ? customerData.person.invoice_street : customerData.company.invoice_street,
      city: customerData.person ? customerData.person.invoice_city : customerData.company.invoice_city,
      postal_code: customerData.person ? customerData.person.invoice_postal_code : customerData.company.invoice_postal_code,
      state: customerData.person ? customerData.person.invoice_state : customerData.company.invoice_state,
      country: customerData.person ? customerData.person.invoice_country : customerData.company.invoice_country,
      extra_info: customerData.person ? customerData.person.invoice_extra_info : customerData.company.invoice_extra_info,
  }

  const deliveryAddress = {
      type: 'delivery',
      street: customerData.person ? customerData.person.delivery_street : customerData.company.delivery_street,
      city: customerData.person ? customerData.person.delivery_city : customerData.company.delivery_city,
      postal_code: customerData.person ? customerData.person.delivery_postal_code : customerData.company.delivery_postal_code,
      state: customerData.person ? customerData.person.delivery_state : customerData.company.delivery_state,
      country: customerData.person ? customerData.person.delivery_country : customerData.company.delivery_country,
      extra_info: customerData.person ? customerData.person.delivery_extra_info : customerData.company.delivery_extra_info,
  };

  // create addresses
  if (invoicingAddress.street) {
    await repo.createCustomerAddress(customer.id, invoicingAddress);
  }

  if (deliveryAddress.street) {
    await repo.createCustomerAddress(customer.id, deliveryAddress);
  }

  return customer;
}

export async function updateCustomer(customerId, customerData) {
  const updatedCustomer = await repo.updateCustomer(customerId, customerData);
  return updatedCustomer;
}