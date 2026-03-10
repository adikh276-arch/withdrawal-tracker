-- Withdrawal Tracker Database Schema

-- Users table (id matches user_id from handshake)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Withdrawal logs table
CREATE TABLE IF NOT EXISTS withdrawal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(id),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    path VARCHAR(50) NOT NULL,
    symptoms TEXT[],
    other_text TEXT,
    intensity INTEGER,
    intensity_label VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_logs_user_id ON withdrawal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_logs_date ON withdrawal_logs(date);
