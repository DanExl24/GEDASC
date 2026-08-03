/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'GEDASC'
  });

  await client.connect();
  console.log('Connected to database.');

  try {
    console.log('Altering formaciones table...');

    // 1. Quitar default auto-incremental de id_formacion
    await client.query('ALTER TABLE formaciones ALTER COLUMN id_formacion DROP DEFAULT;');

    // 2. Eliminar columnas nombre y nivel
    await client.query('ALTER TABLE formaciones DROP COLUMN IF EXISTS nombre;');
    await client.query('ALTER TABLE formaciones DROP COLUMN IF EXISTS nivel;');

    console.log('Schema updated successfully! Columns nombre and nivel removed, id_formacion auto-generation dropped.');
  } catch (err) {
    console.error('Failed to alter schema:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
