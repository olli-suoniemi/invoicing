// services/invoices/repository.js
import { sql } from "../../util/databaseConnect.js";

export async function getCustomerById(id) {
  const rows = await sql`select * from customers where id = ${id} limit 1`;
  return rows[0] ?? null;
}

export async function listCompanyCustomersById(companyId, limit = 50) {
  const rows = await sql`
    select * from customers
    where company_id = ${companyId}
    order by created_at desc
    limit ${limit}
  `;
  return rows ?? [];
}

export async function createCustomer(customer) {
  // Create new address record
  const result = await sql`
    insert into customers (type, name, business_id, email, phone, company_id, internal_info, created_at)
    values (${customer.type}, ${customer.name}, ${customer.business_id ?? null}, ${customer.email}, ${customer.phone}, ${customer.company_id}, ${customer.internal_info ?? null}, now())
    returning *
  `;
  return result[0];
}

export async function createCustomerAddress(customerId, address) { 
  const result = await sql`
    insert into customer_addresses (customer_id, type, address, postal_code, city, state, country, extra_info, created_at)
    values (${customerId}, ${address.type}, ${address.street}, ${address.postal_code}, ${address.city}, ${address.state}, ${address.country}, ${address.extra_info ?? null}, now())
    returning *
  `;
  return result[0];
}

export async function listCustomerAddressesById(customerId) {
  const rows = await sql`
    select * from customer_addresses
    where customer_id = ${customerId}
    order by created_at desc
  `;
  return rows ?? [];
}

export async function updateCustomer(customerId, customerData) {
  // update customer
  const result = await sql`
    update customers
    set
      type = ${customerData.type},
      name = ${customerData.name},
      business_id = ${customerData.business_id ?? null},
      email = ${customerData.email},
      phone = ${customerData.phone},
      company_id = ${customerData.company_id},
      internal_info = ${customerData.internal_info ?? null},
      updated_at = now()
    where id = ${customerId}
    returning *
  `;

  // update addresses 
  const addr = customerData.addresses || [];
  for (const address of addr) {
    await sql`
      update customer_addresses
      set
        type = ${address.type},
        address = ${address.address},
        postal_code = ${address.postal_code},
        city = ${address.city},
        state = ${address.state},
        country = ${address.country},
        extra_info = ${address.extra_info ?? null},
        updated_at = now()
      where id = ${address.id} and customer_id = ${customerId}
    `;
  }

  const address = await listCustomerAddressesById(customerId);
  return { ...result[0], addresses: address };
}