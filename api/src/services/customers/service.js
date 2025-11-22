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