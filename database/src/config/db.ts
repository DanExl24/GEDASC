import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

// Detectar si se está ejecutando localmente en Windows con host configurado como 'postgres'
const dbHost = (process.env.DB_HOST === 'postgres' && process.platform === 'win32') 
  ? 'localhost' 
  : (process.env.DB_HOST || 'localhost');

// crear pool para conectar con la base de datos
export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD ?? 'postgres'),
  host: dbHost,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'GEDASC'
});

// Forzar la zona horaria en cada cliente del pool
pool.on('connect', (client) => {
  client.query("SET TIME ZONE 'America/Bogota'");
});

