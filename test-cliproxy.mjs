/**
 * Simple E2E Test for CLIProxyAPI Integration
 *
 * Run: ADMIN_TOKEN=codexible_demo_pro_2026 node test-cliproxy.mjs
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'codexible_demo_pro_2026';

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n=== CLIProxyAPI Integration Tests ===\n');
  console.log(`API Base: ${API_BASE_URL}`);
  console.log(`Using token: ${ADMIN_TOKEN.substring(0, 10)}...\n`);

  const results = [];

  // Test 1: Check integration status
  results.push(await test('Admin can check integration status', async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/status`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    if (!res.ok) throw new Error(`Status: ${res.status}`);

    const data = await res.json();
    console.log(`   Integration:`, JSON.stringify(data.integration, null, 2));

    if (!data.integration) throw new Error('No integration data');
  }));

  // Test 2: CLIProxyAPI is reachable
  results.push(await test('CLIProxyAPI is reachable', async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/status`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const data = await res.json();

    if (!data.integration.upstream_reachable) {
      throw new Error(`upstream_reachable: ${data.integration.upstream_reachable}`);
    }
    if (!data.integration.management_reachable) {
      throw new Error(`management_reachable: ${data.integration.management_reachable}`);
    }
  }));

  // Test 3: Token validation (demo token)
  results.push(await test('Token validation works (no 503)', async () => {
    const res = await fetch(`${API_BASE_URL}/api/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'codexible_demo_pro_2026' })
    });

    // Should NOT be 503 (connection refused to CLIProxyAPI)
    if (res.status === 503) {
      throw new Error('503 Service Unavailable - CLIProxyAPI not reachable!');
    }

    const data = await res.json();
    console.log(`   Valid: ${data.valid}, Plan: ${data.user?.plan}`);
  }));

  // Test 4: Token validation with new key format
  results.push(await test('New key format validation works', async () => {
    const res = await fetch(`${API_BASE_URL}/api/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'codexible_test123' })
    });

    // Should NOT be 503
    if (res.status === 503) {
      throw new Error('503 Service Unavailable - CLIProxyAPI not reachable!');
    }

    const data = await res.json();
    console.log(`   Valid: ${data.valid}`);
  }));

  // Summary
  console.log('\n=== Summary ===');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n🎉 CLIProxyAPI integration is working!');
  } else {
    console.log('\nNote: Some tests may fail if:');
    console.log('- Services not fully running');
    console.log('- Admin token not configured correctly');
  }

  process.exit(passed === total ? 0 : 1);
}

runTests();
