
CREATE OR REPLACE FUNCTION fi_ref_checksum(base text)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $$
DECLARE
  digits text := regexp_replace(base, '\D', '', 'g'); -- keep only 0–9
  len    integer := length(digits);
  weights integer[] := ARRAY[7, 3, 1];
  idx    integer := 1;
  i      integer;
  d      integer;
  s      integer := 0;
BEGIN
  IF len < 1 THEN
    RAISE EXCEPTION 'Base for Finnish reference must contain at least one digit';
  END IF;

  -- walk from right to left
  FOR i IN REVERSE len..1 LOOP
    d := substr(digits, i, 1)::int;
    s := s + d * weights[idx];
    idx := idx + 1;
    IF idx > 3 THEN
      idx := 1;
    END IF;
  END LOOP;

  s := s % 10;
  IF s = 0 THEN
    RETURN 0;
  ELSE
    RETURN 10 - s;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fi_make_reference(base text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $$
DECLARE
  digits text := regexp_replace(base, '\D', '', 'g');
  c      integer;
BEGIN
  -- 3–19 base digits → 4–20 digits including checksum
  IF length(digits) < 3 OR length(digits) > 19 THEN
    RAISE EXCEPTION 'Finnish reference base must be 3–19 digits, got %', length(digits);
  END IF;

  c := fi_ref_checksum(digits);
  RETURN digits || c::text;
END;
$$;

CREATE OR REPLACE FUNCTION fi_ref_is_valid(ref text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $$
DECLARE
  digits          text := regexp_replace(ref, '\D', '', 'g');
  len             integer := length(digits);
  base            text;
  given_checksum  integer;
  expected_checksum integer;
BEGIN
  -- Full reference (incl. checksum) must be 4–20 digits
  IF len < 4 OR len > 20 THEN
    RETURN FALSE;
  END IF;

  -- Separate base and checksum digit
  base := substr(digits, 1, len - 1);
  given_checksum := substr(digits, len, 1)::int;

  -- Compare with recomputed checksum
  expected_checksum := fi_ref_checksum(base);

  RETURN given_checksum = expected_checksum;
END;
$$;


CREATE OR REPLACE FUNCTION set_invoice_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  must_be_manual boolean;
BEGIN
  SELECT require_manual_reference
  INTO must_be_manual
  FROM customers
  WHERE id = NEW.customer_id;

  IF NOT must_be_manual
     AND (NEW.reference IS NULL OR btrim(NEW.reference) = '') THEN
    NEW.reference := fi_make_reference(NEW.invoice_number);
  END IF;

  RETURN NEW;
END;
$$;


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
  -- the role is not currently used, but reserved for future use
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
  require_manual_reference boolean NOT NULL DEFAULT false,
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
  order_date              date NOT NULL DEFAULT current_date,
  total_amount_vat_excl   numeric(12,2) NOT NULL DEFAULT 0.00,
  total_amount_vat_incl   numeric(12,2) NOT NULL DEFAULT 0.00,
  status                  text CHECK (status IN ('draft','completed','cancelled')) NOT NULL DEFAULT 'draft',
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
  tax_rate                numeric(5,2) NOT NULL DEFAULT 0.00,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- Invoices
CREATE SEQUENCE invoice_number_seq;

CREATE TABLE invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id     uuid NOT NULL REFERENCES customers(id) ON DELETE SET NULL,
  company_id      uuid REFERENCES companies(id) ON DELETE SET NULL,
  invoice_number  text UNIQUE NOT NULL DEFAULT to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 4, '0'),
  reference       text UNIQUE,
  issue_date      date NOT NULL DEFAULT current_date,
  days_until_due  integer NOT NULL DEFAULT 14,
  due_date        date NOT NULL DEFAULT (current_date + INTERVAL '14 days'),
  delivery_date   date DEFAULT current_date,
  status          invoice_status NOT NULL DEFAULT 'draft',
  extra_info      text,
  show_info_on_invoice boolean NOT NULL DEFAULT false,
  paid            boolean NOT NULL DEFAULT false,
  paid_date       date,
  total_amount_vat_excl   numeric(12,2) NOT NULL DEFAULT 0.00,
  total_amount_vat_incl   numeric(12,2) NOT NULL DEFAULT 0.00,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);  

ALTER TABLE invoices
  ADD CONSTRAINT invoices_reference_format
    CHECK (reference IS NULL OR reference ~ '^[0-9]{4,20}$');

ALTER TABLE invoices
  ADD CONSTRAINT invoices_reference_valid
    CHECK (reference IS NULL OR fi_ref_is_valid(reference));


CREATE TRIGGER set_invoice_reference_before_insert
BEFORE INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION set_invoice_reference();

CREATE TRIGGER set_invoice_reference_before_ins_upd
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION set_invoice_reference();