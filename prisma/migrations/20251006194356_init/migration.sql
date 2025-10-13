-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('CARRIER', 'SHIPPER', 'BOTH');

-- CreateEnum
CREATE TYPE "LoadType" AS ENUM ('FREIGHT', 'AGGREGATE', 'EQUIPMENT', 'MATERIAL', 'WASTE');

-- CreateEnum
CREATE TYPE "RateMode" AS ENUM ('PER_MILE', 'PER_TON', 'PER_YARD', 'PER_TRIP', 'PER_HOUR', 'PER_LOAD', 'DAILY');

-- CreateEnum
CREATE TYPE "LoadStatus" AS ENUM ('DRAFT', 'POSTED', 'ASSIGNED', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "HaulType" AS ENUM ('METRO', 'REGIONAL', 'OTR');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RATE_CON', 'BOL', 'POD', 'SCALE_TICKET', 'PERMIT', 'INSURANCE_COI', 'DRIVER_LICENSE');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "mcNumber" TEXT,
    "dotNumber" TEXT,
    "ein" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "metadata" JSONB,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "policy_number" TEXT NOT NULL,
    "coverage_amount" DECIMAL(12,2) NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "document_url" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loads" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "shipper_id" TEXT NOT NULL,
    "carrier_id" TEXT,
    "load_type" "LoadType" NOT NULL,
    "rate_mode" "RateMode" NOT NULL,
    "haul_type" "HaulType" NOT NULL,
    "commodity" TEXT NOT NULL,
    "equipment_type" TEXT NOT NULL,
    "equipment_match_tier" TEXT,
    "override_reason" TEXT,
    "origin" JSONB NOT NULL,
    "destination" JSONB NOT NULL,
    "rate" DECIMAL(10,2) NOT NULL,
    "units" DECIMAL(10,2),
    "miles" INTEGER,
    "deadhead" INTEGER,
    "hourly_minimum" DECIMAL(5,2),
    "dump_fee" DECIMAL(10,2),
    "fuel_surcharge" DECIMAL(10,2),
    "tolls" DECIMAL(10,2),
    "accessorials" JSONB,
    "gross_revenue" DECIMAL(10,2) NOT NULL,
    "pickup_date" TIMESTAMP(3) NOT NULL,
    "pickup_eta" TIMESTAMP(3),
    "delivery_date" TIMESTAMP(3) NOT NULL,
    "delivery_eta" TIMESTAMP(3),
    "job_code" TEXT,
    "po_number" TEXT,
    "project_name" TEXT,
    "overweight_permit" BOOLEAN NOT NULL DEFAULT false,
    "prevailing_wage" BOOLEAN NOT NULL DEFAULT false,
    "public_project" BOOLEAN NOT NULL DEFAULT false,
    "requires_escort" BOOLEAN NOT NULL DEFAULT false,
    "status" "LoadStatus" NOT NULL,
    "notes" TEXT,
    "internal_notes" TEXT,
    "cycle_count" INTEGER,
    "zone_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "loads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "load_id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "checksum_sha256" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scale_tickets" (
    "id" TEXT NOT NULL,
    "load_id" TEXT NOT NULL,
    "tare_weight" DECIMAL(10,2) NOT NULL,
    "gross_weight" DECIMAL(10,2) NOT NULL,
    "net_tonnage" DECIMAL(10,2) NOT NULL,
    "ticket_number" TEXT NOT NULL,
    "scale_name" TEXT NOT NULL,
    "scale_location" TEXT,
    "weighed_at" TIMESTAMP(3) NOT NULL,
    "image_url" TEXT,
    "ocr_data" JSONB,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scale_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "optimalFor" JSONB NOT NULL,
    "acceptableFor" JSONB,
    "match_tier_rules" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "equipment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_mode_configs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "typical_use_cases" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rate_mode_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_rules" (
    "id" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metro_area" TEXT,
    "boundaries" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "load_interests" (
    "id" TEXT NOT NULL,
    "load_id" TEXT NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "load_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signature_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_mcNumber_key" ON "organizations"("mcNumber");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_dotNumber_key" ON "organizations"("dotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_types_name_key" ON "equipment_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rate_mode_configs_code_key" ON "rate_mode_configs"("code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance" ADD CONSTRAINT "insurance_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_shipper_id_fkey" FOREIGN KEY ("shipper_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_load_id_fkey" FOREIGN KEY ("load_id") REFERENCES "loads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_tickets" ADD CONSTRAINT "scale_tickets_load_id_fkey" FOREIGN KEY ("load_id") REFERENCES "loads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_interests" ADD CONSTRAINT "load_interests_load_id_fkey" FOREIGN KEY ("load_id") REFERENCES "loads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_interests" ADD CONSTRAINT "load_interests_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
