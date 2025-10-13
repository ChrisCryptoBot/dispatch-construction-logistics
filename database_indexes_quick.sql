-- Quick production indexes (no transaction block for CONCURRENT)
-- Run these one at a time for existing tables only

-- ============================================================================
-- LOAD INDEXES (Critical for performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_loads_shipper_status 
ON loads(shipper_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_loads_carrier_status 
ON loads(carrier_id, status, pickup_date ASC) 
WHERE carrier_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_loads_status_pickup 
ON loads(status, pickup_date ASC, created_at DESC)
WHERE status IN ('POSTED', 'AVAILABLE');

CREATE INDEX IF NOT EXISTS idx_loads_search 
ON loads(status, haul_type, equipment_type, pickup_date);

CREATE INDEX IF NOT EXISTS idx_loads_pickup_date 
ON loads(pickup_date, status);

CREATE INDEX IF NOT EXISTS idx_loads_delivery_date 
ON loads(delivery_date, status);

CREATE INDEX IF NOT EXISTS idx_loads_created_at 
ON loads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_loads_updated_at 
ON loads(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_loads_completed_at 
ON loads(completed_at DESC) 
WHERE completed_at IS NOT NULL;

-- ============================================================================
-- USER & ORGANIZATION INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_org_active 
ON users(org_id, active, role);

CREATE INDEX IF NOT EXISTS idx_users_email_active 
ON users(email, active);

CREATE INDEX IF NOT EXISTS idx_orgs_type_verified 
ON organizations(type, verified, active);

CREATE INDEX IF NOT EXISTS idx_orgs_mc_number 
ON organizations(mc_number) 
WHERE mc_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orgs_dot_number 
ON organizations(dot_number) 
WHERE dot_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orgs_fmcsa_status 
ON organizations(fmcsa_verified, fmcsa_last_checked);

-- ============================================================================
-- LOAD RELATIONSHIPS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_load_interests_load 
ON load_interests(load_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_load_interests_carrier 
ON load_interests(carrier_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_load 
ON documents(load_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_type 
ON documents(document_type, uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_scale_tickets_load 
ON scale_tickets(load_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scale_tickets_approved 
ON scale_tickets(approved, created_at DESC);

-- ============================================================================
-- COMPLIANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_insurance_org_expiry 
ON insurance(org_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_insurance_active 
ON insurance(active, expires_at);

CREATE INDEX IF NOT EXISTS idx_compliance_rules_type 
ON compliance_rules(rule_type, active, priority DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_rules_scope 
ON compliance_rules(scope, active);

-- ============================================================================
-- AUDIT
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_events_entity 
ON audit_events(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_user 
ON audit_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp 
ON audit_events(created_at DESC);

-- ============================================================================
-- ANALYTICS
-- ============================================================================

ANALYZE loads;
ANALYZE users;
ANALYZE organizations;
ANALYZE load_interests;
ANALYZE documents;
ANALYZE scale_tickets;
ANALYZE insurance;
ANALYZE audit_events;
ANALYZE compliance_rules;

-- Show created indexes
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('loads', 'users', 'organizations')
ORDER BY tablename, indexname;

