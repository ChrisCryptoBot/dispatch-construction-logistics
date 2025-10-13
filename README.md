# Dispatch Construction Logistics Platform

A carrier-first construction logistics OS that handles aggregates, concrete, equipment transport, and site services with biometric-free verification and one-tap Universal Booking.

## 🏗️ Architecture Overview

- **Primary Focus**: Metro/zone-based construction work (80% volume)
- **Secondary Support**: OTR when needed (20% volume)
- **Database**: PostgreSQL 14+ with Row-Level Security (RLS)
- **Multi-tenancy**: Shared tables with org_id + RLS policies
- **Audit**: Immutable event logging with signature hashes
- **Compliance**: Database-driven rules engine

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for sessions)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp env.example .env
# Edit .env with your database credentials

# 3. Generate Prisma Client
npm run db:generate

# 4. Run database migrations
npm run db:migrate

# 5. Seed the database
npm run db:seed

# 6. Start development server
npm run dev
```

### Database Setup

The database includes:

- **Organizations**: Unified carriers/shippers with type field
- **Loads**: All rate modes in single table (PerTon/PerYard/PerMile/etc.)
- **Equipment Types**: 15+ construction equipment types
- **Compliance Rules**: Database-driven regulatory checks
- **Audit Events**: Immutable event logging
- **Scale Tickets**: Construction-specific weight tracking

### Seed Data

The database is pre-populated with:

- ✅ **Equipment Types**: End Dump, Concrete Mixer, Flatbed, Lowboy, etc.
- ✅ **Rate Modes**: PerTon, PerYard, PerMile, PerTrip, PerHour, PerLoad, Daily
- ✅ **Pilot Zones**: DFW, Houston Metro, Phoenix/Maricopa
- ✅ **Compliance Rules**: Texas overweight/oversize/hazmat rules

## 📊 Core Features

### Universal Equipment Matching
- **Tier 1 (Optimal)**: Standard equipment for commodity
- **Tier 2 (Acceptable)**: Alternative that works
- **Tier 3 (Unusual)**: Requires confirmation + reason logging
- **Hard Block**: Safety/compliance violations only

### Rate Modes
- **Construction**: PerTon, PerYard, PerTrip, PerHour, Daily
- **OTR**: PerMile, PerLoad, Minimum + PerMile
- **Hybrid**: Customer chooses best fit for their contract

### Scale Ticket Integration
- OCR capture of scale tickets
- Auto-calculation: `GROSS_REV = Net Tonnage × Rate + Fees`
- Mismatch alerts: BOL tonnage ≠ scale ticket tonnage

### Compliance Guardrails
- Overweight/oversize rules by state
- Municipal dump/transfer validation
- Prevailing wage tracking
- Hazmat placarding requirements

## 🔒 Security & Privacy

- **Biometric-Free**: No facial recognition or device fingerprinting
- **RLS Policies**: Row-level security for multi-tenant isolation
- **Audit Trail**: Immutable event logging with signature hashes
- **Data Ownership**: Both sides can export data on demand

## 🛠️ Development

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create new migration
npm run db:migrate

# Reset database and reseed
npm run db:reset

# Open Prisma Studio (visual database browser)
npm run db:studio
```

### Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Seed data
├── migrations/               # SQL migration files
├── src/                     # Application code
└── package.json
```

## 🎯 Pilot Plan

### Target Corridors
- **I-40**: Dallas → Memphis → Atlanta
- **I-10**: Houston → San Antonio → Phoenix → LA
- **I-70**: Kansas City → Columbus → Baltimore

### Metro Zones
- **DFW**: North Dallas
- **Houston Metro**: West
- **Phoenix/Maricopa**: Metro area

### Success Metrics
- Median payout ≤ 36h
- ≥ 80% auto tracking
- 0 verified double-broker
- ≥ 70% one-tap completion
- CSAT ≥ 85%

## 📈 Next Steps

1. **Universal Equipment Matcher** - Smart suggestions with override capability
2. **Haul Type Detector** - Distance-based rate mode suggestions
3. **Scale Ticket OCR** - Photo capture → parsed fields → ledger entry
4. **Compliance Orchestrator** - Equipment-agnostic weight checks
5. **Factoring Integration** - QuickPay + BYO Factor support

## 🤝 Contributing

This is a private project. Contact the development team for access.

## 📄 License

MIT License - see LICENSE file for details.
