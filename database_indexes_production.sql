-- ============================================================================
-- PRODUCTION DATABASE INDEXES FOR 10,000+ USER SCALE
-- ============================================================================
-- Run this file BEFORE going to production
-- Estimated execution time: 5-15 minutes depending on data size
--
-- Usage: psql $DATABASE_URL < database_indexes_production.sql
-- ============================================================================

-- Start transaction (indexes will be created concurrently, so no locks)
BEGIN;

-- ============================================================================
-- CRITICAL INDEXES - Load Performance
-- ============================================================================

-- Most common query: Get loads for a shipper with status filter
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loads_shipper_status 
ON loads(shipper_id, status, created_at DESC);

-- Most common query: Get loads assigned to a carrier
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loads_carrier_status 
ON loads(carrier_id, status, pickup_date ASC) 
WHERE carrier_id IS NOT NULL;

-- Load board query: Available loads by pickup date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loads_status_pickup 
ON loads(status, pickup_date ASC, created_at DESC)
WHERE status IN ('POSTED', 'AVAILABLE');

-- Load search with multiple filters
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loads_search 
ON loads(status, haul_type, equipment_type, pickup_date);

-- Load tracking by date range
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loads_pickup_date 
ON loads(pickup_date, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loads_delivery_date 
ON loads(delivery_date, status);

-- Recent activity queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loads_created_at 
ON loads(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loads_updated_at 
ON loads(updated_at DESC);

-- Completed loads for analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loads_completed_at 
ON loads(completed_at DESC) 
WHERE completed_at IS NOT NULL;

-- ============================================================================
-- USER & ORGANIZATION INDEXES
-- ============================================================================

-- User lookup by organization (most common)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_org_active 
ON users(org_id, active, role);

-- User email login (already unique, but add for performance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active 
ON users(email, active);

-- Organization search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orgs_type_verified 
ON organizations(type, verified, active);

-- MC/DOT number lookups (carrier verification)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orgs_mc_number 
ON organizations(mc_number) 
WHERE mc_number IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orgs_dot_number 
ON organizations(dot_number) 
WHERE dot_number IS NOT NULL;

-- FMCSA verification status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orgs_fmcsa_status 
ON organizations(fmcsa_verified, fmcsa_last_checked);

-- ============================================================================
-- LOAD RELATIONSHIPS INDEXES
-- ============================================================================

-- Load interests (carrier bids)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_load_interests_load 
ON load_interests(load_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_load_interests_carrier 
ON load_interests(carrier_id, status, created_at DESC);

-- Documents per load
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_load 
ON documents(load_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_type 
ON documents(document_type, uploaded_at DESC);

-- Scale tickets per load
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scale_tickets_load 
ON scale_tickets(load_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scale_tickets_approved 
ON scale_tickets(approved, created_at DESC);

-- ============================================================================
-- PAYMENT & BILLING INDEXES
-- ============================================================================

-- Payment method lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_methods_org 
ON payment_methods(org_id, is_default, active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_methods_type 
ON payment_methods(type, active);

-- Invoice queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_shipper 
ON invoices(shipper_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_load 
ON invoices(load_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_status_date 
ON invoices(status, due_date);

-- Payment processing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_stripe_intent 
ON invoices(stripe_payment_intent_id) 
WHERE stripe_payment_intent_id IS NOT NULL;

-- ============================================================================
-- COMPLIANCE & VERIFICATION INDEXES
-- ============================================================================

-- Insurance tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insurance_org_expiry 
ON insurance(org_id, expires_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insurance_active 
ON insurance(active, expires_at);

-- Email verification
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_verifications_user 
ON email_verifications(user_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_verifications_token 
ON email_verifications(verification_token) 
WHERE status = 'PENDING';

-- Compliance rules
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_rules_type 
ON compliance_rules(rule_type, active, priority DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_rules_scope 
ON compliance_rules(scope, active);

-- ============================================================================
-- FLEET & DRIVER MANAGEMENT INDEXES
-- ============================================================================

-- Drivers per organization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_org_active 
ON drivers(org_id, active, status);

-- Driver availability
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_available 
ON drivers(status, active) 
WHERE active = true;

-- Fleet equipment
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fleet_equipment_org 
ON fleet_equipment(org_id, active, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fleet_equipment_type 
ON fleet_equipment(equipment_type, active);

-- ============================================================================
-- TRACKING & REAL-TIME DATA INDEXES
-- ============================================================================

-- Geo events (location tracking)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_geo_events_load 
ON geo_events(load_id, event_timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_geo_events_driver 
ON geo_events(driver_id, event_timestamp DESC);

-- Driver notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_driver_notifications_driver 
ON driver_notifications(driver_id, read, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_driver_notifications_load 
ON driver_notifications(load_id, created_at DESC);

-- ============================================================================
-- AUDIT & HISTORY INDEXES
-- ============================================================================

-- Audit events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_events_entity 
ON audit_events(entity_type, entity_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_events_user 
ON audit_events(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_events_timestamp 
ON audit_events(created_at DESC);

-- ============================================================================
-- FULL-TEXT SEARCH INDEXES (Optional - PostgreSQL native)
-- ============================================================================

-- If you don't use Elasticsearch, enable these for search:

-- Search loads by commodity
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loads_commodity_search 
ON loads USING gin(to_tsvector('english', commodity));

-- Search organizations by name
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orgs_name_search 
ON organizations USING gin(to_tsvector('english', name));

-- ============================================================================
-- PARTIAL INDEXES FOR COMMON FILTERS
-- ============================================================================

-- Active loads only (most queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loads_active 
ON loads(status, created_at DESC) 
WHERE status NOT IN ('COMPLETED', 'CANCELLED', 'ARCHIVED');

-- Unpaid invoices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_unpaid 
ON invoices(shipper_id, due_date) 
WHERE status IN ('PENDING', 'OVERDUE');

-- Pending email verifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_verifications_pending 
ON email_verifications(user_id, created_at DESC) 
WHERE status = 'PENDING';

-- ============================================================================
-- COMPOSITE INDEXES FOR ANALYTICS
-- ============================================================================

-- Revenue analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loads_revenue_analytics 
ON loads(shipper_id, status, completed_at, gross_revenue) 
WHERE status = 'COMPLETED';

-- Carrier performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loads_carrier_performance 
ON loads(carrier_id, status, completed_at) 
WHERE carrier_id IS NOT NULL;

-- ============================================================================
-- ZONE & GEOGRAPHY INDEXES
-- ============================================================================

-- Zone lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zones_active 
ON zones(active, type);

-- Load commodities
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_load_commodities_load 
ON load_commodities(load_id);

-- ============================================================================
-- VERIFY INDEXES CREATED
-- ============================================================================

COMMIT;

-- Show all indexes on loads table (for verification)
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'loads'
ORDER BY indexname;

-- Show table sizes with indexes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size_with_indexes,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- ============================================================================
-- POST-INDEX MAINTENANCE
-- ============================================================================

-- Analyze tables to update statistics
ANALYZE loads;
ANALYZE users;
ANALYZE organizations;
ANALYZE load_interests;
ANALYZE documents;
ANALYZE scale_tickets;
ANALYZE invoices;
ANALYZE fleet_equipment;
ANALYZE drivers;

-- ============================================================================
-- PERFORMANCE MONITORING QUERIES
-- ============================================================================

-- Check for missing indexes (run after a few days in production)
-- This query shows which indexes might be needed:
/*
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / seq_scan AS avg_seq_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;
*/

-- Check index usage (find unused indexes to remove)
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
*/

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. CONCURRENTLY keyword prevents table locks during index creation
-- 2. Partial indexes (WHERE clauses) are smaller and faster for common filters
-- 3. Composite indexes order matters: most selective column first
-- 4. Monitor pg_stat_user_indexes after deployment to verify usage
-- 5. Run VACUUM ANALYZE periodically to keep statistics fresh
-- 6. Consider pg_stat_statements extension for query performance monitoring
-- ============================================================================

