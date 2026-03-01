-- Create API keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_prefix VARCHAR(20) NOT NULL,
    key_hash VARCHAR(64) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL DEFAULT 'Default',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
