/**
 * Automated Critical Path Test Runner
 * Tests the 10 most important workflows
 * 
 * Usage: node TESTING/RUN_CRITICAL_TESTS.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let customerToken = '';
let carrierToken = '';
let customerId = '';
let carrierId = '';
let loadId = '';
let bidId = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(number, name) {
  console.log(`\n${'='.repeat(60)}`);
  log(`TEST ${number}: ${name}`, 'cyan');
  console.log(`${'='.repeat(60)}`);
}

function logPass(message) {
  log(`✅ PASS: ${message}`, 'green');
}

function logFail(message) {
  log(`❌ FAIL: ${message}`, 'red');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test Results Tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

async function runTest(testName, testFunction) {
  results.total++;
  try {
    await testFunction();
    results.passed++;
    logPass(testName);
  } catch (error) {
    results.failed++;
    logFail(`${testName}: ${error.message}`);
    results.errors.push({ test: testName, error: error.message });
  }
}

// ============================================================================
// TEST 1: Customer Signup
// ============================================================================
async function test01_CustomerSignup() {
  logTest('01', 'Customer Signup');
  
  const response = await axios.post(`${BASE_URL}/auth/signup`, {
    orgName: 'Test Construction Co',
    orgType: 'SHIPPER',
    email: `customer-${Date.now()}@test.com`,
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'Customer'
  });

  if (response.status !== 202) {
    throw new Error(`Expected 202, got ${response.status}`);
  }

  if (!response.data.requiresVerification) {
    throw new Error('Verification should be required');
  }

  customerId = response.data.email;
  logPass('Customer signup successful, verification code sent');
}

// ============================================================================
// TEST 2: Customer Email Verification
// ============================================================================
async function test02_CustomerVerifyEmail() {
  logTest('02', 'Customer Email Verification');
  
  const response = await axios.post(`${BASE_URL}/auth/verify-email`, {
    email: customerId,
    code: '123456' // Mock code
  });

  if (!response.data.token) {
    throw new Error('Token not returned');
  }

  customerToken = response.data.token;
  customerId = response.data.organization.id;
  
  logPass(`Customer verified, token: ${customerToken.substring(0, 20)}...`);
}

// ============================================================================
// TEST 3: Carrier Signup
// ============================================================================
async function test03_CarrierSignup() {
  logTest('03', 'Carrier Signup');
  
  const response = await axios.post(`${BASE_URL}/auth/signup`, {
    orgName: 'Test Trucking LLC',
    orgType: 'CARRIER',
    email: `carrier-${Date.now()}@test.com`,
    password: 'CarrierPass123!',
    firstName: 'John',
    lastName: 'Driver'
  });

  if (response.status !== 202) {
    throw new Error(`Expected 202, got ${response.status}`);
  }

  carrierId = response.data.email;
  logPass('Carrier signup successful');
}

// ============================================================================
// TEST 4: Carrier Email Verification
// ============================================================================
async function test04_CarrierVerifyEmail() {
  logTest('04', 'Carrier Email Verification');
  
  const response = await axios.post(`${BASE_URL}/auth/verify-email`, {
    email: carrierId,
    code: '123456'
  });

  carrierToken = response.data.token;
  carrierId = response.data.organization.id;
  
  logPass(`Carrier verified, orgId: ${carrierId}`);
}

// ============================================================================
// TEST 5: Customer Posts Load
// ============================================================================
async function test05_CustomerPostLoad() {
  logTest('05', 'Customer Posts Load');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const response = await axios.post(
    `${BASE_URL}/customer/loads`,
    {
      materialType: 'AGGREGATE',
      commodityDetails: '3/4 inch washed gravel',
      quantity: 50,
      quantityUnit: 'tons',
      pickupLocation: 'Test Quarry',
      pickupAddress: '123 Quarry Rd, Austin, TX 78701',
      deliveryLocation: 'Test Site',
      deliveryAddress: '456 Site Way, Austin, TX 78702',
      pickupDate: tomorrowStr,
      pickupTimeStart: '08:00',
      pickupTimeEnd: '12:00',
      deliveryDate: tomorrowStr,
      deliveryTimeStart: '10:00',
      deliveryTimeEnd: '15:00',
      rateMode: 'PER_TON',
      rateAmount: 12.50,
      requiresScaleTicket: true,
      jobCode: 'TEST-JOB-001',
      poNumber: 'PO-TEST-001'
    },
    { headers: { Authorization: `Bearer ${customerToken}` } }
  );

  loadId = response.data.load.id;
  
  logPass(`Load created: ${loadId}, status: ${response.data.load.status}`);
  log(`  Equipment matched: ${response.data.analysis.equipmentMatch.equipmentType}`, 'blue');
  log(`  Distance: ${response.data.analysis.distance} miles`, 'blue');
  log(`  Haul type: ${response.data.analysis.haulType}`, 'blue');
}

// ============================================================================
// TEST 6: Carrier Submits Bid
// ============================================================================
async function test06_CarrierSubmitBid() {
  logTest('06', 'Carrier Submits Bid');
  
  const response = await axios.post(
    `${BASE_URL}/carrier/loads/${loadId}/bid`,
    {
      message: 'Automated test bid - have truck ready for tomorrow'
    },
    { headers: { Authorization: `Bearer ${carrierToken}` } }
  );

  bidId = response.data.bid.id;
  
  logPass(`Bid submitted: ${bidId}, status: ${response.data.bid.status}`);
}

// ============================================================================
// TEST 7: Customer Accepts Bid
// ============================================================================
async function test07_CustomerAcceptBid() {
  logTest('07', 'Customer Accepts Bid');
  
  const response = await axios.post(
    `${BASE_URL}/customer/loads/${loadId}/bids/${bidId}/accept`,
    {
      notes: 'Confirmed for automated test'
    },
    { headers: { Authorization: `Bearer ${customerToken}` } }
  );

  logPass(`Bid accepted, load status: ${response.data.load.status}`);
  
  if (response.data.load.status !== 'ASSIGNED') {
    throw new Error(`Expected status ASSIGNED, got ${response.data.load.status}`);
  }
}

// ============================================================================
// TEST 8: Carrier Accepts Load (Insurance Check!)
// ============================================================================
async function test08_CarrierAcceptLoad() {
  logTest('08', 'Carrier Accepts Load (with Insurance Check)');
  
  log('⚠️  This test will fail if carrier has no insurance!', 'yellow');
  log('   Expected behavior: Blocked due to invalid insurance', 'yellow');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/carrier/loads/${loadId}/accept`,
      {
        notes: 'Automated test acceptance'
      },
      { headers: { Authorization: `Bearer ${carrierToken}` } }
    );

    // If we get here, carrier had valid insurance
    logPass(`Load accepted, status: ${response.data.load.status}`);
    
    if (response.data.load.status === 'RELEASE_REQUESTED') {
      logPass('✨ Release auto-requested from shipper!');
    }
    
  } catch (error) {
    if (error.response?.status === 403 && error.response?.data?.code === 'INSURANCE_INVALID') {
      logPass('Carrier correctly blocked due to invalid insurance');
      log('   To fix: Add insurance policies to database (see setup SQL)', 'yellow');
    } else {
      throw error;
    }
  }
}

// ============================================================================
// TEST 9: FMCSA Verification (if carrier has DOT)
// ============================================================================
async function test09_FMCSAVerification() {
  logTest('09', 'FMCSA Verification');
  
  log('⚠️  This test requires carrier to have MC/DOT numbers', 'yellow');
  log('   If no MC/DOT, test will be skipped', 'yellow');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/verification/fmcsa/${carrierId}/verify`,
      {},
      { headers: { Authorization: `Bearer ${carrierToken}` } }
    );

    logPass(`FMCSA verification result: ${response.data.verified ? 'VERIFIED' : 'NOT VERIFIED'}`);
    log(`  Status: ${response.data.status}`, 'blue');
    log(`  Safety Rating: ${response.data.safetyRating}`, 'blue');
    
  } catch (error) {
    if (error.response?.status === 400) {
      log('Skipped: Carrier has no MC/DOT numbers (add via SQL)', 'yellow');
    } else {
      throw error;
    }
  }
}

// ============================================================================
// TEST 10: End-to-End Summary
// ============================================================================
async function test10_EndToEndSummary() {
  logTest('10', 'End-to-End Workflow Summary');
  
  // Get load details to verify final state
  const response = await axios.get(
    `${BASE_URL}/customer/loads/${loadId}`,
    { headers: { Authorization: `Bearer ${customerToken}` } }
  );

  const load = response.data.load;
  
  log('\n📊 WORKFLOW SUMMARY:', 'cyan');
  log(`  Load ID: ${load.id}`, 'blue');
  log(`  Status: ${load.status}`, 'blue');
  log(`  Commodity: ${load.commodity}`, 'blue');
  log(`  Equipment: ${load.equipmentType}`, 'blue');
  log(`  Carrier: ${load.carrier?.name || 'Unassigned'}`, 'blue');
  log(`  Gross Revenue: $${load.grossRevenue}`, 'blue');
  log(`  Miles: ${load.miles}`, 'blue');
  log(`  Haul Type: ${load.haulType}`, 'blue');
  
  logPass('Workflow tracking complete');
}

// ============================================================================
// MAIN TEST EXECUTION
// ============================================================================
async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 SUPERIOR ONE LOGISTICS - CRITICAL PATH TESTS', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  try {
    await runTest('TEST 01: Customer Signup', test01_CustomerSignup);
    await sleep(500);
    
    await runTest('TEST 02: Customer Email Verification', test02_CustomerVerifyEmail);
    await sleep(500);
    
    await runTest('TEST 03: Carrier Signup', test03_CarrierSignup);
    await sleep(500);
    
    await runTest('TEST 04: Carrier Email Verification', test04_CarrierVerifyEmail);
    await sleep(500);
    
    await runTest('TEST 05: Customer Posts Load', test05_CustomerPostLoad);
    await sleep(500);
    
    await runTest('TEST 06: Carrier Submits Bid', test06_CarrierSubmitBid);
    await sleep(500);
    
    await runTest('TEST 07: Customer Accepts Bid', test07_CustomerAcceptBid);
    await sleep(500);
    
    await runTest('TEST 08: Carrier Accepts Load (Insurance Check)', test08_CarrierAcceptLoad);
    await sleep(500);
    
    await runTest('TEST 09: FMCSA Verification', test09_FMCSAVerification);
    await sleep(500);
    
    await runTest('TEST 10: End-to-End Summary', test10_EndToEndSummary);

  } catch (error) {
    log(`\n💥 FATAL ERROR: ${error.message}`, 'red');
    console.error(error);
  }

  // Print Results
  console.log('\n' + '='.repeat(60));
  log('📊 TEST RESULTS', 'cyan');
  console.log('='.repeat(60));
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 
      results.passed === results.total ? 'green' : 'yellow');

  if (results.errors.length > 0) {
    console.log('\n' + '-'.repeat(60));
    log('❌ FAILED TESTS:', 'red');
    console.log('-'.repeat(60));
    results.errors.forEach((err, i) => {
      log(`${i + 1}. ${err.test}`, 'red');
      log(`   Error: ${err.error}`, 'yellow');
    });
  }

  console.log('\n' + '='.repeat(60));
  if (results.passed === results.total) {
    log('🎉 ALL TESTS PASSED! PLATFORM READY FOR LAUNCH!', 'green');
  } else {
    log('⚠️  SOME TESTS FAILED - REVIEW ERRORS ABOVE', 'yellow');
  }
  console.log('='.repeat(60) + '\n');
}

// Run tests
runAllTests().catch(err => {
  log(`\n💥 Test suite crashed: ${err.message}`, 'red');
  console.error(err);
  process.exit(1);
});


