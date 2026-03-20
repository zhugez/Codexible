-- Add key_full column for CLIProxyAPI sync
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_full TEXT;

CREATE INDEX IF NOT EXISTS idx_api_keys_key_full ON api_keys(key_full) WHERE status = 'active';
