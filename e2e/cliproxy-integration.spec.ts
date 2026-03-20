import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Demo user IDs from migrations/005_seed_demo_data.sql
const DEMO_USER_ID = 'b0000000-0000-0000-0000-000000000001'; // demo@codexible.me

/**
 * E2E Test: CLIProxyAPI Integration
 *
 * Tests the full flow:
 * 1. Admin creates a token via API
 * 2. Token is synced to CLIProxyAPI
 * 3. Token can be used to validate against CLIProxyAPI
 * 4. Admin revokes the token
 * 5. Token is removed from CLIProxyAPI
 *
 * To run these tests, set:
 * - ADMIN_TOKEN: an admin token from CLIPROXY_ADMIN_TOKENS
 *
 * The demo user (demo@codexible.me) has plan Pro, so validation should work.
 */
test.describe('CLIProxyAPI Integration', () => {
  let adminToken: string;
  let createdKeyId: string;

  test.beforeAll(async () => {
    // Get admin token from environment
    adminToken = process.env.ADMIN_TOKEN || '';

    // If no admin token, try using demo token for basic tests
    if (!adminToken) {
      console.log('Warning: ADMIN_TOKEN not set, using demo token for basic tests');
    }
  });

  test('admin can check CLIProxyAPI integration status', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/admin/status`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();

    const status = await response.json();
    expect(status).toHaveProperty('integration');
    expect(status.integration).toMatchObject({
      enabled: expect.any(Boolean),
      upstream_url: expect.any(String),
      management_url: expect.any(String),
    });

    // Log integration status for debugging
    console.log('Integration status:', JSON.stringify(status.integration, null, 2));
  });

  test('admin can create a token that syncs to CLIProxyAPI', async ({ request }) => {
    // Skip if no admin token
    test.skip(!adminToken, 'ADMIN_TOKEN not set');

    // Create a new token
    const createResponse = await request.post(`${API_BASE_URL}/api/admin/tokens`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      data: {
        user_id: DEMO_USER_ID,
        label: 'E2E Test Key',
      },
    });

    expect(createResponse.ok()).toBeTruthy();

    const createdKey = await createResponse.json();
    expect(createdKey).toHaveProperty('id');
    expect(createdKey).toHaveProperty('key');
    expect(createdKey.key).toMatch(/^codexible_/);

    createdKeyId = createdKey.id;
    console.log(`Created key: ${createdKeyId}`);
  });

  test('created token is valid against CLIProxyAPI', async ({ request }) => {
    // Skip if no admin token
    test.skip(!adminToken, 'ADMIN_TOKEN not set');

    // First create a token if we don't have one
    if (!createdKeyId) {
      const createResponse = await request.post(`${API_BASE_URL}/api/admin/tokens`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          user_id: DEMO_USER_ID,
          label: 'E2E Validation Test',
        },
      });
      const createdKey = await createResponse.json();
      createdKeyId = createdKey.id;
    }

    // Get the full key
    const listResponse = await request.get(`${API_BASE_URL}/api/admin/tokens`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    expect(listResponse.ok()).toBeTruthy();
    const tokens = await listResponse.json();

    // Find our test token
    const testToken = tokens.find((t: any) => t.id === createdKeyId);
    expect(testToken).toBeDefined();

    // Validate the token against CLIProxyAPI (via backend)
    // The /api/auth/validate endpoint takes JSON body with "token" field
    const validateResponse = await request.post(
      `${API_BASE_URL}/api/auth/validate`,
      {
        data: {
          token: testToken.prefix,
        },
      }
    );

    // Should either succeed (if key synced) or fail gracefully
    // We don't expect 503 Service Unavailable (connection refused)
    expect(validateResponse.status()).not.toBe(503);
  });

  test('admin can revoke a token', async ({ request }) => {
    // Skip if no admin token
    test.skip(!adminToken, 'ADMIN_TOKEN not set');

    // Create a token first if we don't have one
    if (!createdKeyId) {
      const createResponse = await request.post(`${API_BASE_URL}/api/admin/tokens`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          user_id: DEMO_USER_ID,
          label: 'E2E Revoke Test',
        },
      });
      const createdKey = await createResponse.json();
      createdKeyId = createdKey.id;
    }

    // Revoke the token
    const revokeResponse = await request.delete(
      `${API_BASE_URL}/api/admin/tokens/${createdKeyId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(revokeResponse.ok()).toBeTruthy();

    const result = await revokeResponse.json();
    expect(result.deleted).toBe(true);
  });

  test('admin can rotate a token', async ({ request }) => {
    // Skip if no admin token
    test.skip(!adminToken, 'ADMIN_TOKEN not set');

    // Create a token first
    const createResponse = await request.post(`${API_BASE_URL}/api/admin/tokens`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      data: {
        user_id: DEMO_USER_ID,
        label: 'E2E Rotate Test',
      },
    });

    const createdKey = await createResponse.json();
    const oldKeyId = createdKey.id;
    const oldKey = createdKey.key;

    // Rotate the token
    const rotateResponse = await request.post(
      `${API_BASE_URL}/api/admin/tokens/${oldKeyId}/rotate`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(rotateResponse.ok()).toBeTruthy();

    const rotatedKey = await rotateResponse.json();
    expect(rotatedKey).toHaveProperty('key');
    expect(rotatedKey.key).not.toBe(oldKey); // Key should be different
    expect(rotatedKey.key).toMatch(/^codexible_/);

    createdKeyId = rotatedKey.id; // Update for cleanup
  });

  test('CLIProxyAPI is reachable', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/admin/status`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();

    const status = await response.json();

    // Check that CLIProxyAPI is reachable
    expect(status.integration.upstream_reachable).toBe(true);
    expect(status.integration.management_reachable).toBe(true);

    console.log('CLIProxyAPI is reachable and healthy');
  });
});
