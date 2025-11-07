import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pass = process.env.PGPASSWORD;
export const pool = new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: pass == null || pass === '' ? undefined : String(pass),
  ssl: false,
});
