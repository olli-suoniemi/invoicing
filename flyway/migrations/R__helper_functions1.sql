CREATE OR REPLACE FUNCTION recompute_invoice_totals(p_invoice_id uuid)
RETURNS TABLE(subtotal numeric, vat numeric, total numeric) LANGUAGE sql AS $$
  SELECT
    COALESCE(SUM( (quantity * unit_price) * (1 - discount_pct/100.0) ),0)::numeric(12,2)      AS subtotal,
    COALESCE(SUM( (quantity * unit_price) * (1 - discount_pct/100.0) * (vat_rate_pct/100.0) ),0)::numeric(12,2) AS vat,
    COALESCE(SUM( (quantity * unit_price) * (1 - discount_pct/100.0) * (1 + vat_rate_pct/100.0) ),0)::numeric(12,2) AS total
  FROM invoice_items
  WHERE invoice_id = p_invoice_id;
$$;

CREATE OR REPLACE FUNCTION trg_invoices_totals()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_sub numeric; v_vat numeric; v_tot numeric;
BEGIN
  SELECT subtotal, vat, total INTO v_sub, v_vat, v_tot FROM recompute_invoice_totals(NEW.id);
  NEW.subtotal_ex_vat := v_sub;
  NEW.total_vat       := v_vat;
  NEW.total_amount    := v_tot;
  RETURN NEW;
END $$;

-- Recompute totals whenever invoice or its items change
CREATE TRIGGER invoices_totals_before
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION trg_invoices_totals();

CREATE OR REPLACE FUNCTION trg_items_touch_invoice()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE invoices SET updated_at = now() WHERE id = NEW.invoice_id;
  RETURN NEW;
END $$;

CREATE TRIGGER items_touch_invoice
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW EXECUTE FUNCTION trg_items_touch_invoice();
