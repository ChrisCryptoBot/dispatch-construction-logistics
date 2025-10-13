-- Add load_interests table for carrier interest tracking
CREATE TABLE load_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_load_interests_load ON load_interests(load_id);
CREATE INDEX idx_load_interests_carrier ON load_interests(carrier_id);
CREATE INDEX idx_load_interests_status ON load_interests(status);

-- Enable RLS on load_interests
ALTER TABLE load_interests ENABLE ROW LEVEL SECURITY;

-- RLS policy: carriers can only see their own interests
CREATE POLICY load_interests_isolation ON load_interests
  USING (carrier_id = current_setting('app.current_org_id', true)::uuid);

