import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function test() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('SUCCESS:', res.rows[0].now);
    } catch (err) {
        console.error('FAILURE:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

test();
