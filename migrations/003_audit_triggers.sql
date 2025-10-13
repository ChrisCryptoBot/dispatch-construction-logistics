-- Prevent modification of audit events
CREATE OR REPLACE FUNCTION prevent_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Modification of audit events is not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_modification
  BEFORE UPDATE OR DELETE ON audit_events
  FOR EACH ROW EXECUTE FUNCTION prevent_modification();

-- Auto-generate signature hash
CREATE OR REPLACE FUNCTION generate_signature_hash()
RETURNS TRIGGER AS $$
BEGIN
  NEW.signature_hash = encode(
    digest(
      NEW.event_type || NEW.entity_type || NEW.entity_id || NEW.payload::text || NEW.created_at::text,
      'sha256'
    ),
    'hex'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_audit_signature
  BEFORE INSERT ON audit_events
  FOR EACH ROW EXECUTE FUNCTION generate_signature_hash();
