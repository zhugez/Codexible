-- Create per-request log table for detailed usage tracking
CREATE TABLE request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    prompt_tokens INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    cost_usd DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_request_logs_user_date ON request_logs(user_id, date);
CREATE INDEX idx_request_logs_user_id ON request_logs(user_id);
CREATE INDEX idx_request_logs_api_key_date ON request_logs(api_key_id, date);

-- Add cost_usd column to daily_usage table
ALTER TABLE daily_usage ADD COLUMN cost_usd DOUBLE PRECISION NOT NULL DEFAULT 0.0;
