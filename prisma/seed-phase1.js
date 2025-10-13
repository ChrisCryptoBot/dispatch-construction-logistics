// Phase 1 Seed Script
// Purpose: Create minimal reference data for local development
// Usage: node prisma/seed-phase1.js
// Note: Run ONLY in local/dev environments - NOT in production

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Phase 1 reference data...')

  // 1. Admin User (for development access)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@superioronelogistics.com' },
    update: {},
    create: {
      id: 'admin-user-dev',
      email: 'admin@superioronelogistics.com',
      firstName: 'Admin',
      lastName: 'User',
      phone: '903-388-5470',
      role: 'SUPER_ADMIN',
      active: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // 2. Test Customer (for testing load posting)
  const testCustomer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      id: 'test-customer-dev',
      email: 'customer@test.com',
      firstName: 'Test',
      lastName: 'Customer',
      phone: '555-0001',
      role: 'CUSTOMER_ADMIN',
      active: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
  console.log('✅ Test customer created:', testCustomer.email)

  // 3. Test Carrier/Driver (for testing bidding & acceptance)
  const testCarrier = await prisma.user.upsert({
    where: { email: 'carrier@test.com' },
    update: {},
    create: {
      id: 'test-carrier-dev',
      email: 'carrier@test.com',
      firstName: 'Test',
      lastName: 'Carrier',
      phone: '555-0002',
      role: 'CARRIER_ADMIN',
      active: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
  console.log('✅ Test carrier created:', testCarrier.email)

  const testDriver = await prisma.user.upsert({
    where: { email: 'driver@test.com' },
    update: {},
    create: {
      id: 'test-driver-dev',
      email: 'driver@test.com',
      firstName: 'Test',
      lastName: 'Driver',
      phone: '555-0003',
      role: 'DRIVER',
      active: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
  console.log('✅ Test driver created:', testDriver.email)

  // 4. Credit Profile for Test Customer (verified status)
  const creditProfile = await prisma.creditProfile.upsert({
    where: { customerId: testCustomer.id },
    update: {},
    create: {
      id: 'credit-profile-test',
      customerId: testCustomer.id,
      achStatus: 'verified',
      riskLimitCents: 10000000, // $100,000 limit
      currentExposureCents: 0,
      lastVerifiedAt: new Date(),
      updatedAt: new Date()
    }
  })
  console.log('✅ Credit profile created for test customer')

  console.log('\n🎉 Phase 1 seed complete!')
  console.log('\nTest Credentials:')
  console.log('  Admin:    admin@superioronelogistics.com')
  console.log('  Customer: customer@test.com')
  console.log('  Carrier:  carrier@test.com')
  console.log('  Driver:   driver@test.com')
  console.log('\nAll passwords: "admin" (use existing auth logic)')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



