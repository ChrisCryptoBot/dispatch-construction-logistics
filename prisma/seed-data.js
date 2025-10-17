const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.loadInterest.deleteMany()
  await prisma.scaleTicket.deleteMany()
  await prisma.document.deleteMany()
  await prisma.load.deleteMany()
  await prisma.insurance.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  console.log('✅ Existing data cleared')

  // Create Carrier Organization
  console.log('Creating carrier organization...')
  const carrierOrg = await prisma.organization.create({
    data: {
      name: 'Superior One Logistics',
      type: 'CARRIER',
      mcNumber: 'MC-123456',
      dotNumber: 'DOT-123456',
      ein: '12-3456789',
      email: 'carrier@admin.com',
      phone: '(214) 555-0123',
      address: {
        street: '123 Logistics Blvd',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        country: 'US'
      },
      verified: true,
      active: true
    }
  })
  console.log(`✅ Created carrier: ${carrierOrg.name}`)

  // Create Customer Organization
  console.log('Creating customer organization...')
  const customerOrg = await prisma.organization.create({
    data: {
      name: 'ABC Construction Co',
      type: 'SHIPPER',
      ein: '98-7654321',
      email: 'admin@admin.com',
      phone: '(214) 555-0456',
      address: {
        street: '456 Construction Way',
        city: 'Dallas',
        state: 'TX',
        zip: '75202',
        country: 'US'
      },
      verified: true,
      active: true
    }
  })
  console.log(`✅ Created customer: ${customerOrg.name}`)

  // Create Carrier User
  const carrierPasswordHash = await bcrypt.hash('admin', 12)
  const carrierUser = await prisma.user.create({
    data: {
      orgId: carrierOrg.id,
      email: 'carrier@admin.com',
      passwordHash: carrierPasswordHash,
      firstName: 'Carrier',
      lastName: 'User',
      phone: '(214) 555-0123',
      role: 'admin',
      active: true,
      emailVerified: true
    }
  })
  console.log(`✅ Created carrier user: ${carrierUser.email}`)

  // Create Customer User
  const customerPasswordHash = await bcrypt.hash('admin', 12)
  const customerUser = await prisma.user.create({
    data: {
      orgId: customerOrg.id,
      email: 'admin@admin.com',
      passwordHash: customerPasswordHash,
      firstName: 'Customer',
      lastName: 'User',
      phone: '(214) 555-0456',
      role: 'admin',
      active: true,
      emailVerified: true
    }
  })
  console.log(`✅ Created customer user: ${customerUser.email}`)

  // Create Sample Loads
  console.log('Creating sample loads...')
  const loads = []

  // Load 1: Crushed Stone
  loads.push(await prisma.load.create({
    data: {
      orgId: customerOrg.id,
      shipperId: customerOrg.id,
      loadType: 'AGGREGATE',
      rateMode: 'PER_TON',
      haulType: 'METRO',
      commodity: 'Crushed Stone (3/4")',
      equipmentType: 'End Dump',
      equipmentMatchTier: 'optimal',
      origin: {
        address: 'Dallas Quarry, 123 Quarry Rd, Dallas, TX 75001',
        city: 'Dallas',
        state: 'TX',
        lat: 32.7767,
        lng: -96.7970
      },
      destination: {
        address: 'I-35 Bridge Project, 456 Construction Site, Dallas, TX 75002',
        city: 'Dallas',
        state: 'TX',
        lat: 32.8267,
        lng: -96.8470
      },
      rate: 45.00,
      units: 25,
      miles: 28,
      grossRevenue: 1125.00,
      pickupDate: new Date('2025-01-10'),
      deliveryDate: new Date('2025-01-10'),
      jobCode: 'ABC-2025-001',
      poNumber: 'PO-2025-12345',
      projectName: 'I-35 Bridge Project',
      notes: 'Scale ticket required. Overweight permit needed.',
      overweightPermit: true,
      prevailingWage: false,
      status: 'POSTED'
    }
  }))

  // Load 2: Ready-Mix Concrete
  loads.push(await prisma.load.create({
    data: {
      orgId: customerOrg.id,
      shipperId: customerOrg.id,
      loadType: 'MATERIAL',
      rateMode: 'PER_YARD',
      haulType: 'METRO',
      commodity: 'Ready-Mix Concrete (3000 PSI)',
      equipmentType: 'Mixer',
      equipmentMatchTier: 'optimal',
      origin: {
        address: 'ABC Concrete Plant, 789 Plant Rd, Fort Worth, TX 76001',
        city: 'Fort Worth',
        state: 'TX'
      },
      destination: {
        address: 'Downtown Construction Site, Fort Worth, TX 76002',
        city: 'Fort Worth',
        state: 'TX'
      },
      rate: 180.00,
      units: 8,
      miles: 15,
      grossRevenue: 1440.00,
      pickupDate: new Date('2025-01-11'),
      deliveryDate: new Date('2025-01-11'),
      jobCode: 'ABC-2025-002',
      poNumber: 'PO-2025-12346',
      notes: 'Time sensitive - 90min limit after mixing',
      status: 'POSTED'
    }
  }))

  // Load 3: Debris Removal
  loads.push(await prisma.load.create({
    data: {
      orgId: customerOrg.id,
      shipperId: customerOrg.id,
      loadType: 'WASTE',
      rateMode: 'PER_TRIP',
      haulType: 'METRO',
      commodity: 'Demolition Debris',
      equipmentType: 'End Dump',
      equipmentMatchTier: 'acceptable',
      origin: {
        address: 'Site A, Dallas, TX 75003',
        city: 'Dallas',
        state: 'TX'
      },
      destination: {
        address: 'Municipal Dump, Mesquite, TX 75149',
        city: 'Mesquite',
        state: 'TX'
      },
      rate: 95.00,
      units: 20,
      miles: 18,
      grossRevenue: 1900.00,
      pickupDate: new Date('2025-01-08'),
      deliveryDate: new Date('2025-01-08'),
      jobCode: 'GHI-2025-004',
      poNumber: 'PO-2025-12347',
      notes: 'Scale ticket required',
      status: 'POSTED'
    }
  }))

  console.log(`✅ Created ${loads.length} sample loads`)

  // Create a bid on Load 1
  console.log('Creating sample bid...')
  await prisma.loadInterest.create({
    data: {
      loadId: loads[0].id,
      carrierId: carrierOrg.id,
      bidAmount: 45.00,
      message: 'We can handle this load. Available equipment ready.',
      status: 'PENDING'
    }
  })
  console.log('✅ Created sample bid')

  console.log('🎉 Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - Organizations: 2 (1 carrier, 1 customer)`)
  console.log(`   - Users: 2`)
  console.log(`   - Loads: ${loads.length}`)
  console.log(`   - Bids: 1`)
  console.log('\n🔑 Login Credentials:')
  console.log('   Carrier: carrier@admin.com / admin')
  console.log('   Customer: admin@admin.com / admin')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })













