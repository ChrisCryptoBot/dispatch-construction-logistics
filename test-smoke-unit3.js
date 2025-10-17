/**
 * Unit 3 Consolidation Smoke Tests
 * 
 * These tests verify basic functionality after consolidation:
 * - Server boot
 * - Health endpoint
 * - Core routes
 * - Feature flags
 */

const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 10000; // 10 seconds

// Test configuration
const tests = [
  {
    name: 'Server Boot Test',
    description: 'Verify server starts without errors',
    type: 'startup'
  },
  {
    name: 'Health Endpoint Test',
    description: 'Verify health endpoint responds correctly',
    endpoint: '/health',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Root Endpoint Test', 
    description: 'Verify root endpoint returns API information',
    endpoint: '/',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Metrics Endpoint Test',
    description: 'Verify metrics endpoint (if enabled)',
    endpoint: '/metrics',
    method: 'GET',
    expectedStatus: 200,
    conditional: true
  },
  {
    name: 'Customer My Loads Test',
    description: 'Verify optimized customer my-loads endpoint',
    endpoint: '/api/customer/my-loads',
    method: 'GET',
    expectedStatus: 401, // Should require authentication
    authRequired: true
  },
  {
    name: 'Marketplace Loads Test',
    description: 'Verify marketplace loads endpoint',
    endpoint: '/api/marketplace/loads',
    method: 'GET',
    expectedStatus: 401, // Should require authentication
    authRequired: true
  },
  {
    name: 'Marketplace Bid Test',
    description: 'Verify optimized marketplace bid endpoint',
    endpoint: '/api/marketplace/bid',
    method: 'POST',
    expectedStatus: 401, // Should require authentication
    authRequired: true
  }
];

// Test runner
async function runSmokeTests() {
  console.log('🧪 Starting Unit 3 Consolidation Smoke Tests');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Timeout: ${TEST_TIMEOUT}ms`);
  console.log('='.repeat(60));

  const results = [];
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const test of tests) {
    console.log(`\n🔍 Running: ${test.name}`);
    console.log(`   Description: ${test.description}`);

    try {
      const result = await runTest(test);
      results.push(result);

      if (result.status === 'PASSED') {
        passed++;
        console.log(`   ✅ PASSED - ${result.message}`);
      } else if (result.status === 'SKIPPED') {
        skipped++;
        console.log(`   ⏭️  SKIPPED - ${result.message}`);
      } else {
        failed++;
        console.log(`   ❌ FAILED - ${result.message}`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
    } catch (error) {
      failed++;
      const result = {
        name: test.name,
        status: 'FAILED',
        message: 'Test execution error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      results.push(result);
      console.log(`   ❌ FAILED - Test execution error: ${error.message}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SMOKE TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📈 Total: ${tests.length}`);
  console.log(`📊 Success Rate: ${Math.round((passed / tests.length) * 100)}%`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => r.status === 'FAILED').forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  // Save results
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      total: tests.length,
      passed,
      failed,
      skipped,
      successRate: Math.round((passed / tests.length) * 100)
    },
    results
  };

  require('fs').writeFileSync(
    'audit/runs/2025-01-16T16-15-00Z/smoke-unit3.txt',
    JSON.stringify(report, null, 2)
  );

  console.log('📄 Test results saved to: audit/runs/2025-01-16T16-15-00Z/smoke-unit3.txt');

  return failed === 0;
}

// Individual test runner
async function runTest(test) {
  const result = {
    name: test.name,
    status: 'UNKNOWN',
    message: '',
    timestamp: new Date().toISOString(),
    duration: 0
  };

  const startTime = Date.now();

  try {
    if (test.type === 'startup') {
      // Server boot test - just check if we can reach the server
      await axios.get(`${BASE_URL}/health`, { timeout: TEST_TIMEOUT });
      result.status = 'PASSED';
      result.message = 'Server is running and responding';
    } else if (test.endpoint) {
      // HTTP endpoint test
      const config = {
        method: test.method || 'GET',
        url: `${BASE_URL}${test.endpoint}`,
        timeout: TEST_TIMEOUT,
        validateStatus: () => true // Don't throw on any status
      };

      const response = await axios(config);
      
      if (test.conditional && response.status === 404) {
        // Endpoint might be disabled (like metrics)
        result.status = 'SKIPPED';
        result.message = 'Endpoint not available (feature may be disabled)';
      } else if (response.status === test.expectedStatus) {
        result.status = 'PASSED';
        result.message = `Status ${response.status} as expected`;
      } else {
        result.status = 'FAILED';
        result.message = `Expected status ${test.expectedStatus}, got ${response.status}`;
      }

      result.statusCode = response.status;
      result.responseTime = response.headers['x-response-time'] || 'unknown';
    }

    result.duration = Date.now() - startTime;
    return result;

  } catch (error) {
    result.duration = Date.now() - startTime;
    
    if (error.code === 'ECONNREFUSED') {
      result.status = 'FAILED';
      result.message = 'Server not running or not accessible';
      result.error = 'Connection refused';
    } else if (error.code === 'ETIMEDOUT') {
      result.status = 'FAILED';
      result.message = 'Request timed out';
      result.error = 'Timeout';
    } else {
      result.status = 'FAILED';
      result.message = 'Unexpected error';
      result.error = error.message;
    }

    return result;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runSmokeTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Smoke test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { runSmokeTests, tests };


