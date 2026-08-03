import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde el directorio raíz del backend
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('Parámetros de conexión:', {
  user: String(process.env.DB_USER || 'postgres'),
  host: String(process.env.DB_HOST || 'localhost'),
  database: String(process.env.DB_NAME || 'GEDACS'),
  passwordSet: !!(process.env.DB_PASSWORD)
});

const pool = new Pool({
  user: String(process.env.DB_USER || 'postgres'),
  password: String(process.env.DB_PASSWORD || ''),
  host: String(process.env.DB_HOST || 'localhost'),
  port: parseInt(process.env.DB_PORT || '5432'),
  database: String(process.env.DB_NAME || 'GEDACS')
});

async function migrate() {
  console.log('Iniciando migración de contraseñas...');

  try {
    const { rows: users } = await pool.query('SELECT id_usuario, password FROM usuarios');

    for (const user of users) {
      // Verificar si ya parece un hash (los hashes de bcrypt empiezan con $2)
      if (user.password.startsWith('$2')) {
        console.log(`Usuario ${user.id_usuario} ya tiene contraseña hasheada. Saltando...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      await pool.query('UPDATE usuarios SET password = $1 WHERE id_usuario = $2', [
        hashedPassword,
        user.id_usuario
      ]);

      console.log(`Usuario ${user.id_usuario} actualizado correctamente.`);
    }

    console.log('Migración completada con éxito.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    await pool.end();
  }
}

migrate();
