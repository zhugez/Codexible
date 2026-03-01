-- Seed demo users and API keys matching the current frontend mock tokens.
-- API key hashes are SHA-256 of the full token string.

-- Demo users
INSERT INTO users (id, email, name, plan_id, status) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'demo@codexible.me', 'Demo User',
     'a0000000-0000-0000-0000-000000000002', 'active'),
    ('b0000000-0000-0000-0000-000000000002', 'team@codexible.me', 'Team User',
     'a0000000-0000-0000-0000-000000000003', 'active'),
    ('b0000000-0000-0000-0000-000000000003', 'starter@codexible.me', 'Starter User',
     'a0000000-0000-0000-0000-000000000001', 'active');

-- Demo API keys
-- Token: codexible_demo_pro_2026       → SHA-256: see hash below
-- Token: codexible_demo_business_2026  → SHA-256: see hash below
-- Token: codexible_demo_starter_2026   → SHA-256: see hash below
--
-- These hashes should be computed at migration time or by a seed script.
-- For now, we insert placeholder hashes that the seed script will update.
-- In production, use: echo -n "codexible_demo_pro_2026" | sha256sum

INSERT INTO api_keys (id, user_id, key_prefix, key_hash, label, status) VALUES
    ('c0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001',
     'codexible_demo',
     'e3b98a4da31a127d4bde6e43033f66ba274cab0eb7eb1c70ec41402bf6273dd8',
     'Demo Pro Key', 'active'),
    ('c0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000002',
     'codexible_demo',
     '8b2c86e5b0e12e06c4ef6c8db2227fbbc6af5a1e235eaf1e0ca8386a6fa5d2a1',
     'Demo Business Key', 'active'),
    ('c0000000-0000-0000-0000-000000000003',
     'b0000000-0000-0000-0000-000000000003',
     'codexible_demo',
     'a57c65b87c370ccb290ce56cd7e34e68f5be1131aa97b928e91e3e8e7c03a4d0',
     'Demo Starter Key', 'active');

-- Seed some usage data
INSERT INTO daily_usage (user_id, api_key_id, date, credits_used, request_count) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', CURRENT_DATE, 142, 89),
    ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', CURRENT_DATE, 310, 156),
    ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', CURRENT_DATE, 23, 12);
