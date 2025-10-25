-- Extensions used by this schema
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Types
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'cancelled');
CREATE TYPE client_type    AS ENUM ('business', 'individual');  -- NEW

-- companies
CREATE TABLE companies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  business_id   text,
  email         text,
  phone         text,
  website       text,
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
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid text UNIQUE NOT NULL,
  role       text CHECK (role IN ('admin','user')) NOT NULL DEFAULT 'user',
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  email      citext UNIQUE NOT NULL,
  first_name text,
  last_name  text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz
);

CREATE TABLE user_org_roles (
  user_id     uuid REFERENCES users(id)           ON DELETE CASCADE,
  org_id      uuid REFERENCES companies(id)   ON DELETE CASCADE,
  role        text CHECK (role IN ('owner','member')) NOT NULL,
  PRIMARY KEY (user_id, org_id)
);

-- Clients (supports both businesses and private individuals)
CREATE TABLE clients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type          client_type NOT NULL DEFAULT 'business',   -- NEW
  name          text NOT NULL,                             -- person full name or company name
  vat_id        text,                                      -- business-only (usually)
  business_id   text,                                      -- business-only (e.g., Y-tunnus)
  email         text,
  address       text,
  postal_code   text,
  city          text,
  country       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  -- At least one way to contact/deliver: email OR full postal address
  CONSTRAINT clients_contact_presence_chk CHECK (
    email IS NOT NULL
    OR (address IS NOT NULL AND postal_code IS NOT NULL AND city IS NOT NULL AND country IS NOT NULL)
  ),
  -- Optional guard: if marked as individual, prevent accidental storage of business-only IDs
  CONSTRAINT clients_individual_no_business_ids_chk CHECK (
    NOT (type = 'individual' AND (vat_id IS NOT NULL OR business_id IS NOT NULL))
  )
);

CREATE INDEX idx_clients_org        ON clients(org_id);
CREATE INDEX idx_clients_name_trgm  ON clients USING gin (name gin_trgm_ops);

-- Invoice numbering counters (per org + fiscal year)
CREATE TABLE invoice_number_counters (
  org_id       uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  fiscal_year  int  NOT NULL,
  next_number  int  NOT NULL CHECK (next_number > 0),
  PRIMARY KEY (org_id, fiscal_year)
);

-- Invoices
CREATE TABLE invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id       uuid NOT NULL REFERENCES clients(id),
  status          invoice_status NOT NULL DEFAULT 'draft',
  issue_date      date NOT NULL DEFAULT current_date,
  due_date        date,
  currency        char(3) NOT NULL,
  -- Numbering parts
  fiscal_year     int  NOT NULL,
  number_seq      int,                         -- set when status becomes 'sent'
  number_str      text UNIQUE,                 -- e.g. "ACME-2025-0042"
  -- Totals (denormalized, validated by trigger in app or DB)
  subtotal_ex_vat numeric(12,2) NOT NULL DEFAULT 0,
  total_vat       numeric(12,2) NOT NULL DEFAULT 0,
  total_amount    numeric(12,2) NOT NULL DEFAULT 0,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoices_org_fy_unique UNIQUE (org_id, fiscal_year, number_seq)
);

CREATE INDEX idx_invoices_org_status ON invoices(org_id, status);
CREATE INDEX idx_invoices_client     ON invoices(client_id);

-- Invoice items
CREATE TABLE invoice_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_no       int  NOT NULL,
  description   text NOT NULL,
  quantity      numeric(12,3) NOT NULL CHECK (quantity > 0),
  unit          text DEFAULT 'pcs',
  unit_price    numeric(12,2) NOT NULL CHECK (unit_price >= 0), -- excl. VAT
  vat_rate_pct  numeric(5,2)  NOT NULL CHECK (vat_rate_pct >= 0 AND vat_rate_pct <= 100),
  discount_pct  numeric(5,2)  NOT NULL DEFAULT 0 CHECK (discount_pct >= 0 AND discount_pct <= 100),
  CONSTRAINT invoice_items_line_unique UNIQUE (invoice_id, line_no)
);

-- Payments (optional)
CREATE TABLE payments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  paid_at      date NOT NULL,
  amount       numeric(12,2) NOT NULL CHECK (amount > 0),
  method       text, -- e.g. bank transfer
  reference    text
);

-- Email & PDF artifacts
CREATE TABLE email_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   uuid REFERENCES invoices(id) ON DELETE SET NULL,
  org_id       uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  to_address   text NOT NULL,
  subject      text NOT NULL,
  provider     text NOT NULL,           -- e.g. "Forward Email"
  message_id   text,
  status       text,                    -- accepted, delivered, bounced...
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE pdf_assets (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id     uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  content_sha256 bytea NOT NULL,
  storage_path   text NOT NULL,          -- where the file is stored
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pdf_assets_unique_per_invoice UNIQUE (invoice_id, content_sha256)
);

-- Audit log
CREATE TABLE audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  actor_user  uuid REFERENCES users(id),
  entity_type text NOT NULL,            -- e.g. 'invoice','client'
  entity_id   uuid NOT NULL,
  action      text NOT NULL,            -- e.g. 'create','update','status_change'
  diff_json   jsonb,                    -- optional before/after
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_org_entity ON audit_logs(org_id, entity_type, entity_id);

-- Settings per org (defaults, VAT %, numbering prefix, etc.)
CREATE TABLE org_settings (
  org_id          uuid PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  invoice_prefix  text DEFAULT 'INV',
  default_vat_pct numeric(5,2) DEFAULT 25.5,
  payment_terms   text,                 -- e.g. "14 days net"
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
