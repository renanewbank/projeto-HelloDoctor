import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  // garante string (ou undefined se vazio)
  password: (process.env.PGPASSWORD ?? undefined)?.toString(),
  ssl: false,
});
