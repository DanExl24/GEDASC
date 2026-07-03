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
    console.log('Updating foreign keys to support cascade updates and deletions...');

    // 1. Encontrar y recrear constraint de aprendiz_formacion -> formaciones
    const afFKQuery = await client.query(`
      SELECT constraint_name 
      FROM information_schema.key_column_usage 
      WHERE table_name = 'aprendiz_formacion' AND column_name = 'id_formacion' 
      AND constraint_name NOT LIKE '%_pkey';
    `);
    
    for (const row of afFKQuery.rows) {
      console.log(`Re-creating constraint ${row.constraint_name} on table aprendiz_formacion...`);
      await client.query(`ALTER TABLE aprendiz_formacion DROP CONSTRAINT IF EXISTS "${row.constraint_name}" CASCADE;`);
    }
    await client.query(`
      ALTER TABLE aprendiz_formacion 
      ADD CONSTRAINT fk_aprendiz_formacion_id_formacion 
      FOREIGN KEY (id_formacion) REFERENCES formaciones(id_formacion) 
      ON UPDATE CASCADE ON DELETE CASCADE;
    `);

    // 2. Encontrar y recrear constraint de detalles_ingreso -> formaciones
    const diFKQuery = await client.query(`
      SELECT constraint_name 
      FROM information_schema.key_column_usage 
      WHERE table_name = 'detalles_ingreso' AND column_name = 'id_formacion' 
      AND constraint_name NOT LIKE '%_pkey';
    `);

    for (const row of diFKQuery.rows) {
      console.log(`Re-creating constraint ${row.constraint_name} on table detalles_ingreso...`);
      await client.query(`ALTER TABLE detalles_ingreso DROP CONSTRAINT IF EXISTS "${row.constraint_name}" CASCADE;`);
    }
    await client.query(`
      ALTER TABLE detalles_ingreso 
      ADD CONSTRAINT fk_detalles_ingreso_id_formacion 
      FOREIGN KEY (id_formacion) REFERENCES formaciones(id_formacion) 
      ON UPDATE CASCADE ON DELETE SET NULL;
    `);

    console.log('Foreign keys updated successfully! Cascade updates and deletions are now active.');
  } catch (err) {
    console.error('Failed to update foreign keys:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
