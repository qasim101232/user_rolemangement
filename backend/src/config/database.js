const { Pool } = require('pg');

// Create pool with explicit configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'auth_db',
  password: String(process.env.DB_PASSWORD || 'qa451290'), // Force string conversion
  port: parseInt(process.env.DB_PORT || '5432', 10),
  // Add these for better connection handling
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your database credentials in .env file');
    return false;
  }
};

module.exports = { pool, testConnection };