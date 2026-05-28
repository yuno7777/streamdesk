import { Pool, QueryResult } from 'pg';

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // Prevent multiple pools in development due to hot reloading
  if (!(global as any)._postgresPool) {
    (global as any)._postgresPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  pool = (global as any)._postgresPool;
}

export const query = (text: string, params?: any[]): Promise<QueryResult> => {
  return pool.query(text, params);
};
