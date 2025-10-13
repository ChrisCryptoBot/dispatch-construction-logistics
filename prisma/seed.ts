import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Equipment Types
  const equipmentTypes = [
    { name: 'End Dump 10-Wheel', category: 'dump_truck', optimalFor: ['aggregates', 'dirt', 'gravel', 'sand', 'crushed_stone'] },
    { name: 'Transfer Dump', category: 'dump_truck', optimalFor: ['aggregates', 'dirt', 'high_capacity_hauls'] },
    { name: 'Belly Dump', category: 'dump_truck', optimalFor: ['aggregates', 'fast_unload_required'] },
    { name: 'Side Dump', category: 'dump_truck', optimalFor: ['walls', 'trenches', 'tight_spaces'] },
    { name: 'Concrete Mixer Front Discharge', category: 'mixer', optimalFor: ['concrete', 'ready_mix'] },
    { name: 'Concrete Mixer Rear Discharge', category: 'mixer', optimalFor: ['concrete', 'ready_mix'] },
    { name: 'Flatbed 48ft', category: 'flatbed', optimalFor: ['steel', 'lumber', 'pipe', 'rebar', 'trusses'] },
    { name: 'Flatbed 53ft', category: 'flatbed', optimalFor: ['steel', 'lumber', 'pipe', 'long_materials'] },
    { name: 'Stepdeck', category: 'flatbed', optimalFor: ['tall_loads', 'equipment', 'machinery'] },
    { name: 'Lowboy RGN', category: 'lowboy', optimalFor: ['heavy_equipment', 'excavators', 'dozers', 'cranes'] },
    { name: 'Extendable Flatbed', category: 'flatbed', optimalFor: ['long_pipe', 'beams', 'trusses', 'poles'] },
    { name: 'Dry Van 53ft', category: 'van', optimalFor: ['drywall', 'insulation', 'finishes', 'weather_sensitive'] },
    { name: 'Pneumatic Tanker', category: 'tanker', optimalFor: ['cement', 'fly_ash', 'lime', 'dry_bulk'] },
    { name: 'Hotshot Gooseneck', category: 'hotshot', optimalFor: ['urgent_small_loads', 'tools', 'parts'] },
    { name: 'Lowboy Landoll', category: 'lowboy', optimalFor: ['track_equipment', 'low_angle_loading'] },
  ];

  for (const equipment of equipmentTypes) {
    await prisma.equipmentType.upsert({
      where: { name: equipment.name },
      update: {},
      create: equipment,
    });
  }

  console.log('✅ Equipment types seeded');

  // Rate Mode Configs
  const rateModes = [
    { code: 'per_mile', name: 'Per Mile', unit: 'miles', typicalUseCases: ['OTR freight', 'Long-haul', 'Equipment moves 150+ miles'] },
    { code: 'per_ton', name: 'Per Ton', unit: 'tons', typicalUseCases: ['Aggregates', 'Asphalt', 'Concrete rubble', 'Dirt work'] },
    { code: 'per_yard', name: 'Per Cubic Yard', unit: 'cubic yards', typicalUseCases: ['Concrete', 'Topsoil', 'Mulch', 'Fill material'] },
    { code: 'per_trip', name: 'Per Trip', unit: 'trips', typicalUseCases: ['Dump runs', 'Debris removal', 'Shuttle work'] },
    { code: 'per_hour', name: 'Per Hour', unit: 'hours', typicalUseCases: ['Equipment transport with wait time', 'Hourly rental'] },
    { code: 'per_load', name: 'Per Load', unit: 'loads', typicalUseCases: ['Flat rate origin to destination', 'Specialized moves'] },
    { code: 'daily', name: 'Daily Rate', unit: 'days', typicalUseCases: ['Equipment rental with operator', 'Daily hire'] },
  ];

  for (const mode of rateModes) {
    await prisma.rateModeConfig.upsert({
      where: { code: mode.code },
      update: {},
      create: mode,
    });
  }

  console.log('✅ Rate modes seeded');

  // Pilot Zones
  const zones = [
    {
      name: 'DFW - North Dallas',
      type: 'metro',
      metroArea: 'Dallas-Fort Worth',
      boundaries: { type: 'Polygon', coordinates: [[[-96.9, 33.1], [-96.6, 33.1], [-96.6, 32.8], [-96.9, 32.8], [-96.9, 33.1]]] },
    },
    {
      name: 'Houston Metro - West',
      type: 'metro',
      metroArea: 'Houston',
      boundaries: { type: 'Polygon', coordinates: [[[-95.8, 29.9], [-95.3, 29.9], [-95.3, 29.6], [-95.8, 29.6], [-95.8, 29.9]]] },
    },
    {
      name: 'Phoenix Metro - Maricopa',
      type: 'metro',
      metroArea: 'Phoenix',
      boundaries: { type: 'Polygon', coordinates: [[[-112.4, 33.7], [-111.9, 33.7], [-111.9, 33.3], [-112.4, 33.3], [-112.4, 33.7]]] },
    },
  ];

  for (const zone of zones) {
    await prisma.zone.create({ data: zone });
  }

  console.log('✅ Pilot zones seeded');

  // Basic Compliance Rules (Texas as example)
  const complianceRules = [
    {
      ruleType: 'overweight',
      scope: 'state:TX',
      conditions: { axleWeight: { max: 20000 }, grossWeight: { max: 80000 } },
      actions: { requirePermit: true, message: 'Texas overweight permit required' },
      priority: 1,
    },
    {
      ruleType: 'oversize',
      scope: 'state:TX',
      conditions: { width: { max: 102 }, height: { max: 168 }, length: { max: 59 } },
      actions: { requirePermit: true, requireEscort: true, message: 'Texas oversize permit and escort required' },
      priority: 1,
    },
    {
      ruleType: 'hazmat',
      scope: 'national',
      conditions: { hazmatClass: { any: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] } },
      actions: { requirePlacard: true, requireManifest: true, message: 'Hazmat documentation required' },
      priority: 2,
    },
  ];

  for (const rule of complianceRules) {
    await prisma.complianceRule.create({ data: rule });
  }

  console.log('✅ Compliance rules seeded');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
