-- AlterTable
ALTER TABLE "load_interests" ADD COLUMN     "bid_amount" DECIMAL(10,2),
ADD COLUMN     "expires_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "job_sites" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "site_name" TEXT NOT NULL,
    "address" JSONB NOT NULL,
    "contactInfo" JSONB,
    "gate_instructions" TEXT,
    "accessHours" JSONB,
    "special_requirements" TEXT,
    "total_loads" INTEGER NOT NULL DEFAULT 0,
    "avg_wait_time" INTEGER,
    "total_tonnage" DECIMAL(12,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferred_carriers" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "rating" INTEGER,
    "notes" TEXT,
    "auto_assign" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferred_carriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrier_equipment" (
    "id" TEXT NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "equipment_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "capacity" JSONB,
    "vin" TEXT,
    "license_plate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carrier_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrier_profiles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "operating_radius" INTEGER,
    "metroZones" JSONB,
    "otrLanes" JSONB,
    "max_distance" INTEGER,
    "rateMinimums" JSONB,
    "on_time_rate" DECIMAL(5,2),
    "doc_accuracy_rate" DECIMAL(5,2),
    "reputation_score" INTEGER,
    "tier" TEXT DEFAULT 'BRONZE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carrier_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "preferred_carriers_customer_id_carrier_id_key" ON "preferred_carriers"("customer_id", "carrier_id");

-- CreateIndex
CREATE UNIQUE INDEX "carrier_profiles_organization_id_key" ON "carrier_profiles"("organization_id");
