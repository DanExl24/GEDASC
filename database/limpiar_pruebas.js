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

  console.log('Cleaning entry, exit, and machine records...');
  try {
    // Truncamos las tablas de ingresos, salidas y firmas de máquinas/vehículos
    // y reiniciamos los contadores secuenciales a 1.
    await client.query('TRUNCATE TABLE detalles_salida, detalles_ingreso, detalles_maquinas RESTART IDENTITY CASCADE;');
    console.log('database cleaned successfully! All entries, exits, and machine signatures have been cleared.');
  } catch (err) {
    console.error('Failed to clean database:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
