-- Helper function to allocate the next invoice number when moving to 'sent'
CREATE OR REPLACE FUNCTION allocate_invoice_number(p_invoice_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_org uuid; v_year int; v_seq int; v_prefix text;
BEGIN
  SELECT org_id, fiscal_year INTO v_org, v_year FROM invoices WHERE id = p_invoice_id FOR UPDATE;
  SELECT invoice_prefix INTO v_prefix FROM org_settings WHERE org_id = v_org;

  INSERT INTO invoice_number_counters(org_id, fiscal_year, next_number)
  VALUES (v_org, v_year, 1)
  ON CONFLICT (org_id, fiscal_year) DO NOTHING;

  UPDATE invoice_number_counters
     SET next_number = next_number + 1
   WHERE org_id = v_org AND fiscal_year = v_year
   RETURNING next_number - 1 INTO v_seq;

  UPDATE invoices
     SET number_seq = v_seq,
         number_str = format('%s-%s-%04s', COALESCE(v_prefix,'INV'), v_year, v_seq)
   WHERE id = p_invoice_id;
END $$;

-- Trigger: on status change to 'sent', allocate number if missing
CREATE OR REPLACE FUNCTION trg_invoices_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'sent' AND (NEW.number_seq IS NULL OR NEW.number_str IS NULL) THEN
    PERFORM allocate_invoice_number(NEW.id);
    -- reload NEW values
    SELECT number_seq, number_str INTO NEW.number_seq, NEW.number_str FROM invoices WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER invoices_status_alloc
BEFORE UPDATE ON invoices
FOR EACH ROW
WHEN (OLD.status <> NEW.status)
EXECUTE FUNCTION trg_invoices_status();
