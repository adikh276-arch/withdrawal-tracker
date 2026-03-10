import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function validate() {
    const TEST_USER_ID = BigInt('1010101');
    const TEST_SYMPTOM = 'Headache';
    const TEST_SEVERITY = 5;

    try {
        // 1. Connection & Schema
        console.log('Validating connection and schema...');
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
        await pool.query(schema);
        console.log('✔ Database connection and schema validated.');

        // 2. Insert User
        console.log('Inserting test user...');
        await pool.query('INSERT INTO users (id) VALUES ($1) ON CONFLICT (id) DO NOTHING', [TEST_USER_ID]);
        console.log('✔ Test user checked/inserted.');

        // 3. Insert Record
        console.log('Inserting test record...');
        const insertRes = await pool.query(
            'INSERT INTO withdrawal_logs (user_id, path, symptoms, intensity, intensity_label) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [TEST_USER_ID, 'yes-symptoms', [TEST_SYMPTOM], TEST_SEVERITY, 'Moderate']
        );
        const logId = insertRes.rows[0].id;
        console.log(`✔ Test record inserted with ID: ${logId}`);

        // 4. Read Record
        console.log('Reading test record...');
        const readRes = await pool.query('SELECT * FROM withdrawal_logs WHERE id = $1', [logId]);
        if (readRes.rows.length === 1 && Number(readRes.rows[0].intensity) === TEST_SEVERITY) {
            console.log('✔ Test record read successfully.');
        } else {
            throw new Error(`Read failed or data mismatch. Expected intensity ${TEST_SEVERITY}, got ${readRes.rows[0].intensity}`);
        }

        // 5. Delete Record
        console.log('Deleting test record...');
        await pool.query('DELETE FROM withdrawal_logs WHERE id = $1', [logId]);
        console.log('✔ Test record deleted.');

        console.log('\n--- ALL VALIDATIONS PASSED ---');
    } catch (error) {
        console.error('Validation FAILED:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

validate();
