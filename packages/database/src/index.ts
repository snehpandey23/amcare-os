import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL Connection
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_SIZE || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('PostgreSQL Database connected');
});

pool.on('error', (err) => {
  console.error('PostgreSQL Database error:', err);
});

// MongoDB Connection and Models
export { default as mongoConnection } from './mongodb/connection';
export * from './mongodb/models';

export default pool;
