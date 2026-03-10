import { Pool } from "@neondatabase/serverless";

// Use import.meta.env for Vite environment variables with a fallback for Node scripts
const DATABASE_URL = (import.meta as any).env?.VITE_DATABASE_URL || process.env.DATABASE_URL;

export const pool = new Pool({
    connectionString: DATABASE_URL,
});

// For automatic schema generation and startup checks
export async function initializeDatabase() {
    const schema = `
    CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
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
    CREATE INDEX IF NOT EXISTS idx_withdrawal_logs_user_id ON withdrawal_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_withdrawal_logs_date ON withdrawal_logs(date);
  `;

    try {
        await pool.query(schema);
        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Database initialization failed:", error);
    }
}

export async function initializeUser(userId: string) {
    try {
        await pool.query('INSERT INTO users (id) VALUES ($1) ON CONFLICT (id) DO NOTHING', [userId]);
    } catch (error) {
        console.error("User initialization failed:", error);
    }
}
