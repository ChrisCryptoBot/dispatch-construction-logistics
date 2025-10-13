-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_tickets ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own org
CREATE POLICY org_isolation ON organizations
  USING (id = current_setting('app.current_org_id', true)::uuid);

-- Users: Can only see users in their org
CREATE POLICY user_isolation ON users
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Loads: Can see loads where you're shipper or carrier
CREATE POLICY load_access ON loads
  USING (
    shipper_id = current_setting('app.current_org_id', true)::uuid 
    OR carrier_id = current_setting('app.current_org_id', true)::uuid
  );

-- Documents: Can only see documents for loads you have access to
CREATE POLICY document_access ON documents
  USING (
    load_id IN (
      SELECT id FROM loads 
      WHERE shipper_id = current_setting('app.current_org_id', true)::uuid
      OR carrier_id = current_setting('app.current_org_id', true)::uuid
    )
  );

-- Scale tickets: Same as documents
CREATE POLICY scale_ticket_access ON scale_tickets
  USING (
    load_id IN (
      SELECT id FROM loads 
      WHERE shipper_id = current_setting('app.current_org_id', true)::uuid
      OR carrier_id = current_setting('app.current_org_id', true)::uuid
    )
  );
