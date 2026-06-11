import { Pool } from 'pg'

// crear pool para conectar con la base de datos
export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '', // Force empty string if not provided
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'GEDASC'
});

