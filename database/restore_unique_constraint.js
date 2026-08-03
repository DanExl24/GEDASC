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
    console.log('Restoring unique constraint on aprendiz_formacion(id_aprendiz, id_formacion)...');

    // Agregar constraint único
    await client.query(`
      ALTER TABLE aprendiz_formacion
      ADD CONSTRAINT unique_id_aprendiz_id_formacion
      UNIQUE (id_aprendiz, id_formacion);
    `);

    console.log('Unique constraint restored successfully!');
  } catch (err) {
    console.error('Failed to restore constraint:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
