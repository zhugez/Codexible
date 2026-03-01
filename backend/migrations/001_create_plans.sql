-- Create plans table
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    daily_credit_limit INT NOT NULL,
    price_cents INT NOT NULL,
    features JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default plans
INSERT INTO plans (id, name, daily_credit_limit, price_cents, features) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Starter', 75, 1000, '{"support": "community", "rate_limit": 50}'),
    ('a0000000-0000-0000-0000-000000000002', 'Pro', 250, 3000, '{"support": "email", "rate_limit": 100}'),
    ('a0000000-0000-0000-0000-000000000003', 'Business', 500, 5000, '{"support": "priority", "rate_limit": 200}');
