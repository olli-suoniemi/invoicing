-- Extensions used by this schema
CREATE EXTENSION IF NOT EXISTS citext;

-- Types
CREATE TYPE invoice_status    AS ENUM ('draft', 'sent', 'paid', 'cancelled');
CREATE TYPE customer_type     AS ENUM ('business', 'individual');  -- NEW

-- companies
CREATE TABLE companies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  business_id   text,
  email         text,
  phone         text,
  website       text,
  iban          text,
  logo_path     text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Address
CREATE TABLE company_addresses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type        text CHECK (type IN ('invoicing','delivery')) NOT NULL,
  address     text NOT NULL,
  postal_code text NOT NULL,
  city        text NOT NULL,
  state       text NOT NULL,
  country     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid text UNIQUE NOT NULL,
  role       text CHECK (role IN ('admin','user')) NOT NULL DEFAULT 'user',
  email      citext UNIQUE NOT NULL,
  first_name text,
  last_name  text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz
);

-- User-Organization roles
CREATE TABLE user_org_roles (
  user_id     uuid REFERENCES users(id)           ON DELETE CASCADE,
  org_id      uuid REFERENCES companies(id)       ON DELETE CASCADE,
  role        text CHECK (role IN ('owner','member')) NOT NULL,
  is_main     boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, org_id)
);

-- customers (supports both businesses and private individuals)
CREATE TABLE customers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type          customer_type NOT NULL DEFAULT 'business',
  name          text NOT NULL,                             -- person full name or company name
  vat_id        text,                                      -- business-only 
  business_id   text,                                      -- business-only
  email         text,
  phone         text,
  company_id    uuid REFERENCES companies(id) ON DELETE SET NULL,
  internal_info text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Customer addresses
CREATE TABLE customer_addresses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type          text CHECK (type IN ('invoicing','delivery')) NOT NULL,
  address       text NOT NULL,
  postal_code   text NOT NULL,
  city          text NOT NULL,
  state         text,
  country       text NOT NULL,
  extra_info    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Products
CREATE SEQUENCE product_number_seq;

CREATE TABLE products (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_number          text UNIQUE NOT NULL DEFAULT lpad(nextval('product_number_seq')::text, 6, '0'),
  name                    text NOT NULL,
  ean_code                text UNIQUE,
  description             text,
  unit_price_vat_excl     numeric(12,2) NOT NULL DEFAULT 0.00,
  unit_price_vat_incl     numeric(12,2) NOT NULL DEFAULT 0.00,
  tax_rate                numeric(5,2) NOT NULL DEFAULT 0.00,
  company_id              uuid REFERENCES companies(id) ON DELETE SET NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- Orders

CREATE SEQUENCE order_number_seq;

CREATE TABLE orders (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number            text UNIQUE NOT NULL DEFAULT to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 4, '0'),
  customer_id             uuid NOT NULL REFERENCES customers(id) ON DELETE SET NULL,
  company_id              uuid REFERENCES companies(id) ON DELETE SET NULL,
  order_date              timestamptz NOT NULL DEFAULT now(),
  total_amount_vat_excl   numeric(12,2) NOT NULL DEFAULT 0.00,
  total_amount_vat_incl   numeric(12,2) NOT NULL DEFAULT 0.00,
  status                  text CHECK (status IN ('pending','completed','cancelled')) NOT NULL DEFAULT 'pending',
  extra_info              text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE order_items (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id              uuid NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  quantity                integer NOT NULL DEFAULT 1,
  unit_price_vat_excl     numeric(12,2) NOT NULL DEFAULT 0.00,
  unit_price_vat_incl     numeric(12,2) NOT NULL DEFAULT 0.00,
  total_price_vat_excl    numeric(12,2) NOT NULL DEFAULT 0.00,
  total_price_vat_incl    numeric(12,2) NOT NULL DEFAULT 0.00,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Invoices
CREATE SEQUENCE invoice_number_seq;

CREATE TABLE invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number  text UNIQUE NOT NULL DEFAULT to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 4, '0'),
  reference       text,
  issue_date      timestamptz NOT NULL DEFAULT now(),
  days_until_due  integer NOT NULL DEFAULT 14,
  due_date        timestamptz NOT NULL,
  status          invoice_status NOT NULL DEFAULT 'draft',
  extra_info      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);  