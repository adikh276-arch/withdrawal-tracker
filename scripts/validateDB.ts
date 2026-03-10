import * as dotenv from 'dotenv';
dotenv.config();
import { pool, initializeDatabase } from '../src/lib/db.js';

async function validate() {
    const TEST_USER_ID = BigInt('1010101');
    const TEST_SYMPTOM = 'Headache';
    const TEST_SEVERITY = 5;

    try {
        // 1. Connection & Schema
        console.log('Validating connection and schema...');
        await initializeDatabase();
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
        if (readRes.rows.length === 1 && readRes.rows[0].intensity === TEST_SEVERITY) {
            console.log('✔ Test record read successfully.');
        } else {
            throw new Error('Read failed or data mismatch.');
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
